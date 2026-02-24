import type { EngineEventEmitter } from './engine-events.js';

const TICK_MS = 1000 / 60;
const MAX_TICKS = 4;

/** Fixed-timestep game loop driven by requestAnimationFrame. */
export class EngineLoop {
  rafId: number | null = null;
  frameTime = 0;
  accumulator = 0;
  globalTime = 0;

  private fpsFrames = 0;
  private fpsLastTime = 0;
  private fpsDisplay = 0;

  constructor(private events: EngineEventEmitter) {}

  /** Initialize timing state to prepare for the first tick. */
  begin(): void {
    this.frameTime = performance.now();
    this.fpsLastTime = this.frameTime;
    this.accumulator = 0;
  }

  /** Advance the simulation by consuming accumulated time, then draw and schedule the next frame. */
  tick(
    rafTimestamp: number,
    updateFn: (dt: number, now: number) => void,
    drawFn: (now: number) => void,
  ): void {
    const now = rafTimestamp || performance.now();
    const delta = now - this.frameTime;
    this.frameTime = now;

    this.accumulator += delta;
    let ticks = 0;
    while (this.accumulator >= TICK_MS && ticks < MAX_TICKS) {
      updateFn(1, now);
      this.accumulator -= TICK_MS;
      ticks++;
    }
    if (ticks >= MAX_TICKS) this.accumulator = 0;

    drawFn(now);
    this.rafId = requestAnimationFrame((t) => this.tick(t, updateFn, drawFn));
  }

  /** Cancel the running animation frame loop. */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
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
}
