import type { Bird, GameConfig, Pipe } from '@repo/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG, DIFFICULTY, applyDifficulty } from '../config.js';
import { TAU, maxOf } from '../math.js';
import { loadBestScores, loadDifficulty, saveBestScores, saveDifficulty } from '../persistence.js';
import {
  checkGroundCollision,
  checkPipeCollision,
  checkPipeScore,
  spawnPipe,
  updateBird,
  updatePipes,
} from '../physics.js';

// --- Factories ---

function makeBird(overrides: Partial<Bird> = {}): Bird {
  return { y: 200, vy: 0, rot: 0, ...overrides };
}

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

function makePipe(overrides: Partial<Pipe> = {}): Pipe {
  return { x: 200, topH: 100, scored: false, ...overrides };
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
    expect(scores).toEqual({ easy: 0, normal: 0, hard: 0 });
  });

  it('saveBestScores/loadBestScores round-trip', () => {
    saveBestScores({ easy: 3, normal: 10, hard: 7 });
    const scores = loadBestScores();
    expect(scores).toEqual({ easy: 3, normal: 10, hard: 7 });
  });

  it('saveDifficulty/loadDifficulty round-trip', () => {
    saveDifficulty('hard');
    expect(loadDifficulty()).toBe('hard');
  });

  it('loadDifficulty returns normal for unknown value', () => {
    localStorage.setItem('sn-flappy-diff', 'invalid');
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
    expect(loadBestScores()).toEqual({ easy: 0, normal: 0, hard: 0 });
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
