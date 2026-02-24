import type {
  Bird,
  Cloud,
  DifficultyKey,
  EngineConfig,
  EngineEventName,
  EngineEvents,
  GameColors,
  GameConfig,
  Pipe,
} from '@repo/types';
import type { BackgroundSystem } from './background.js';
import { DEFAULT_BANNERS } from './banners.js';
import { type CachedFonts, DEFAULT_COLORS, DEFAULT_FONT, buildFontCache } from './cache.js';
import { DEFAULT_CONFIG, applyDifficulty } from './config.js';
import { EngineEventEmitter } from './engine-events.js';
import { resetEngine, syncPrevBird } from './engine-lifecycle.js';
import { EngineLoop } from './engine-loop.js';
import { createBgSystem, createRenderer, initClouds, setupCanvas } from './engine-setup.js';
import { EngineState } from './engine-state.js';
import { loadHeartImage } from './heart.js';
import { loadBestScores, loadDifficulty } from './persistence.js';
import {
  checkGroundCollision,
  spawnPipe,
  updateBird,
  updateClouds,
  updatePipes,
} from './physics.js';
import { hitTestSettingsIcon } from './renderer-entities.js';
import type { Renderer } from './renderer.js';

export class FlappyEngine {
  private config: GameConfig;
  private colors: GameColors;
  private fonts: CachedFonts;
  private bannerTexts: string[];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private bird: Bird = { y: 0, vy: 0, rot: 0 };
  private prevBird: Bird = { y: 0, vy: 0, rot: 0 };
  private clouds: Cloud[] = [];
  private pipePool: Pipe[] = [];
  private pipeActiveCount = 0;
  private settingsIconHovered = false;
  private events = new EngineEventEmitter();
  private state = new EngineState(this.events);
  private loop = new EngineLoop(this.events);
  private bg: BackgroundSystem;
  private renderer: Renderer;

  constructor(canvas: HTMLCanvasElement, engineConfig?: EngineConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;
    this.colors = { ...DEFAULT_COLORS, ...engineConfig?.colors };
    this.fonts = buildFontCache(engineConfig?.fontFamily ?? DEFAULT_FONT);
    this.bannerTexts = engineConfig?.bannerTexts ?? DEFAULT_BANNERS;
    this.config = { ...DEFAULT_CONFIG };
    this.state.bestScores = loadBestScores();
    this.state.difficulty = engineConfig?.difficulty ?? loadDifficulty();
    applyDifficulty(this.state.difficulty, this.config);
    this.bg = createBgSystem(this.config, this.bannerTexts);
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
  }

  async start(): Promise<void> {
    this.dpr = setupCanvas(this.canvas, this.ctx);
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
    this.renderer.buildGradients();
    this.renderer.heartImg = await loadHeartImage(this.colors.violet);
    this.pipePool = Array.from({ length: 5 }, () => ({ x: 0, topH: 0, scored: false }));
    this.pipeActiveCount = 0;
    this.bird = { y: 0, vy: 0, rot: 0 };
    this.clouds = initClouds(this.config);
    this.bg.init();
    this.renderer.prerenderAllClouds(this.clouds, this.bg);
    this.state.resetGameState(this.bird, this.config);
    syncPrevBird(this.prevBird, this.bird);
    this.loop.begin();
    this.loop.tick(
      performance.now(),
      (dt, now) => this.update(dt, now),
      (now) => this.draw(now),
    );
  }
  stop(): void {
    this.loop.stop();
  }
  destroy(): void {
    this.loop.stop();
    this.events.clearAll();
  }
  flap(): void {
    if (this.state.state === 'paused') return;
    if (this.state.state === 'idle') {
      this.state.setState('play');
      this.bird.vy = this.config.flapForce;
      this.state.lastPipeTime = performance.now();
    } else if (this.state.state === 'play') {
      this.bird.vy = this.config.flapForce;
    } else if (this.state.state === 'dead') {
      if (performance.now() - this.state.deadTime > this.config.resetDelay) {
        this.doReset();
        this.state.setState('play');
        this.bird.vy = this.config.flapForce;
        this.state.lastPipeTime = performance.now();
      }
    }
  }
  setDifficulty(key: DifficultyKey): void {
    this.state.setDifficulty(key, this.config);
    const prevHeartImg = this.renderer.heartImg;
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
    this.renderer.buildGradients();
    this.renderer.heartImg = prevHeartImg;
    this.bg = createBgSystem(this.config, this.bannerTexts);
    this.bg.init();
    this.renderer.prerenderAllClouds(this.clouds, this.bg);
    this.doReset();
  }
  reset(): void {
    this.doReset();
  }
  pause(): void {
    this.state.pause();
  }
  resume(): void {
    this.state.resume();
    if (this.state.state === 'play') this.loop.resetAfterPause();
  }
  getState() {
    return this.state.state;
  }
  getScore() {
    return this.state.score;
  }
  getBestScores() {
    return { ...this.state.bestScores };
  }
  getDifficulty() {
    return this.state.difficulty;
  }
  on<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.on(event, cb);
  }
  off<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.off(event, cb);
  }
  handleClick(cssX: number, cssY: number): boolean {
    const logicalX = (cssX * (this.canvas.width / this.canvas.clientWidth)) / this.dpr;
    const logicalY = (cssY * (this.canvas.height / this.canvas.clientHeight)) / this.dpr;
    this.settingsIconHovered = hitTestSettingsIcon(logicalX, logicalY, this.config.width);
    return this.settingsIconHovered;
  }
  private doReset(): void {
    resetEngine(this.state, this.loop, this.bird, this.prevBird, this.config, (n) => {
      this.pipeActiveCount = n;
    });
  }
  private update(dt: number, now: number): void {
    this.loop.globalTime = now;
    updateClouds(this.clouds, this.config, dt);
    this.bg.update(dt, now, this.state.state === 'play');
    if (this.state.state !== 'play') return;
    syncPrevBird(this.prevBird, this.bird);
    updateBird(this.bird, this.config, dt);
    if (checkGroundCollision(this.bird, this.config)) {
      this.state.die();
      return;
    }
    if (now - this.state.lastPipeTime > this.config.pipeSpawn) {
      this.pipeActiveCount = spawnPipe(this.pipePool, this.pipeActiveCount, this.config);
      this.state.lastPipeTime = now;
    }
    const r = updatePipes(this.pipePool, this.pipeActiveCount, this.bird, this.config, dt);
    this.pipeActiveCount = r.activeCount;
    if (r.scoreInc > 0) this.state.setScore(this.state.score + r.scoreInc);
    if (r.died) this.state.die();
  }
  private draw(now: number): void {
    this.renderer.drawSky();
    this.renderer.drawBackground(this.bg, this.loop.globalTime);
    this.renderer.drawNearClouds(this.clouds);
    this.renderer.drawPipes(this.pipePool, this.pipeActiveCount);
    this.renderer.drawGround(this.bg);
    if (this.state.state !== 'idle') {
      const a = this.loop.alpha;
      const y = this.prevBird.y + (this.bird.y - this.prevBird.y) * a;
      const rot = this.prevBird.rot + (this.bird.rot - this.prevBird.rot) * a;
      this.renderer.drawBird(y, rot);
      this.renderer.drawScore(this.state.score);
      this.renderer.drawSettingsIcon(this.settingsIconHovered);
    }
    this.loop.updateFps(now);
  }
}
