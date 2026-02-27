import type { Bird, GameColors, GameConfig } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_COLORS, buildFontCache } from '../cache';
import { loadCheeseImage } from '../cheese';
import { BASE_H, BASE_W, DEFAULT_CONFIG } from '../config';
import { EngineEventEmitter } from '../engine-events';
import { syncPrevBird } from '../engine-lifecycle';
import { EngineLoop } from '../engine-loop';
import { createBgSystem, createRenderer, initClouds, setupCanvas } from '../engine-setup';
import { EngineState } from '../engine-state';
import { roundRectPath } from '../math';

// Module-level mocks -- vi.mock is hoisted by vitest
vi.mock('../persistence.js', () => ({
  saveBestScores: vi.fn(),
  saveDifficulty: vi.fn(),
}));

vi.mock('../config.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config.js')>();
  return { ...actual, applyDifficulty: vi.fn() };
});

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

function makeBird(overrides: Partial<Bird> = {}): Bird {
  return { y: 200, vy: 0, rot: 0, ...overrides };
}

function makeCanvasContext(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    setTransform: vi.fn(),
    quadraticCurveTo: vi.fn(),
    canvas: { width: 400, height: 600, style: {} } as unknown as HTMLCanvasElement,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
  } as unknown as CanvasRenderingContext2D;
}

// ---------------------------------------------------------------------------
// EngineEventEmitter
// ---------------------------------------------------------------------------

describe('EngineEventEmitter', () => {
  let emitter: EngineEventEmitter;

  beforeEach(() => {
    emitter = new EngineEventEmitter();
  });

  it('registers a listener and emits events to it', () => {
    const cb = vi.fn();
    emitter.on('scoreChange', cb);
    emitter.emit('scoreChange', 5);
    expect(cb).toHaveBeenCalledWith(5);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('supports multiple listeners on the same event', () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    emitter.on('scoreChange', cb1);
    emitter.on('scoreChange', cb2);
    emitter.emit('scoreChange', 10);
    expect(cb1).toHaveBeenCalledWith(10);
    expect(cb2).toHaveBeenCalledWith(10);
  });

  it('supports listeners on different events', () => {
    const scoreCb = vi.fn();
    const stateCb = vi.fn();
    emitter.on('scoreChange', scoreCb);
    emitter.on('stateChange', stateCb);
    emitter.emit('scoreChange', 1);
    emitter.emit('stateChange', 'play');
    expect(scoreCb).toHaveBeenCalledWith(1);
    expect(stateCb).toHaveBeenCalledWith('play');
  });

  it('off removes a specific listener', () => {
    const cb = vi.fn();
    emitter.on('scoreChange', cb);
    emitter.off('scoreChange', cb);
    emitter.emit('scoreChange', 1);
    expect(cb).not.toHaveBeenCalled();
  });

  it('off is a no-op when removing a listener that was never registered', () => {
    const cb = vi.fn();
    // No event set exists yet -- should not throw
    emitter.off('scoreChange', cb);
    emitter.emit('scoreChange', 1);
    expect(cb).not.toHaveBeenCalled();
  });

  it('emit is a no-op for events with no listeners', () => {
    // Should not throw when no listener set exists
    expect(() => emitter.emit('fpsUpdate', 60)).not.toThrow();
  });

  it('clearAll removes all listeners for all events', () => {
    const scoreCb = vi.fn();
    const stateCb = vi.fn();
    emitter.on('scoreChange', scoreCb);
    emitter.on('stateChange', stateCb);
    emitter.clearAll();
    emitter.emit('scoreChange', 99);
    emitter.emit('stateChange', 'dead');
    expect(scoreCb).not.toHaveBeenCalled();
    expect(stateCb).not.toHaveBeenCalled();
  });

  it('does not duplicate listeners when on is called twice with same callback', () => {
    const cb = vi.fn();
    emitter.on('scoreChange', cb);
    emitter.on('scoreChange', cb);
    emitter.emit('scoreChange', 7);
    // Set prevents duplicates
    expect(cb).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// EngineState
// ---------------------------------------------------------------------------

describe('EngineState', () => {
  let emitter: EngineEventEmitter;
  let state: EngineState;

  beforeEach(() => {
    vi.clearAllMocks();
    emitter = new EngineEventEmitter();
    state = new EngineState(emitter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('setState', () => {
    it('updates state and emits stateChange', () => {
      const cb = vi.fn();
      emitter.on('stateChange', cb);
      state.setState('play');
      expect(state.state).toBe('play');
      expect(cb).toHaveBeenCalledWith('play');
    });

    it('does not emit when state is unchanged', () => {
      const cb = vi.fn();
      emitter.on('stateChange', cb);
      state.setState('idle');
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('setScore', () => {
    it('updates score and emits scoreChange', () => {
      const cb = vi.fn();
      emitter.on('scoreChange', cb);
      state.setScore(5);
      expect(state.score).toBe(5);
      expect(cb).toHaveBeenCalledWith(5);
    });

    it('does not emit when score is unchanged', () => {
      const cb = vi.fn();
      emitter.on('scoreChange', cb);
      state.setScore(0);
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('resetGameState', () => {
    it('resets bird, score, state, and timing fields', () => {
      const cfg = makeConfig();
      const bird = makeBird({ y: 100, vy: 5, rot: 0.3 });
      state.score = 10;
      state.state = 'dead';
      state.lastPipeTime = 5000;
      state.deadTime = 3000;

      state.resetGameState(bird, cfg);

      expect(bird.y).toBe(cfg.height / 2 - 30);
      expect(bird.vy).toBe(0);
      expect(bird.rot).toBe(0);
      expect(state.score).toBe(0);
      expect(state.state).toBe('idle');
      expect(state.lastPipeTime).toBe(0);
      expect(state.deadTime).toBe(0);
    });

    it('clears prevStateBeforePause and pausedTime', () => {
      const cfg = makeConfig();
      const bird = makeBird();
      state.prevStateBeforePause = 'play';
      state.pausedTime = 5000;

      state.resetGameState(bird, cfg);

      expect(state.prevStateBeforePause).toBeNull();
      expect(state.pausedTime).toBe(0);
    });

    it('emits scoreChange and stateChange events during reset', () => {
      const scoreCb = vi.fn();
      const stateCb = vi.fn();
      emitter.on('scoreChange', scoreCb);
      emitter.on('stateChange', stateCb);

      state.score = 5;
      state.state = 'dead';
      scoreCb.mockClear();
      stateCb.mockClear();

      state.resetGameState(makeBird(), makeConfig());

      expect(scoreCb).toHaveBeenCalledWith(0);
      expect(stateCb).toHaveBeenCalledWith('idle');
    });
  });

  describe('die', () => {
    it('sets state to dead and records deadTime', () => {
      vi.spyOn(performance, 'now').mockReturnValue(12345);
      state.state = 'play';
      state.score = 0;
      state.die();
      expect(state.state).toBe('dead');
      expect(state.deadTime).toBe(12345);
    });

    it('saves new best score when current score exceeds best', async () => {
      const { saveBestScores } = await import('../persistence.js');
      const bestCb = vi.fn();
      emitter.on('bestScoreChange', bestCb);

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      state.state = 'play';
      state.score = 15;
      state.bestScores = { easy: 0, normal: 10, hard: 0, souls: 0 };
      state.difficulty = 'normal';

      state.die();

      expect(state.bestScores.normal).toBe(15);
      expect(saveBestScores).toHaveBeenCalledWith({ easy: 0, normal: 15, hard: 0, souls: 0 });
      expect(bestCb).toHaveBeenCalledWith({ easy: 0, normal: 15, hard: 0, souls: 0 });
    });

    it('does not save best score when current score does not exceed best', () => {
      const bestCb = vi.fn();
      emitter.on('bestScoreChange', bestCb);

      vi.spyOn(performance, 'now').mockReturnValue(1000);
      state.state = 'play';
      state.score = 3;
      state.bestScores = { easy: 0, normal: 10, hard: 0, souls: 0 };
      state.difficulty = 'normal';

      state.die();

      expect(state.bestScores.normal).toBe(10);
      expect(bestCb).not.toHaveBeenCalled();
    });
  });

  describe('setDifficulty', () => {
    it('changes difficulty, calls applyDifficulty, saves, and emits', async () => {
      const { applyDifficulty } = await import('../config.js');
      const { saveDifficulty } = await import('../persistence.js');
      const diffCb = vi.fn();
      emitter.on('difficultyChange', diffCb);

      const cfg = makeConfig();
      state.setDifficulty('hard', cfg);

      expect(state.difficulty).toBe('hard');
      expect(applyDifficulty).toHaveBeenCalledWith('hard', cfg);
      expect(saveDifficulty).toHaveBeenCalledWith('hard');
      expect(diffCb).toHaveBeenCalledWith('hard');
    });

    it('does nothing when setting the same difficulty', () => {
      const diffCb = vi.fn();
      emitter.on('difficultyChange', diffCb);
      state.setDifficulty('normal', makeConfig());
      expect(diffCb).not.toHaveBeenCalled();
    });
  });

  describe('pause', () => {
    it('pauses when state is play', () => {
      vi.spyOn(performance, 'now').mockReturnValue(5000);
      const stateCb = vi.fn();
      emitter.on('stateChange', stateCb);

      state.state = 'play';
      state.pause();

      expect(state.prevStateBeforePause).toBe('play');
      expect(state.pausedTime).toBe(5000);
      expect(state.state).toBe('paused');
      expect(stateCb).toHaveBeenCalledWith('paused');
    });

    it('does nothing when state is not play', () => {
      const stateCb = vi.fn();
      emitter.on('stateChange', stateCb);

      state.state = 'idle';
      state.pause();

      expect(state.state).toBe('idle');
      expect(state.prevStateBeforePause).toBeNull();
      expect(stateCb).not.toHaveBeenCalled();
    });

    it('does nothing when state is dead', () => {
      state.state = 'dead';
      state.pause();
      expect(state.state).toBe('dead');
    });
  });

  describe('resume', () => {
    it('resumes to play when paused from play', () => {
      vi.spyOn(performance, 'now').mockReturnValue(7000);
      state.state = 'paused';
      state.prevStateBeforePause = 'play';
      state.pausedTime = 5000;
      state.lastPipeTime = 1000;

      state.resume();

      expect(state.lastPipeTime).toBe(3000);
      expect(state.state).toBe('play');
      expect(state.prevStateBeforePause).toBeNull();
    });

    it('clears prevStateBeforePause even when conditions are not met', () => {
      state.state = 'idle';
      state.prevStateBeforePause = 'play';
      state.resume();
      expect(state.prevStateBeforePause).toBeNull();
      expect(state.state).toBe('idle');
    });

    it('does nothing when paused but prevStateBeforePause is not play', () => {
      state.state = 'paused';
      state.prevStateBeforePause = null;
      const lastPipe = state.lastPipeTime;

      state.resume();

      expect(state.lastPipeTime).toBe(lastPipe);
      expect(state.state).toBe('paused');
      expect(state.prevStateBeforePause).toBeNull();
    });
  });
});

// ---------------------------------------------------------------------------
// EngineLoop
// ---------------------------------------------------------------------------

describe('EngineLoop', () => {
  let emitter: EngineEventEmitter;
  let loop: EngineLoop;

  beforeEach(() => {
    emitter = new EngineEventEmitter();
    loop = new EngineLoop(emitter);

    let rafId = 0;
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => ++rafId),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('begin', () => {
    it('initializes frameTime and resets accumulator', () => {
      vi.spyOn(performance, 'now').mockReturnValue(1000);
      loop.begin();
      expect(loop.frameTime).toBe(1000);
      expect(loop.accumulator).toBe(0);
    });
  });

  describe('tick', () => {
    it('calls updateFn for each accumulated tick and drawFn once', () => {
      const updateFn = vi.fn();
      const drawFn = vi.fn();
      const TICK_MS = 1000 / 60;

      loop.frameTime = 1000;
      const twoTicks = TICK_MS * 2 + 1;

      loop.tick(1000 + twoTicks, updateFn, drawFn);

      expect(updateFn).toHaveBeenCalledTimes(2);
      expect(updateFn).toHaveBeenCalledWith(1, 1000 + twoTicks);
      expect(drawFn).toHaveBeenCalledTimes(1);
      expect(drawFn).toHaveBeenCalledWith(1000 + twoTicks);
      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(loop.rafId).toBe(1);
    });

    it('caps ticks at MAX_TICKS (4) and resets accumulator', () => {
      const updateFn = vi.fn();
      const drawFn = vi.fn();
      const TICK_MS = 1000 / 60;

      loop.frameTime = 0;
      loop.tick(TICK_MS * 10, updateFn, drawFn);

      expect(updateFn).toHaveBeenCalledTimes(4);
      expect(loop.accumulator).toBe(0);
    });

    it('falls back to performance.now() when rafTimestamp is 0', () => {
      vi.spyOn(performance, 'now').mockReturnValue(2000);
      const updateFn = vi.fn();
      const drawFn = vi.fn();

      loop.frameTime = 2000;
      loop.tick(0, updateFn, drawFn);

      expect(updateFn).not.toHaveBeenCalled();
      expect(drawFn).toHaveBeenCalledWith(2000);
    });

    it('does not call updateFn when delta is less than one tick', () => {
      const updateFn = vi.fn();
      const drawFn = vi.fn();

      loop.frameTime = 1000;
      loop.tick(1005, updateFn, drawFn);

      expect(updateFn).not.toHaveBeenCalled();
      expect(drawFn).toHaveBeenCalledTimes(1);
    });

    it('schedules next frame via requestAnimationFrame', () => {
      const updateFn = vi.fn();
      const drawFn = vi.fn();
      loop.frameTime = 0;

      loop.tick(100, updateFn, drawFn);

      expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
      expect(loop.rafId).toBe(1);
    });
  });

  describe('stop', () => {
    it('cancels the animation frame and clears rafId', () => {
      loop.rafId = 42;
      loop.stop();
      expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
      expect(loop.rafId).toBeNull();
    });

    it('does nothing when rafId is null', () => {
      loop.rafId = null;
      loop.stop();
      expect(cancelAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe('updateFps', () => {
    it('does not emit when less than 1000ms has elapsed', () => {
      const fpsCb = vi.fn();
      emitter.on('fpsUpdate', fpsCb);

      vi.spyOn(performance, 'now').mockReturnValue(0);
      loop.begin();
      loop.updateFps(500);

      expect(fpsCb).not.toHaveBeenCalled();
    });

    it('emits fpsUpdate with raw count on first boundary (fpsDisplay starts at 0)', () => {
      const fpsCb = vi.fn();
      emitter.on('fpsUpdate', fpsCb);

      vi.spyOn(performance, 'now').mockReturnValue(0);
      loop.begin();

      // Simulate 60 calls within the first second
      for (let i = 0; i < 60; i++) {
        loop.updateFps(500);
      }
      // Trigger the 1-second boundary
      loop.updateFps(1001);

      // 61 total calls to updateFps, fpsDisplay was 0 so first time uses raw
      expect(fpsCb).toHaveBeenCalledTimes(1);
      expect(fpsCb).toHaveBeenCalledWith(61);
    });

    it('emits smoothed fpsUpdate on subsequent boundaries', () => {
      const fpsCb = vi.fn();
      emitter.on('fpsUpdate', fpsCb);

      vi.spyOn(performance, 'now').mockReturnValue(0);
      loop.begin();

      // First second: 60 calls + 1 boundary trigger
      for (let i = 0; i < 60; i++) {
        loop.updateFps(500);
      }
      loop.updateFps(1001); // fpsDisplay = 61

      fpsCb.mockClear();

      // Second second: 30 calls + 1 boundary trigger
      for (let i = 0; i < 30; i++) {
        loop.updateFps(1500);
      }
      loop.updateFps(2002);

      expect(fpsCb).toHaveBeenCalledTimes(1);
      const emitted = fpsCb.mock.calls[0]?.[0] as number;
      expect(emitted).toBe(Math.round(61 * 0.7 + 31 * 0.3));
    });
  });

  describe('resetAfterPause', () => {
    it('resets frameTime to current time and clears accumulator', () => {
      vi.spyOn(performance, 'now').mockReturnValue(9000);
      loop.accumulator = 500;
      loop.frameTime = 1000;

      loop.resetAfterPause();

      expect(loop.frameTime).toBe(9000);
      expect(loop.accumulator).toBe(0);
    });
  });

  describe('alpha', () => {
    it('computes alpha as accumulator fraction after tick', () => {
      const updateFn = vi.fn();
      const drawFn = vi.fn();
      const TICK_MS = 1000 / 60;

      // Set up: 1.5 ticks worth of delta
      loop.frameTime = 1000;
      loop.tick(1000 + TICK_MS * 1.5, updateFn, drawFn);

      // 1 full tick consumed, 0.5 tick remaining
      expect(updateFn).toHaveBeenCalledTimes(1);
      expect(loop.alpha).toBeCloseTo(0.5, 1);
    });

    it('alpha is near 0 when delta is exactly one tick from zero base', () => {
      const updateFn = vi.fn();
      const drawFn = vi.fn();
      const TICK_MS = 1000 / 60;

      // Use 0 as base to avoid floating point precision loss
      loop.frameTime = 0;
      loop.tick(TICK_MS, updateFn, drawFn);

      expect(updateFn).toHaveBeenCalledTimes(1);
      expect(loop.alpha).toBeLessThan(0.01);
    });
  });

  describe('visibility change', () => {
    let addEventSpy: ReturnType<typeof vi.fn>;
    let removeEventSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      addEventSpy = vi.fn();
      removeEventSpy = vi.fn();
      vi.stubGlobal('document', {
        hidden: false,
        addEventListener: addEventSpy,
        removeEventListener: removeEventSpy,
      });
    });

    it('attaches visibilitychange listener on begin', () => {
      loop.begin();
      expect(addEventSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });

    it('cancels RAF when document becomes hidden', () => {
      loop.begin();
      const handler = addEventSpy.mock.calls[0]?.[1] as () => void;

      loop.rafId = 99;
      (document as unknown as { hidden: boolean }).hidden = true;
      handler();

      expect(cancelAnimationFrame).toHaveBeenCalledWith(99);
      expect(loop.rafId).toBeNull();
    });

    it('resets accumulator and re-schedules when document becomes visible', () => {
      vi.spyOn(performance, 'now').mockReturnValue(5000);
      loop.begin();
      const handler = addEventSpy.mock.calls[0]?.[1] as () => void;

      // Simulate a tick to store updateFn/drawFn
      const updateFn = vi.fn();
      const drawFn = vi.fn();
      loop.frameTime = 5000;
      loop.tick(5000, updateFn, drawFn);

      // Now simulate hidden → visible
      (document as unknown as { hidden: boolean }).hidden = false;
      vi.spyOn(performance, 'now').mockReturnValue(8000);
      handler();

      expect(loop.accumulator).toBe(0);
      expect(loop.frameTime).toBe(8000);
      // RAF was called once by tick + once by visibility handler
      expect(requestAnimationFrame).toHaveBeenCalledTimes(2);
    });

    it('detaches visibilitychange listener on stop', () => {
      loop.begin();
      loop.stop();
      expect(removeEventSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });
  });
});

// ---------------------------------------------------------------------------
// cheese.ts
// ---------------------------------------------------------------------------

describe('loadCheeseImage', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    mockRevokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves with an HTMLImageElement on successful load', async () => {
    let capturedOnload: (() => void) | null = null;
    let capturedSrc = '';
    const mockImg = {
      set onload(fn: () => void) {
        capturedOnload = fn;
      },
      set onerror(_fn: () => void) {
        // no-op
      },
      set src(val: string) {
        capturedSrc = val;
        queueMicrotask(() => capturedOnload?.());
      },
      get src() {
        return capturedSrc;
      },
    };
    vi.stubGlobal(
      'Image',
      vi.fn(() => mockImg),
    );

    const result = await loadCheeseImage('#ff0000');

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(result).toBe(mockImg);
  });

  it('resolves with null on image load error', async () => {
    let capturedOnerror: (() => void) | null = null;
    let capturedSrc = '';
    const mockImg = {
      set onload(_fn: () => void) {
        // no-op
      },
      set onerror(fn: () => void) {
        capturedOnerror = fn;
      },
      set src(val: string) {
        capturedSrc = val;
        queueMicrotask(() => capturedOnerror?.());
      },
      get src() {
        return capturedSrc;
      },
    };
    vi.stubGlobal(
      'Image',
      vi.fn(() => mockImg),
    );

    const result = await loadCheeseImage('#00ff00');

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    expect(result).toBeNull();
  });

  it('replaces FILL placeholder in SVG with the provided color', async () => {
    let capturedBlobContent: string[] = [];
    const OriginalBlob = globalThis.Blob;
    vi.stubGlobal(
      'Blob',
      class MockBlob extends OriginalBlob {
        constructor(parts: BlobPart[], options?: BlobPropertyBag) {
          super(parts, options);
          capturedBlobContent = parts.map((p) => String(p));
        }
      },
    );

    const mockImg = {
      onload: null as (() => void) | null,
      onerror: null as (() => void) | null,
      set src(_val: string) {
        queueMicrotask(() => this.onload?.());
      },
      get src() {
        return '';
      },
    };
    vi.stubGlobal(
      'Image',
      vi.fn(() => mockImg),
    );

    await loadCheeseImage('#abcdef');

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    const svgContent = capturedBlobContent.join('');
    expect(svgContent).toContain('#abcdef');
    expect(svgContent).not.toContain('FILL');
  });
});

// ---------------------------------------------------------------------------
// math.ts -- roundRectPath
// ---------------------------------------------------------------------------

describe('roundRectPath', () => {
  it('calls all expected canvas path methods', () => {
    const ctx = makeCanvasContext();
    roundRectPath(ctx, 10, 20, 100, 50, 8);

    expect(ctx.beginPath).toHaveBeenCalledTimes(1);
    expect(ctx.moveTo).toHaveBeenCalledTimes(1);
    expect(ctx.lineTo).toHaveBeenCalledTimes(4);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledTimes(4);
    expect(ctx.closePath).toHaveBeenCalledTimes(1);
  });

  it('moveTo starts at (x + r, y)', () => {
    const ctx = makeCanvasContext();
    roundRectPath(ctx, 10, 20, 100, 50, 8);
    expect(ctx.moveTo).toHaveBeenCalledWith(18, 20);
  });

  it('traces correct lineTo coordinates for top, right, bottom, left edges', () => {
    const ctx = makeCanvasContext();
    const x = 10;
    const y = 20;
    const w = 100;
    const h = 50;
    const r = 8;

    roundRectPath(ctx, x, y, w, h, r);

    expect(ctx.lineTo).toHaveBeenCalledWith(x + w - r, y);
    expect(ctx.lineTo).toHaveBeenCalledWith(x + w, y + h - r);
    expect(ctx.lineTo).toHaveBeenCalledWith(x + r, y + h);
    expect(ctx.lineTo).toHaveBeenCalledWith(x, y + r);
  });

  it('traces correct quadraticCurveTo for all four corners', () => {
    const ctx = makeCanvasContext();
    const x = 0;
    const y = 0;
    const w = 200;
    const h = 100;
    const r = 10;

    roundRectPath(ctx, x, y, w, h, r);

    expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(x + w, y, x + w, y + r);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(x + w, y + h, x + w - r, y + h);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(x, y + h, x, y + h - r);
    expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(x, y, x + r, y);
  });

  it('handles zero radius', () => {
    const ctx = makeCanvasContext();
    roundRectPath(ctx, 5, 5, 50, 30, 0);

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.closePath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalledWith(5, 5);
  });
});

// ---------------------------------------------------------------------------
// engine-setup.ts
// ---------------------------------------------------------------------------

describe('setupCanvas', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets canvas dimensions and returns dpr', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 1024, devicePixelRatio: 2 });
    const ctx = makeCanvasContext();
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
    } as unknown as HTMLCanvasElement;

    const dpr = setupCanvas(canvas, ctx);

    expect(dpr).toBe(2);
    expect(canvas.width).toBe(BASE_W * 2);
    expect(canvas.height).toBe(BASE_H * 2);
    expect(ctx.scale).toHaveBeenCalledWith(2, 2);
  });

  it('computes CSS dimensions when innerWidth is narrow', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 300, devicePixelRatio: 1 });
    const ctx = makeCanvasContext();
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
    } as unknown as HTMLCanvasElement;

    const dpr = setupCanvas(canvas, ctx);

    expect(dpr).toBe(1);
    const maxCssW = Math.min(BASE_W, 300 - 48);
    const cssScale = maxCssW / BASE_W;
    expect(canvas.style.width).toBe(`${Math.round(BASE_W * cssScale)}px`);
    expect(canvas.style.height).toBe(`${Math.round(BASE_H * cssScale)}px`);
  });

  it('defaults dpr to 1 when devicePixelRatio is falsy', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 1024, devicePixelRatio: 0 });
    const ctx = makeCanvasContext();
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
    } as unknown as HTMLCanvasElement;

    const dpr = setupCanvas(canvas, ctx);
    expect(dpr).toBe(1);
    expect(canvas.width).toBe(BASE_W);
  });

  it('clamps CSS width to BASE_W when window is very wide', () => {
    vi.stubGlobal('window', { ...window, innerWidth: 2000, devicePixelRatio: 1 });
    const ctx = makeCanvasContext();
    const canvas = {
      width: 0,
      height: 0,
      style: { width: '', height: '' },
    } as unknown as HTMLCanvasElement;

    setupCanvas(canvas, ctx);
    expect(canvas.style.width).toBe(`${BASE_W}px`);
    expect(canvas.style.height).toBe(`${BASE_H}px`);
  });
});

describe('initClouds', () => {
  it('creates the specified number of clouds', () => {
    const cfg = makeConfig({ cloudCount: 5 });
    const clouds = initClouds(cfg);
    expect(clouds).toHaveLength(5);
  });

  it('creates clouds with valid properties', () => {
    const cfg = makeConfig({ cloudCount: 3 });
    const clouds = initClouds(cfg);

    for (const cloud of clouds) {
      expect(cloud.x).toBeGreaterThanOrEqual(0);
      expect(cloud.x).toBeLessThanOrEqual(cfg.width);
      expect(cloud.y).toBeGreaterThanOrEqual(30);
      expect(cloud.w).toBeGreaterThanOrEqual(40);
      expect(cloud.w).toBeLessThanOrEqual(90);
      expect(cloud.speed).toBeGreaterThanOrEqual(0.15);
      expect(cloud.speed).toBeLessThanOrEqual(0.4);
      expect(cloud._canvas).toBeNull();
      expect(cloud._pad).toBe(0);
      expect(cloud._logW).toBe(0);
      expect(cloud._logH).toBe(0);
    }
  });

  it('creates empty array when cloudCount is 0', () => {
    const cfg = makeConfig({ cloudCount: 0 });
    const clouds = initClouds(cfg);
    expect(clouds).toHaveLength(0);
  });
});

describe('createBgSystem', () => {
  it('returns a BackgroundSystem with null layers', () => {
    const cfg = makeConfig();
    const bg = createBgSystem(cfg);
    expect(bg).toBeDefined();
    expect(bg.layers).toBeNull();
  });
});

describe('createRenderer', () => {
  it('returns a Renderer with all expected public methods', () => {
    const ctx = makeCanvasContext();
    const cfg = makeConfig();
    const colors: GameColors = { ...DEFAULT_COLORS };
    const fonts = buildFontCache('"Poppins", sans-serif');

    const renderer = createRenderer(ctx, cfg, colors, fonts, 2);

    expect(renderer).toBeDefined();
    expect(typeof renderer.drawSky).toBe('function');
    expect(typeof renderer.drawBird).toBe('function');
    expect(typeof renderer.drawScore).toBe('function');
    expect(typeof renderer.drawGround).toBe('function');
    expect(typeof renderer.buildGradients).toBe('function');
    expect(typeof renderer.drawPipes).toBe('function');
    expect(typeof renderer.drawNearClouds).toBe('function');
    expect(typeof renderer.drawBackground).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Bird flicker regression (prevBird/bird divergence during non-play states)
// ---------------------------------------------------------------------------

describe('bird flicker regression', () => {
  it('syncPrevBird eliminates interpolation oscillation for divergent birds', () => {
    // Arrange -- simulate the post-transition state where prevBird and bird diverge
    const prevBird = makeBird({ y: 200, vy: 0, rot: 0 });
    const bird = makeBird({ y: 210, vy: -3, rot: 0.15 });

    // Act -- sync prevBird (what the fix does on every non-play tick)
    syncPrevBird(prevBird, bird);

    // Assert -- interpolation is now stable regardless of alpha
    for (const alpha of [0, 0.25, 0.5, 0.75, 1]) {
      const interpolatedY = prevBird.y + (bird.y - prevBird.y) * alpha;
      const interpolatedRot = prevBird.rot + (bird.rot - prevBird.rot) * alpha;
      expect(interpolatedY).toBe(bird.y);
      expect(interpolatedRot).toBe(bird.rot);
    }
  });

  it('without sync, divergent birds produce unstable interpolation', () => {
    // Arrange -- divergent state (the bug scenario)
    const prevBird = makeBird({ y: 200, vy: 0, rot: 0 });
    const bird = makeBird({ y: 210, vy: -3, rot: 0.15 });

    // Act & Assert -- different alpha values produce different positions
    const y0 = prevBird.y + (bird.y - prevBird.y) * 0;
    const y1 = prevBird.y + (bird.y - prevBird.y) * 1;
    expect(y0).not.toBe(y1);
  });
});
