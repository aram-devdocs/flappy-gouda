import type { Bird, GameConfig } from '@repo/types';
import type { EngineLoop } from './engine-loop.js';
import type { EngineState } from './engine-state.js';

/** Shared reset logic: zero pipes, reset loop timing, sync prevBird, and reset game state. */
export function resetEngine(
  state: EngineState,
  loop: EngineLoop,
  bird: Bird,
  prevBird: Bird,
  config: GameConfig,
  setPipeCount: (n: number) => void,
): void {
  setPipeCount(0);
  loop.resetAfterPause();
  state.resetGameState(bird, config);
  syncPrevBird(prevBird, bird);
}

/** Copy bird snapshot into prevBird for interpolation. */
export function syncPrevBird(prevBird: Bird, bird: Bird): void {
  prevBird.y = bird.y;
  prevBird.vy = bird.vy;
  prevBird.rot = bird.rot;
}
