import type { Bird, Cloud, DifficultyKey, EngineConfig, EngineEventName } from '@repo/types';
import type { EngineEvents, GameColors, GameConfig, Pipe } from '@repo/types';
import type { BackgroundSystem } from './background.js';
import type { CachedFonts } from './cache.js';
import { DEFAULT_CONFIG, PIPE_POOL_SIZE, applyDifficulty, validateConfig } from './config.js';
import { DebugMetricsCollector } from './debug-metrics.js';
import { EngineEventEmitter } from './engine-events.js';
import { engineDraw, engineUpdate } from './engine-frame.js';
import { handleFlap, resetEngine, syncPrevBird } from './engine-lifecycle.js';
import { EngineLoop } from './engine-loop.js';
import { createBgSystem, createRenderer, initClouds, setupCanvas } from './engine-setup.js';
import { EngineState } from './engine-state.js';
import { EngineError } from './errors.js';
import { loadHeartImage } from './heart.js';
import { loadBestScores, loadDifficulty } from './persistence.js';
import { hitTestSettingsIcon } from './renderer-entities.js';
import type { Renderer } from './renderer.js';
import { resolveEngineConfig } from './sanitize.js';
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
  private debugCollector: DebugMetricsCollector | null = null;
  constructor(canvas: HTMLCanvasElement, engineConfig?: EngineConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx)
      throw new EngineError('Canvas 2D context not available', 'CANVAS_CONTEXT_UNAVAILABLE');
    this.ctx = ctx;
    const resolved = resolveEngineConfig(engineConfig);
    this.colors = resolved.colors;
    this.fonts = resolved.fonts;
    this.bannerTexts = resolved.bannerTexts;
    this.config = { ...DEFAULT_CONFIG };
    this.state.bestScores = loadBestScores();
    this.state.difficulty = engineConfig?.difficulty ?? loadDifficulty();
    applyDifficulty(this.state.difficulty, this.config);
    validateConfig(this.config);
    this.bg = createBgSystem(this.config, this.bannerTexts);
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
    if (engineConfig?.enableDebug) this.debugCollector = new DebugMetricsCollector(this.events);
  }
  async start(): Promise<void> {
    this.dpr = setupCanvas(this.canvas, this.ctx);
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
    this.renderer.buildGradients();
    this.renderer.heartImg = await Promise.race([
      loadHeartImage(this.colors.violet),
      new Promise<null>((r) => setTimeout(() => r(null), 5000)),
    ]);
    this.pipePool = Array.from({ length: PIPE_POOL_SIZE }, () => ({
      x: 0,
      topH: 0,
      scored: false,
    }));
    this.pipeActiveCount = 0;
    this.bird = { y: 0, vy: 0, rot: 0 };
    this.clouds = initClouds(this.config);
    this.bg.init();
    this.renderer.prerenderAllClouds(this.clouds, this.bg);
    this.state.resetGameState(this.bird, this.config);
    syncPrevBird(this.prevBird, this.bird);
    this.debugCollector?.initSystemInfo(this.canvas, this.dpr);
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
    this.debugCollector?.dispose();
    this.events.clearAll();
  }
  flap(): void {
    handleFlap(this.state, this.bird, this.config, () => this.doReset());
  }
  setDifficulty(key: DifficultyKey): void {
    this.state.setDifficulty(key, this.config);
    const prevHeartImg = this.renderer.heartImg;
    this.renderer.dispose();
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
  getDebugCollector(): DebugMetricsCollector | null {
    return this.debugCollector;
  }
  startDebugRecording(): void {
    this.debugCollector?.startRecording();
  }
  stopDebugRecording() {
    return this.debugCollector?.stopRecording() ?? null;
  }
  private doReset(): void {
    resetEngine(this.state, this.loop, this.bird, this.prevBird, this.config, (n) => {
      this.pipeActiveCount = n;
    });
  }
  private updateMs = 0;
  private update(dt: number, now: number): void {
    const r = engineUpdate(
      this.loop,
      this.state,
      this.config,
      this.bird,
      this.prevBird,
      this.clouds,
      this.bg,
      this.pipePool,
      this.pipeActiveCount,
      this.debugCollector,
      dt,
      now,
    );
    this.pipeActiveCount = r.activeCount;
    this.updateMs = r.updateMs;
  }
  private draw(now: number): void {
    engineDraw(
      this.loop,
      this.state,
      this.renderer,
      this.bg,
      this.clouds,
      this.pipePool,
      this.pipeActiveCount,
      this.bird,
      this.prevBird,
      this.settingsIconHovered,
      this.debugCollector,
      this.updateMs,
      now,
    );
  }
}
