import type {
  BestScores,
  Bird,
  Cloud,
  DifficultyKey,
  EngineConfig,
  EngineEventName,
  EngineEvents,
  GameColors,
  GameConfig,
  GameState,
  Pipe,
} from '@repo/types';
import { BackgroundSystem } from './background.js';
import { DEFAULT_BANNERS } from './banners.js';
import { DEFAULT_COLORS, DEFAULT_FONT, buildFontCache } from './cache.js';
import type { CachedFonts } from './cache.js';
import { BASE_H, BASE_W, DEFAULT_CONFIG, applyDifficulty } from './config.js';
import { loadHeartImage } from './heart.js';
import { loadBestScores, loadDifficulty, saveBestScores, saveDifficulty } from './persistence.js';
import {
  checkGroundCollision,
  spawnPipe,
  updateBird,
  updateClouds,
  updatePipes,
} from './physics.js';
import { Renderer } from './renderer.js';

const FIXED_DT = 1;
const TICK_MS = 1000 / 60;
const MAX_TICKS = 4;

type Listener<K extends EngineEventName> = EngineEvents[K];

export class FlappyEngine {
  // Public state
  private _state: GameState = 'idle';
  private _score = 0;
  private _bestScores: BestScores = { easy: 0, normal: 0, hard: 0 };
  private _difficulty: DifficultyKey = 'normal';

  // Config
  private config: GameConfig;
  private colors: GameColors;
  private fonts: CachedFonts;
  private bannerTexts: string[];

  // Canvas
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;

  // Game objects
  private bird: Bird = { y: 0, vy: 0, rot: 0 };
  private clouds: Cloud[] = [];
  private pipePool: Pipe[] = [];
  private pipeActiveCount = 0;

  // Timing
  private rafId: number | null = null;
  private frameTime = 0;
  private accumulator = 0;
  private lastPipeTime = 0;
  private deadTime = 0;
  private globalTime = 0;
  private pausedTime = 0;
  private prevStateBeforePause: GameState | null = null;

  // FPS
  private fpsFrames = 0;
  private fpsLastTime = 0;
  private fpsDisplay = 0;
  private fpsRaw = 0;

  // Subsystems
  private bg: BackgroundSystem;
  private renderer: Renderer;

  // Events
  private listeners: Map<EngineEventName, Set<Listener<EngineEventName>>> = new Map();

  constructor(canvas: HTMLCanvasElement, engineConfig?: EngineConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    // Merge colors
    this.colors = { ...DEFAULT_COLORS, ...engineConfig?.colors };
    const fontFamily = engineConfig?.fontFamily ?? DEFAULT_FONT;
    this.fonts = buildFontCache(fontFamily);
    this.bannerTexts = engineConfig?.bannerTexts ?? DEFAULT_BANNERS;

    // Config
    this.config = { ...DEFAULT_CONFIG };

    // Load persisted state
    this._bestScores = loadBestScores();
    this._difficulty = engineConfig?.difficulty ?? loadDifficulty();
    applyDifficulty(this._difficulty, this.config);

    // Init subsystems
    this.bg = new BackgroundSystem({
      width: this.config.width,
      height: this.config.height,
      groundH: this.config.groundH,
      pipeSpeed: this.config.pipeSpeed,
      bannerTexts: this.bannerTexts,
    });

    this.renderer = new Renderer(
      this.ctx,
      {
        width: this.config.width,
        height: this.config.height,
        groundH: this.config.groundH,
        pipeWidth: this.config.pipeWidth,
        pipeGap: this.config.pipeGap,
        birdSize: this.config.birdSize,
        birdX: this.config.birdX,
      },
      this.colors,
      this.fonts,
      this.dpr,
    );
  }

  async start(): Promise<void> {
    // HiDPI setup
    const maxCssW = Math.min(BASE_W, window.innerWidth - 48);
    const cssScale = maxCssW / BASE_W;
    const cssW = Math.round(BASE_W * cssScale);
    const cssH = Math.round(BASE_H * cssScale);

    this.dpr = window.devicePixelRatio || 1;
    this.canvas.width = BASE_W * this.dpr;
    this.canvas.height = BASE_H * this.dpr;
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;
    this.ctx.scale(this.dpr, this.dpr);

    // Rebuild renderer with correct dpr
    this.renderer = new Renderer(
      this.ctx,
      {
        width: this.config.width,
        height: this.config.height,
        groundH: this.config.groundH,
        pipeWidth: this.config.pipeWidth,
        pipeGap: this.config.pipeGap,
        birdSize: this.config.birdSize,
        birdX: this.config.birdX,
      },
      this.colors,
      this.fonts,
      this.dpr,
    );

    this.renderer.buildGradients();

    // Load heart image
    this.renderer.heartImg = await loadHeartImage(this.colors.violet);

    // Pre-allocate pipe pool
    this.pipePool = [];
    for (let i = 0; i < 5; i++) {
      this.pipePool[i] = { x: 0, topH: 0, scored: false };
    }
    this.pipeActiveCount = 0;

    // Init bird
    this.bird = { y: 0, vy: 0, rot: 0 };

    // Init clouds
    this.initClouds();

    // Init background
    this.bg.init();

    // Prerender
    this.renderer.prerenderAllClouds(this.clouds, this.bg);

    // Reset state
    this.resetGameState();

    // Start loop
    this.frameTime = performance.now();
    this.fpsLastTime = this.frameTime;
    this.accumulator = 0;
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy(): void {
    this.stop();
    this.listeners.clear();
  }

  flap(): void {
    if (this._state === 'paused') return;

    if (this._state === 'idle') {
      this.setState('play');
      this.bird.vy = this.config.flapForce;
      this.lastPipeTime = performance.now();
    } else if (this._state === 'play') {
      this.bird.vy = this.config.flapForce;
    } else if (this._state === 'dead') {
      if (performance.now() - this.deadTime > this.config.resetDelay) {
        this.resetGameState();
        this.setState('play');
        this.bird.vy = this.config.flapForce;
        this.lastPipeTime = performance.now();
      }
    }
  }

  setDifficulty(key: DifficultyKey): void {
    if (key === this._difficulty) return;
    this._difficulty = key;
    applyDifficulty(key, this.config);
    saveDifficulty(key);

    // Update bg pipeSpeed reference
    this.bg = new BackgroundSystem({
      width: this.config.width,
      height: this.config.height,
      groundH: this.config.groundH,
      pipeSpeed: this.config.pipeSpeed,
      bannerTexts: this.bannerTexts,
    });
    this.bg.init();
    this.renderer.prerenderAllClouds(this.clouds, this.bg);

    this.resetGameState();
    this.emit('difficultyChange', key);
  }

  reset(): void {
    this.resetGameState();
  }

  pause(): void {
    if (this._state === 'play') {
      this.prevStateBeforePause = 'play';
      this.pausedTime = performance.now();
      this.setState('paused');
    }
  }

  resume(): void {
    if (this._state === 'paused' && this.prevStateBeforePause === 'play') {
      const elapsed = performance.now() - this.pausedTime;
      this.lastPipeTime += elapsed;
      this.frameTime = performance.now();
      this.accumulator = 0;
      this.setState('play');
    }
    this.prevStateBeforePause = null;
  }

  // Getters
  getState(): GameState {
    return this._state;
  }
  getScore(): number {
    return this._score;
  }
  getBestScores(): BestScores {
    return { ...this._bestScores };
  }
  getDifficulty(): DifficultyKey {
    return this._difficulty;
  }

  // Events
  on<K extends EngineEventName>(event: K, callback: EngineEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as Listener<EngineEventName>);
  }

  off<K extends EngineEventName>(event: K, callback: EngineEvents[K]): void {
    this.listeners.get(event)?.delete(callback as Listener<EngineEventName>);
  }

  private emit<K extends EngineEventName>(event: K, ...args: Parameters<EngineEvents[K]>): void {
    const cbs = this.listeners.get(event);
    if (!cbs) return;
    for (const cb of cbs) {
      (cb as (...a: Parameters<EngineEvents[K]>) => void)(...args);
    }
  }

  private setState(state: GameState): void {
    if (this._state === state) return;
    this._state = state;
    this.emit('stateChange', state);
  }

  private setScore(score: number): void {
    if (this._score === score) return;
    this._score = score;
    this.emit('scoreChange', score);
  }

  private resetGameState(): void {
    this.bird.y = this.config.height / 2 - 30;
    this.bird.vy = 0;
    this.bird.rot = 0;
    this.pipeActiveCount = 0;
    this.setScore(0);
    this.setState('idle');
    this.lastPipeTime = 0;
    this.deadTime = 0;
  }

  private die(): void {
    this.setState('dead');
    this.deadTime = performance.now();
    if (this._score > this._bestScores[this._difficulty]) {
      this._bestScores[this._difficulty] = this._score;
      saveBestScores(this._bestScores);
      this.emit('bestScoreChange', { ...this._bestScores });
    }
  }

  private initClouds(): void {
    this.clouds = [];
    for (let i = 0; i < this.config.cloudCount; i++) {
      this.clouds.push({
        x: Math.random() * this.config.width,
        y: 30 + Math.random() * (this.config.height * 0.35),
        w: 40 + Math.random() * 50,
        speed: 0.15 + Math.random() * 0.25,
        _canvas: null,
        _pad: 0,
        _logW: 0,
        _logH: 0,
      });
    }
  }

  private loop(rafTimestamp: number): void {
    const now = rafTimestamp || performance.now();
    const delta = now - this.frameTime;
    this.frameTime = now;

    this.accumulator += delta;
    let ticks = 0;
    while (this.accumulator >= TICK_MS && ticks < MAX_TICKS) {
      this.update(FIXED_DT, now);
      this.accumulator -= TICK_MS;
      ticks++;
    }
    if (ticks >= MAX_TICKS) this.accumulator = 0;

    this.draw(now);
    this.rafId = requestAnimationFrame((t) => this.loop(t));
  }

  private update(dt: number, now: number): void {
    this.globalTime = now;

    // Clouds always drift
    updateClouds(this.clouds, this.config, dt);

    // Background
    this.bg.update(dt, now, this._state === 'play');

    if (this._state === 'idle' || this._state === 'dead' || this._state === 'paused') return;

    // Bird physics
    updateBird(this.bird, this.config, dt);

    // Ground collision
    if (checkGroundCollision(this.bird, this.config)) {
      this.die();
      return;
    }

    // Spawn pipes
    if (now - this.lastPipeTime > this.config.pipeSpawn) {
      this.pipeActiveCount = spawnPipe(this.pipePool, this.pipeActiveCount, this.config);
      this.lastPipeTime = now;
    }

    // Update pipes
    const result = updatePipes(this.pipePool, this.pipeActiveCount, this.bird, this.config, dt);
    this.pipeActiveCount = result.activeCount;
    if (result.scoreInc > 0) {
      this.setScore(this._score + result.scoreInc);
    }
    if (result.died) {
      this.die();
    }
  }

  private draw(now: number): void {
    // Sky
    this.renderer.drawSky();

    // Background
    this.renderer.drawBackground(this.bg, this.globalTime);

    // Near clouds
    this.renderer.drawNearClouds(this.clouds);

    // Pipes
    this.renderer.drawPipes(this.pipePool, this.pipeActiveCount);

    // Ground
    this.renderer.drawGround(this.bg);

    // Bird (only during play & dead)
    if (this._state !== 'idle') {
      this.renderer.drawBird(this.bird.y, this.bird.rot);
    }

    // Score
    if (this._state !== 'idle') {
      this.renderer.drawScore(this._score);
    }

    // FPS
    this.updateFps(now);
  }

  private updateFps(now: number): void {
    this.fpsFrames++;
    if (now - this.fpsLastTime >= 1000) {
      this.fpsRaw = this.fpsFrames;
      this.fpsFrames = 0;
      this.fpsLastTime = now;
      this.fpsDisplay = this.fpsDisplay
        ? Math.round(this.fpsDisplay * 0.7 + this.fpsRaw * 0.3)
        : this.fpsRaw;
      this.emit('fpsUpdate', this.fpsDisplay);
    }
  }
}
