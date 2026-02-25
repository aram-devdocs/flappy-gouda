import type { Bird, GameConfig } from '@repo/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONFIG } from '../config.js';
import { EngineEventEmitter } from '../engine-events.js';
import { resetEngine, syncPrevBird } from '../engine-lifecycle.js';
import { EngineLoop } from '../engine-loop.js';
import { EngineState } from '../engine-state.js';

vi.mock('../persistence.js', () => ({
  saveBestScores: vi.fn(),
  saveDifficulty: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeConfig(overrides: Partial<GameConfig> = {}): GameConfig {
  return { ...DEFAULT_CONFIG, ...overrides };
}

function makeBird(overrides: Partial<Bird> = {}): Bird {
  return { y: 200, vy: 0, rot: 0, ...overrides };
}

// ---------------------------------------------------------------------------
// syncPrevBird
// ---------------------------------------------------------------------------

describe('syncPrevBird', () => {
  it('copies y, vy, and rot from bird to prevBird', () => {
    // Arrange
    const prevBird = makeBird({ y: 0, vy: 0, rot: 0 });
    const bird = makeBird({ y: 150, vy: -3.5, rot: 0.25 });

    // Act
    syncPrevBird(prevBird, bird);

    // Assert
    expect(prevBird.y).toBe(150);
    expect(prevBird.vy).toBe(-3.5);
    expect(prevBird.rot).toBe(0.25);
  });

  it('does not mutate the source bird', () => {
    // Arrange
    const prevBird = makeBird({ y: 999, vy: 999, rot: 999 });
    const bird = makeBird({ y: 100, vy: -2, rot: 0.1 });

    // Act
    syncPrevBird(prevBird, bird);

    // Assert
    expect(bird.y).toBe(100);
    expect(bird.vy).toBe(-2);
    expect(bird.rot).toBe(0.1);
  });

  it('is idempotent when called multiple times', () => {
    // Arrange
    const prevBird = makeBird({ y: 0, vy: 0, rot: 0 });
    const bird = makeBird({ y: 50, vy: -1, rot: 0.5 });

    // Act
    syncPrevBird(prevBird, bird);
    syncPrevBird(prevBird, bird);
    syncPrevBird(prevBird, bird);

    // Assert
    expect(prevBird.y).toBe(50);
    expect(prevBird.vy).toBe(-1);
    expect(prevBird.rot).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------
// resetEngine
// ---------------------------------------------------------------------------

describe('resetEngine', () => {
  let emitter: EngineEventEmitter;
  let state: EngineState;
  let loop: EngineLoop;

  beforeEach(() => {
    vi.clearAllMocks();
    emitter = new EngineEventEmitter();
    state = new EngineState(emitter);
    loop = new EngineLoop(emitter);

    let rafId = 0;
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn(() => ++rafId),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  it('syncs prevBird to match bird after reset', () => {
    // Arrange
    const bird = makeBird({ y: 300, vy: 5, rot: 1.2 });
    const prevBird = makeBird({ y: 100, vy: -2, rot: 0.3 });
    const config = makeConfig();
    const setPipeCount = vi.fn();

    // Act
    resetEngine(state, loop, bird, prevBird, config, setPipeCount);

    // Assert -- bird gets reset by resetGameState, prevBird should match
    expect(prevBird.y).toBe(bird.y);
    expect(prevBird.vy).toBe(bird.vy);
    expect(prevBird.rot).toBe(bird.rot);
  });

  it('zeroes pipe count', () => {
    // Arrange
    const bird = makeBird();
    const prevBird = makeBird();
    const config = makeConfig();
    const setPipeCount = vi.fn();

    // Act
    resetEngine(state, loop, bird, prevBird, config, setPipeCount);

    // Assert
    expect(setPipeCount).toHaveBeenCalledWith(0);
  });

  it('resets loop timing', () => {
    // Arrange
    vi.spyOn(performance, 'now').mockReturnValue(5000);
    const bird = makeBird();
    const prevBird = makeBird();
    const config = makeConfig();
    const setPipeCount = vi.fn();
    loop.accumulator = 500;
    loop.frameTime = 1000;

    // Act
    resetEngine(state, loop, bird, prevBird, config, setPipeCount);

    // Assert
    expect(loop.frameTime).toBe(5000);
    expect(loop.accumulator).toBe(0);
  });

  it('resets game state to idle with zero score', () => {
    // Arrange
    const bird = makeBird();
    const prevBird = makeBird();
    const config = makeConfig();
    const setPipeCount = vi.fn();
    state.score = 15;
    state.state = 'dead';

    // Act
    resetEngine(state, loop, bird, prevBird, config, setPipeCount);

    // Assert
    expect(state.score).toBe(0);
    expect(state.state).toBe('idle');
  });
});
