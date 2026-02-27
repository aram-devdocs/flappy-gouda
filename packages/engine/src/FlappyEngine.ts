import type { Bird, Cloud, DifficultyKey, EngineConfig, EngineEventName } from '@repo/types';
import type { EngineEvents, GameColors, GameConfig, Pipe } from '@repo/types';
import type { BackgroundSystem } from './background';
import type { CachedFonts } from './cache';
import { loadCheeseImage } from './cheese';
import { DEFAULT_CONFIG, PIPE_POOL_SIZE, applyDifficulty, validateConfig } from './config';
import { DebugMetricsCollector } from './debug-metrics';
import { EngineEventEmitter } from './engine-events';
import { engineDraw, engineUpdate } from './engine-frame';
import { handleFlap, resetEngine, syncPrevBird } from './engine-lifecycle';
import { EngineLoop } from './engine-loop';
import { createBgSystem, createRenderer, initClouds, setupCanvas } from './engine-setup';
import { EngineState } from './engine-state';
import { EngineError } from './errors';
import { loadBestScores, loadDifficulty } from './persistence';
import type { Renderer } from './renderer';
import { hitTestSettingsIcon } from './renderer-entities';
import { resolveEngineConfig } from './sanitize';
/**
 * Core game engine that owns all game logic: physics, collision, scoring,
 * entity lifecycle, and the fixed-timestep game loop.
 *
 * Framework-agnostic -- communicates state changes via a typed event emitter.
 * React integration is handled by `@repo/hooks`; this class never touches the DOM
 * beyond the canvas it receives at construction time.
 */
export class FlappyEngine {
  private config: GameConfig;
  private colors: GameColors;
  private fonts: CachedFonts;
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
    this.config = { ...DEFAULT_CONFIG };
    this.state.bestScores = loadBestScores();
    this.state.difficulty = engineConfig?.difficulty ?? loadDifficulty();
    applyDifficulty(this.state.difficulty, this.config);
    validateConfig(this.config);
    this.bg = createBgSystem(this.config);
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
    if (engineConfig?.enableDebug) this.debugCollector = new DebugMetricsCollector(this.events);
  }
  /** Initialize the canvas, preload assets, and kick off the game loop. */
  async start(): Promise<void> {
    this.dpr = setupCanvas(this.canvas, this.ctx);
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
    this.renderer.buildGradients();
    this.renderer.spriteImg = await Promise.race([
      loadCheeseImage(this.colors.violet),
      new Promise<null>((r) => setTimeout(() => r(null), 5000)),
    ]);
    this.pipePool = Array.from({ length: PIPE_POOL_SIZE }, () => ({
      x: 0,
      topH: 0,
      scored: false,
      gap: 0,
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
  /** Stop the game loop. The engine can be restarted with {@link start}. */
  stop(): void {
    this.loop.stop();
  }
  /** Stop the loop, dispose debug collector, and remove all event listeners. */
  destroy(): void {
    this.loop.stop();
    this.debugCollector?.dispose();
    this.events.clearAll();
  }
  /** Apply an upward impulse to the bird, or restart after death. */
  flap(): void {
    handleFlap(this.state, this.bird, this.config, () => this.doReset());
  }
  /** Change the difficulty preset, rebuild renderer/background, and reset the game. */
  setDifficulty(key: DifficultyKey): void {
    this.state.setDifficulty(key, this.config);
    const prevSpriteImg = this.renderer.spriteImg;
    this.renderer.dispose();
    this.renderer = createRenderer(this.ctx, this.config, this.colors, this.fonts, this.dpr);
    this.renderer.buildGradients();
    this.renderer.spriteImg = prevSpriteImg;
    this.bg = createBgSystem(this.config);
    this.bg.init();
    this.renderer.prerenderAllClouds(this.clouds, this.bg);
    this.doReset();
  }
  /** Reset the game to idle state without changing difficulty or configuration. */
  reset(): void {
    this.doReset();
  }
  /** Pause the game if currently playing. Emits a `stateChange` event. */
  pause(): void {
    this.state.pause();
  }
  /** Resume from a paused state and reset the loop's delta accumulator. */
  resume(): void {
    this.state.resume();
    if (this.state.state === 'play') this.loop.resetAfterPause();
  }
  /** Return the current game state (`idle`, `play`, `dead`, or `paused`). */
  getState() {
    return this.state.state;
  }
  /** Return the current score for the active run. */
  getScore() {
    return this.state.score;
  }
  /** Return a shallow copy of the best scores record, keyed by difficulty. */
  getBestScores() {
    return { ...this.state.bestScores };
  }
  /** Return the active difficulty key. */
  getDifficulty() {
    return this.state.difficulty;
  }
  /** Subscribe to an engine event. See {@link EngineEvents} for the full event map. */
  on<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.on(event, cb);
  }
  /** Unsubscribe a previously registered event listener. */
  off<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.off(event, cb);
  }
  /** Hit-test a CSS-space click against the settings icon. Returns `true` if it was hit. */
  handleClick(cssX: number, cssY: number): boolean {
    const logicalX = (cssX * (this.canvas.width / this.canvas.clientWidth)) / this.dpr;
    const logicalY = (cssY * (this.canvas.height / this.canvas.clientHeight)) / this.dpr;
    this.settingsIconHovered = hitTestSettingsIcon(logicalX, logicalY, this.config.width);
    return this.settingsIconHovered;
  }
  /** Return the debug metrics collector, or `null` if debug mode is disabled. */
  getDebugCollector(): DebugMetricsCollector | null {
    return this.debugCollector;
  }
  /** Begin recording debug metric snapshots for later export. No-op if debug is disabled. */
  startDebugRecording(): void {
    this.debugCollector?.startRecording();
  }
  /** Stop recording and return the captured snapshots, or `null` if debug is disabled. */
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
