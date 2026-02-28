import type {
  Bird,
  CanvasStack,
  Cloud,
  DifficultyKey,
  EngineConfig,
  EngineEventName,
  EngineEvents,
  GameColors,
  GameConfig,
  Pipe,
  ProgressionState,
} from '@repo/types';
import { GameState as GS } from '@repo/types';
import type { BackgroundSystem } from './background';
import type { CachedFonts } from './cache';
import { DEFAULT_CONFIG, applyDifficulty, validateConfig } from './config';
import { DebugMetricsCollector } from './debug-metrics';
import { getDifficultyProfile } from './difficulty-profiles';
import { EngineEventEmitter } from './engine-events';
import { handleFlap, resetEngine, syncPrevBird } from './engine-lifecycle';
import { EngineLoop } from './engine-loop';
import { bootEngine, createBgSystem, createRenderer, getContextStack } from './engine-setup';
import { EngineState } from './engine-state';
import { tickDraw, tickUpdate } from './engine-tick';
import type { GameFeelState } from './game-feel';
import { createGameFeelState, resetGameFeel } from './game-feel';
import { loadBestScores, loadDifficulty } from './persistence';
import { PipeDirector } from './pipe-director';
import { ProgressionManager } from './progression';
import type { Renderer } from './renderer';
import { hitTestSettingsIcon } from './renderer-entities';
import type { CanvasContexts } from './renderer-fg';
import { prerenderAllClouds } from './renderer-prerender';
import { resolveEngineConfig } from './sanitize';

export class FlappyEngine {
  config: GameConfig;
  colors: GameColors;
  fonts: CachedFonts;
  canvasStack: CanvasStack;
  ctxStack: CanvasContexts;
  dpr = 1;
  bird: Bird = { y: 0, vy: 0, rot: 0 };
  prevBird: Bird = { y: 0, vy: 0, rot: 0 };
  clouds: Cloud[] = [];
  pipePool: Pipe[] = [];
  pipeActiveCount = 0;
  settingsIconHovered = false;
  private events = new EngineEventEmitter();
  state = new EngineState(this.events);
  loop = new EngineLoop(this.events);
  bg: BackgroundSystem;
  renderer: Renderer;
  debugCollector: DebugMetricsCollector | null = null;
  gameFeel: GameFeelState = createGameFeelState();
  progression!: ProgressionManager;
  director!: PipeDirector;
  constructor(canvasStack: CanvasStack, engineConfig?: EngineConfig) {
    this.canvasStack = canvasStack;
    this.ctxStack = getContextStack(canvasStack);
    const resolved = resolveEngineConfig(engineConfig);
    this.colors = resolved.colors;
    this.fonts = resolved.fonts;
    this.config = { ...DEFAULT_CONFIG };
    this.state.bestScores = loadBestScores();
    this.state.difficulty = engineConfig?.difficulty ?? loadDifficulty();
    applyDifficulty(this.state.difficulty, this.config);
    validateConfig(this.config);
    this.bg = createBgSystem(this.config);
    this.renderer = createRenderer(this.ctxStack, this.config, this.colors, this.fonts, this.dpr);
    if (engineConfig?.enableDebug) this.debugCollector = new DebugMetricsCollector(this.events);
    this.initProgression(this.state.difficulty);
    this.events.on('scoreChange', (score: number) => this.progression.onScore(score));
  }
  async start(): Promise<void> {
    const boot = await bootEngine(
      this.canvasStack,
      this.ctxStack,
      this.config,
      this.colors,
      this.fonts,
      this.bg,
    );
    this.dpr = boot.dpr;
    this.renderer = boot.renderer;
    this.pipePool = boot.pipePool;
    this.pipeActiveCount = 0;
    this.bird = { y: 0, vy: 0, rot: 0 };
    this.clouds = boot.clouds;
    this.state.resetGameState(this.bird, this.config);
    syncPrevBird(this.prevBird, this.bird);
    this.debugCollector?.initSystemInfo(this.canvasStack.fg, this.dpr);
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
  flap(): void {
    handleFlap(this.state, this.bird, this.config, () => this.doReset());
  }
  reset(): void {
    this.doReset();
  }
  pause(): void {
    this.state.pause();
  }
  destroy(): void {
    this.loop.stop();
    this.debugCollector?.dispose();
    this.events.clearAll();
  }
  setDifficulty(key: DifficultyKey): void {
    this.state.setDifficulty(key, this.config);
    const prevSpriteImg = this.renderer.spriteImg;
    this.renderer.dispose();
    this.renderer = createRenderer(this.ctxStack, this.config, this.colors, this.fonts, this.dpr);
    this.renderer.buildGradients();
    this.renderer.spriteImg = prevSpriteImg;
    this.bg = createBgSystem(this.config);
    this.bg.init();
    prerenderAllClouds(this.clouds, this.bg, this.dpr, this.colors);
    this.initProgression(key);
    this.doReset();
  }
  resume(): void {
    this.state.resume();
    if (this.state.state === GS.Play) this.loop.resetAfterPause();
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
  getGameFeelState(): Readonly<GameFeelState> {
    return this.gameFeel;
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
  getProgressionState(): ProgressionState {
    return this.progression.snapshot(this.director.currentArc);
  }
  on<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.on(event, cb);
  }
  off<K extends EngineEventName>(event: K, cb: EngineEvents[K]): void {
    this.events.off(event, cb);
  }
  handleClick(cssX: number, cssY: number): boolean {
    const fg = this.canvasStack.fg;
    const logicalX = (cssX * (fg.width / fg.clientWidth)) / this.dpr;
    const logicalY = (cssY * (fg.height / fg.clientHeight)) / this.dpr;
    this.settingsIconHovered = hitTestSettingsIcon(logicalX, logicalY, this.config.width);
    return this.settingsIconHovered;
  }
  private initProgression(key: DifficultyKey): void {
    const profile = getDifficultyProfile(key);
    this.progression = new ProgressionManager(profile, this.config, this.events);
    this.director = new PipeDirector(this.progression, profile, this.config);
    if (this.debugCollector) {
      const dc = this.debugCollector;
      this.director.setLogFn((type, msg, data) => dc.logEvent(type, msg, data));
    }
  }
  private doReset(): void {
    resetEngine(this.state, this.loop, this.bird, this.prevBird, this.config, (n) => {
      this.pipeActiveCount = n;
    });
    resetGameFeel(this.gameFeel);
    this.progression.reset();
    this.director.reset();
  }
  updateMs = 0;
  private update(dt: number, now: number): void {
    this.updateMs = tickUpdate(this, dt, now);
  }
  private draw(now: number): void {
    tickDraw(this, this.updateMs, now);
  }
}
