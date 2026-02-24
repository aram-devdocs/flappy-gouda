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
import { DEFAULT_COLORS, DEFAULT_FONT, buildFontCache } from './cache.js';
import type { CachedFonts } from './cache.js';
import { DEFAULT_CONFIG } from './config.js';
import { EngineEventEmitter } from './engine-events.js';
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
import type { Renderer } from './renderer.js';

/** Core game engine managing physics, scoring, and entity lifecycle. */
export class FlappyEngine {
  private config: GameConfig;
  private colors: GameColors;
  private fonts: CachedFonts;
  private bannerTexts: string[];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private bird: Bird = { y: 0, vy: 0, rot: 0 };
  private clouds: Cloud[] = [];
  private pipePool: Pipe[] = [];
  private pipeActiveCount = 0;
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
    this.bg = createBgSystem(this.config, this.bannerTexts);
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
  }

  /** Initialize the canvas, load assets, and start the game loop. */
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
    this.loop.begin();
    this.loop.tick(
      performance.now(),
      (dt, now) => this.update(dt, now),
      (now) => this.draw(now),
    );
  }

  /** Stop the game loop without cleaning up event listeners. */
  stop(): void {
    this.loop.stop();
  }

  /** Stop the game loop and remove all event listeners. */
  destroy(): void {
    this.loop.stop();
    this.events.clearAll();
  }

  /** Apply a flap impulse to the bird. Does nothing when dead or paused. */
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
        this.state.resetGameState(this.bird, this.config);
        this.state.setState('play');
        this.bird.vy = this.config.flapForce;
        this.state.lastPipeTime = performance.now();
      }
    }
  }

  /** Switch to a new difficulty, rebuild background, and reset. */
  setDifficulty(key: DifficultyKey): void {
    this.state.setDifficulty(key, this.config);
    this.bg = createBgSystem(this.config, this.bannerTexts);
    this.bg.init();
    this.renderer.prerenderAllClouds(this.clouds, this.bg);
    this.state.resetGameState(this.bird, this.config);
  }

  /** Reset the game to idle state without changing difficulty. */
  reset(): void {
    this.state.resetGameState(this.bird, this.config);
  }

  /** Pause gameplay. Only effective during active play. */
  pause(): void {
    this.state.pause();
  }

  /** Resume gameplay after a pause. */
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

  /** Subscribe to an engine event. */
  on<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.on(event, cb);
  }

  /** Unsubscribe from an engine event. */
  off<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.off(event, cb);
  }

  private update(dt: number, now: number): void {
    this.loop.globalTime = now;
    updateClouds(this.clouds, this.config, dt);
    this.bg.update(dt, now, this.state.state === 'play');
    if (this.state.state !== 'play') return;
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
      this.renderer.drawBird(this.bird.y, this.bird.rot);
      this.renderer.drawScore(this.state.score);
    }
    this.loop.updateFps(now);
  }
}
