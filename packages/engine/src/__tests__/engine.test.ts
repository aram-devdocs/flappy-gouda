import type { Bird, GameConfig, Pipe } from '@repo/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BackgroundSystem } from '../background';
import { DEFAULT_COLORS, buildFontCache } from '../cache';
import { DEFAULT_CONFIG, DIFFICULTY, applyDifficulty } from '../config';
import { EngineError } from '../errors';
import { createLogger } from '../logger';
import { TAU, maxOf } from '../math';
import { loadBestScores, loadDifficulty, saveBestScores, saveDifficulty } from '../persistence';
import {
  checkGroundCollision,
  checkPipeCollision,
  checkPipeScore,
  spawnPipe,
  updateBird,
  updatePipes,
} from '../physics';
import { drawBird, drawPipes, drawScore } from '../renderer-entities';
import { generateSkylineSegment } from '../skyline';

// --- Factories ---

function makeBird(overrides: Partial<Bird> = {}): Bird {
  return { y: 200, vy: 0, rot: 0, ...overrides };
}

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

function makePipe(overrides: Partial<Pipe> = {}): Pipe {
  return { x: 200, topH: 100, scored: false, gap: DEFAULT_CONFIG.pipeGap, ...overrides };
}

// --- physics.ts ---

describe('updateBird', () => {
  it('applies gravity each tick', () => {
    const bird = makeBird();
    const cfg = makeConfig();
    updateBird(bird, cfg, 1);
    expect(bird.vy).toBeCloseTo(cfg.gravity);
    expect(bird.y).toBeCloseTo(200 + cfg.gravity);
  });

  it('clamps vy to terminalVel', () => {
    const bird = makeBird({ vy: 100 });
    const cfg = makeConfig();
    updateBird(bird, cfg, 1);
    expect(bird.vy).toBe(cfg.terminalVel);
  });

  it('clamps bird to ceiling and zeroes vy', () => {
    const bird = makeBird({ y: -5, vy: -3 });
    updateBird(bird, makeConfig(), 1);
    expect(bird.y).toBe(0);
    expect(bird.vy).toBe(0);
  });

  it('updates rotation toward target', () => {
    const bird = makeBird({ vy: 5 });
    updateBird(bird, makeConfig(), 1);
    expect(bird.rot).not.toBe(0);
  });

  it('rotation converges >80% of target within 10 ticks', () => {
    const bird = makeBird({ vy: 10 });
    const cfg = makeConfig();
    for (let i = 0; i < 10; i++) {
      updateBird(bird, cfg, 1);
    }
    const target = Math.max(-20, Math.min(55, bird.vy * 3.2));
    expect(Math.abs(bird.rot - target) / Math.abs(target)).toBeLessThan(0.2);
  });
});

describe('checkGroundCollision', () => {
  it('returns true when bird bottom reaches ground', () => {
    const cfg = makeConfig();
    const groundY = cfg.height - cfg.groundH;
    const bird = makeBird({ y: groundY - cfg.birdSize + 1 });
    expect(checkGroundCollision(bird, cfg)).toBe(true);
  });

  it('returns false when bird is above ground', () => {
    const bird = makeBird({ y: 100 });
    expect(checkGroundCollision(bird, makeConfig())).toBe(false);
  });
});

describe('checkPipeCollision', () => {
  it('detects collision with top pipe section', () => {
    const cfg = makeConfig({ hitboxPad: 0 });
    // Bird at birdX, y=0; pipe at birdX with topH=50 (bird flies into top pipe)
    const bird = makeBird({ y: 0 });
    const pipe = makePipe({ x: cfg.birdX, topH: 50 });
    expect(checkPipeCollision(bird, pipe, cfg)).toBe(true);
  });

  it('detects collision with bottom pipe section', () => {
    const cfg = makeConfig({ hitboxPad: 0 });
    // Bird y just below gap end
    const pipe = makePipe({ x: cfg.birdX, topH: 100 });
    const bird = makeBird({ y: 100 + cfg.pipeGap - cfg.birdSize + 1 });
    expect(checkPipeCollision(bird, pipe, cfg)).toBe(true);
  });

  it('returns false when bird passes through the gap', () => {
    const cfg = makeConfig({ hitboxPad: 0 });
    const pipe = makePipe({ x: cfg.birdX, topH: 100 });
    // Bird centered in the gap
    const bird = makeBird({ y: 100 + 10 });
    expect(checkPipeCollision(bird, pipe, cfg)).toBe(false);
  });

  it('returns false when pipe is not horizontally overlapping', () => {
    const cfg = makeConfig();
    const pipe = makePipe({ x: 400 });
    const bird = makeBird({ y: 200 });
    expect(checkPipeCollision(bird, pipe, cfg)).toBe(false);
  });
});

describe('checkPipeScore', () => {
  it('returns true when unscored pipe has passed birdX', () => {
    const cfg = makeConfig();
    const pipe = makePipe({ x: cfg.birdX - cfg.pipeWidth - 1, scored: false });
    expect(checkPipeScore(pipe, cfg)).toBe(true);
  });

  it('returns false when pipe is already scored', () => {
    const cfg = makeConfig();
    const pipe = makePipe({ x: 0, scored: true });
    expect(checkPipeScore(pipe, cfg)).toBe(false);
  });

  it('returns false when pipe has not yet passed birdX', () => {
    const cfg = makeConfig();
    const pipe = makePipe({ x: cfg.birdX + 10, scored: false });
    expect(checkPipeScore(pipe, cfg)).toBe(false);
  });
});

describe('spawnPipe', () => {
  it('adds a pipe to the pool and increments count', () => {
    const cfg = makeConfig();
    const pool: Pipe[] = [makePipe(), makePipe()];
    const next = spawnPipe(pool, 0, cfg);
    expect(next).toBe(1);
    const spawned = pool[0] as Pipe;
    expect(spawned.x).toBe(cfg.width);
    expect(spawned.scored).toBe(false);
    expect(spawned.topH).toBeGreaterThan(0);
  });

  it('does not exceed pool length', () => {
    const cfg = makeConfig();
    const pool: Pipe[] = [makePipe()];
    const next = spawnPipe(pool, 1, cfg);
    expect(next).toBe(1);
  });
});

describe('updatePipes', () => {
  it('moves pipes left and scores when past birdX', () => {
    const cfg = makeConfig({ hitboxPad: 0 });
    // Place pipe so it already satisfies checkPipeScore after zero movement:
    // condition: pipe.x + pipeWidth < birdX  =>  x < birdX - pipeWidth
    const pipe = makePipe({ x: cfg.birdX - cfg.pipeWidth - 1, topH: 0, scored: false });
    const pool: Pipe[] = [pipe];
    const bird = makeBird({ y: 200 });
    const result = updatePipes(pool, 1, bird, cfg, 0);
    expect(result.scoreInc).toBe(1);
    expect(pipe.scored).toBe(true);
  });

  it('removes off-screen pipes', () => {
    const cfg = makeConfig();
    const pipe = makePipe({ x: -cfg.pipeWidth - 10 });
    const pool: Pipe[] = [pipe];
    const bird = makeBird({ y: 200 });
    const result = updatePipes(pool, 1, bird, cfg, 1);
    expect(result.activeCount).toBe(0);
  });

  it('returns died=true on collision', () => {
    const cfg = makeConfig({ hitboxPad: 0 });
    // Pipe overlapping bird horizontally, bird hits top section
    const pipe = makePipe({ x: cfg.birdX, topH: 300 });
    const pool: Pipe[] = [pipe];
    const bird = makeBird({ y: 0 });
    const result = updatePipes(pool, 1, bird, cfg, 0);
    expect(result.died).toBe(true);
  });
});

// --- config.ts ---

describe('DEFAULT_CONFIG', () => {
  it('has required shape with positive numeric values', () => {
    expect(DEFAULT_CONFIG.width).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.height).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.gravity).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.pipeGap).toBeGreaterThan(0);
    expect(DEFAULT_CONFIG.birdX).toBeGreaterThan(0);
  });
});

describe('applyDifficulty', () => {
  it('applies easy preset', () => {
    const cfg = makeConfig();
    applyDifficulty('easy', cfg);
    expect(cfg.gravity).toBe(DIFFICULTY.easy.gravity);
    expect(cfg.pipeGap).toBe(DIFFICULTY.easy.pipeGap);
    expect(cfg.hitboxPad).toBe(DIFFICULTY.easy.hitboxPad);
  });

  it('applies normal preset', () => {
    const cfg = makeConfig();
    applyDifficulty('normal', cfg);
    expect(cfg.gravity).toBe(DIFFICULTY.normal.gravity);
    expect(cfg.pipeSpeed).toBe(DIFFICULTY.normal.pipeSpeed);
  });

  it('applies hard preset with tighter hitbox', () => {
    const cfg = makeConfig();
    applyDifficulty('hard', cfg);
    expect(cfg.gravity).toBe(DIFFICULTY.hard.gravity);
    expect(cfg.pipeGap).toBeLessThan(DIFFICULTY.normal.pipeGap);
    expect(cfg.hitboxPad).toBeLessThan(DIFFICULTY.normal.hitboxPad);
  });
});

// --- persistence.ts ---

describe('persistence', () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });
  });

  it('loadBestScores returns zeroed defaults when empty', () => {
    const scores = loadBestScores();
    expect(scores).toEqual({ easy: 0, normal: 0, hard: 0, souls: 0 });
  });

  it('saveBestScores/loadBestScores round-trip', () => {
    saveBestScores({ easy: 3, normal: 10, hard: 7, souls: 0 });
    const scores = loadBestScores();
    expect(scores).toEqual({ easy: 3, normal: 10, hard: 7, souls: 0 });
  });

  it('saveDifficulty/loadDifficulty round-trip', () => {
    saveDifficulty('hard');
    expect(loadDifficulty()).toBe('hard');
  });

  it('loadDifficulty returns normal for unknown value', () => {
    localStorage.setItem('fg-flappy-diff', 'invalid');
    expect(loadDifficulty()).toBe('normal');
  });

  it('loadBestScores handles missing localStorage gracefully', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('no storage');
      },
      setItem: () => {},
      removeItem: () => {},
    });
    expect(() => loadBestScores()).not.toThrow();
    expect(loadBestScores()).toEqual({ easy: 0, normal: 0, hard: 0, souls: 0 });
  });
});

// --- math.ts ---

describe('TAU', () => {
  it('equals 2 * Math.PI', () => {
    expect(TAU).toBe(Math.PI * 2);
  });
});

describe('maxOf', () => {
  it('returns the maximum mapped value', () => {
    expect(maxOf([1, 5, 3], (x) => x)).toBe(5);
  });

  it('works with object arrays', () => {
    const items = [{ v: 2 }, { v: 9 }, { v: 4 }];
    expect(maxOf(items, (x) => x.v)).toBe(9);
  });

  it('returns -Infinity for empty array', () => {
    expect(maxOf([], (x: number) => x)).toBe(Number.NEGATIVE_INFINITY);
  });
});

// --- Canvas context factory for renderer tests ---

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
    canvas: { width: 400, height: 600 } as unknown as HTMLCanvasElement,
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

// --- background.ts ---

describe('BackgroundSystem', () => {
  it('constructor creates an instance with null layers', () => {
    const bg = new BackgroundSystem({
      width: 380,
      height: 520,
      groundH: 50,
      pipeSpeed: 2.2,
    });
    expect(bg).toBeInstanceOf(BackgroundSystem);
    expect(bg.layers).toBeNull();
  });

  it('init() creates populated BgLayers', () => {
    const bg = new BackgroundSystem({
      width: 380,
      height: 520,
      groundH: 50,
      pipeSpeed: 2.2,
    });
    bg.init();
    expect(bg.layers).not.toBeNull();
    expect(bg.layers?.farClouds.length).toBeGreaterThan(0);
    expect(bg.layers?.skyline.length).toBeGreaterThan(0);
    expect(bg.layers?.buildings.length).toBeGreaterThan(0);
    expect(bg.layers?.trees.length).toBeGreaterThan(0);
  });

  it('update() scrolls layers when playing', () => {
    const bg = new BackgroundSystem({
      width: 380,
      height: 520,
      groundH: 50,
      pipeSpeed: 2.2,
    });
    bg.init();
    const skyXBefore = bg.layers?.skyline[0]?.x ?? 0;
    bg.update(1, 1000, true);
    const skyXAfter = bg.layers?.skyline[0]?.x ?? 0;
    expect(skyXAfter).toBeLessThan(skyXBefore);
  });
});

// --- cache.ts ---

describe('buildFontCache', () => {
  it('returns object with all required font size strings', () => {
    const fonts = buildFontCache('"Poppins", sans-serif');
    expect(fonts.banner).toContain('9px');
    expect(fonts.score).toContain('32px');
    expect(fonts.hint).toContain('11px');
    expect(fonts.deadTitle).toContain('20px');
    expect(fonts.fps).toContain('10px');
  });
});

describe('DEFAULT_COLORS', () => {
  it('has all required keys with valid hex values', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    expect(DEFAULT_COLORS.navy).toMatch(hexPattern);
    expect(DEFAULT_COLORS.violet).toMatch(hexPattern);
    expect(DEFAULT_COLORS.cyan).toMatch(hexPattern);
    expect(DEFAULT_COLORS.magenta).toMatch(hexPattern);
    expect(DEFAULT_COLORS.light).toMatch(hexPattern);
    expect(DEFAULT_COLORS.white).toMatch(hexPattern);
    expect(DEFAULT_COLORS.midviolet).toMatch(hexPattern);
  });
});

// --- renderer-entities.ts (mock canvas context) ---

describe('drawBird', () => {
  it('calls canvas save, translate, rotate, and restore', () => {
    const ctx = makeCanvasContext();
    drawBird(ctx, 100, 15, 70, 28, null, DEFAULT_COLORS);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.translate).toHaveBeenCalled();
    expect(ctx.rotate).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('draws fallback circle when spriteImg is null', () => {
    const ctx = makeCanvasContext();
    drawBird(ctx, 100, 0, 70, 28, null, DEFAULT_COLORS);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });
});

describe('drawPipes', () => {
  it('renders pipe columns for active pipes using direct coordinate offsets', () => {
    const ctx = makeCanvasContext();
    const pipes: Pipe[] = [makePipe({ x: 100, topH: 80, scored: false })];
    drawPipes(ctx, pipes, 1, 52, 162, 520, null, { canvas: null, logW: 60, logH: 20 });
    expect(ctx.save).not.toHaveBeenCalled();
    expect(ctx.translate).not.toHaveBeenCalled();
    expect(ctx.restore).not.toHaveBeenCalled();
  });

  it('does nothing when activeCount is 0', () => {
    const ctx = makeCanvasContext();
    drawPipes(ctx, [], 0, 52, 162, 520, null, { canvas: null, logW: 60, logH: 20 });
    expect(ctx.translate).not.toHaveBeenCalled();
  });
});

describe('drawScore', () => {
  it('renders score text with shadow and foreground', () => {
    const ctx = makeCanvasContext();
    const fonts = buildFontCache('"Poppins", sans-serif');
    drawScore(ctx, '42', 380, fonts, DEFAULT_COLORS);
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
    expect(ctx.fillText).toHaveBeenCalledWith('42', expect.any(Number), expect.any(Number));
  });
});

// --- errors.ts ---

describe('EngineError', () => {
  it('has correct name and code properties', () => {
    const err = new EngineError('test message', 'CANVAS_CONTEXT_UNAVAILABLE');
    expect(err.name).toBe('EngineError');
    expect(err.code).toBe('CANVAS_CONTEXT_UNAVAILABLE');
    expect(err.message).toBe('test message');
  });

  it('is instance of Error', () => {
    const err = new EngineError('oops', 'ASSET_LOAD_FAILED');
    expect(err).toBeInstanceOf(Error);
  });
});

// --- skyline.ts ---

describe('generateSkylineSegment', () => {
  it('returns a valid SkylineSegment', () => {
    const seg = generateSkylineSegment('dallas', 0, 470);
    expect(seg.x).toBe(0);
    expect(seg.groundY).toBe(470);
    expect(seg.city).toBe('dallas');
    expect(seg.buildings.length).toBeGreaterThan(0);
    expect(seg.totalW).toBeGreaterThan(0);
  });

  it('produces buildings with positive dimensions', () => {
    const seg = generateSkylineSegment('montreal', 50, 470);
    for (const b of seg.buildings) {
      expect(b.w).toBeGreaterThan(0);
      expect(b.h).toBeGreaterThan(0);
    }
  });
});

// --- logger.ts ---

describe('createLogger', () => {
  it('returns object with error/warn/info/debug methods', () => {
    const log = createLogger('test');
    expect(typeof log.error).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.info).toBe('function');
    expect(typeof log.debug).toBe('function');
  });

  it('calling logger methods does not throw', () => {
    const log = createLogger('test');
    expect(() => log.error('err')).not.toThrow();
    expect(() => log.warn('warning')).not.toThrow();
    expect(() => log.info('info')).not.toThrow();
    expect(() => log.debug('dbg', { key: 'val' })).not.toThrow();
  });
});
