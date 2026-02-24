import type { EngineEventEmitter } from './engine-events.js';
import { createLogger } from './logger.js';

const log = createLogger('EngineLoop');
const TICK_MS = 1000 / 60;
const MAX_TICKS = 4;

/** Fixed-timestep game loop driven by requestAnimationFrame. */
export class EngineLoop {
  rafId: number | null = null;
  frameTime = 0;
  accumulator = 0;
  globalTime = 0;
  alpha = 0;
  reducedMotion = false;

  private fpsFrames = 0;
  private fpsLastTime = 0;
  private fpsDisplay = 0;
  private storedUpdateFn: ((dt: number, now: number) => void) | null = null;
  private storedDrawFn: ((now: number) => void) | null = null;
  private visibilityHandler: (() => void) | null = null;

  constructor(private events: EngineEventEmitter) {}

  /** Initialize timing state, attach visibility listener, and prepare for the first tick. */
  begin(): void {
    this.frameTime = performance.now();
    this.fpsLastTime = this.frameTime;
    this.accumulator = 0;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    this.attachVisibilityHandler();
  }

  /** Advance the simulation by consuming accumulated time, then draw and schedule the next frame. */
  tick(
    rafTimestamp: number,
    updateFn: (dt: number, now: number) => void,
    drawFn: (now: number) => void,
  ): void {
    this.storedUpdateFn = updateFn;
    this.storedDrawFn = drawFn;

    const now = rafTimestamp || performance.now();
    const delta = now - this.frameTime;
    this.frameTime = now;

    this.accumulator += delta;
    let ticks = 0;
    while (this.accumulator >= TICK_MS && ticks < MAX_TICKS) {
      try {
        updateFn(1, now);
      } catch (err) {
        log.error('Update tick failed', { error: String(err) });
        this.stop();
        return;
      }
      this.accumulator -= TICK_MS;
      ticks++;
    }
    if (ticks >= MAX_TICKS) this.accumulator = 0;

    this.alpha = this.accumulator / TICK_MS;

    try {
      drawFn(now);
    } catch (err) {
      log.error('Draw frame failed', { error: String(err) });
      this.stop();
      return;
    }
    this.rafId = requestAnimationFrame((t) => this.tick(t, updateFn, drawFn));
  }

  /** Cancel the running animation frame loop and detach visibility listener. */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.detachVisibilityHandler();
  }

  /** Sample frame count and emit a smoothed FPS value once per second. */
  updateFps(now: number): void {
    this.fpsFrames++;
    if (now - this.fpsLastTime >= 1000) {
      const raw = this.fpsFrames;
      this.fpsFrames = 0;
      this.fpsLastTime = now;
      this.fpsDisplay = this.fpsDisplay ? Math.round(this.fpsDisplay * 0.7 + raw * 0.3) : raw;
      this.events.emit('fpsUpdate', this.fpsDisplay);
    }
  }

  /** Reset the frame clock and accumulator so the first tick after unpause has no time spike. */
  resetAfterPause(): void {
    this.frameTime = performance.now();
    this.accumulator = 0;
  }

  private attachVisibilityHandler(): void {
    this.detachVisibilityHandler();
    this.visibilityHandler = () => {
      if (document.hidden) {
        if (this.rafId !== null) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      } else {
        this.resetAfterPause();
        if (this.storedUpdateFn && this.storedDrawFn) {
          const u = this.storedUpdateFn;
          const d = this.storedDrawFn;
          this.rafId = requestAnimationFrame((t) => this.tick(t, u, d));
        }
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private detachVisibilityHandler(): void {
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
      this.visibilityHandler = null;
    }
  }
}
