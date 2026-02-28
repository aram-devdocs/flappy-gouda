import type { Bird, Cloud, GameConfig, Pipe } from '@repo/types';
import type { BackgroundSystem } from './background';
import { syncPrevBird } from './engine-lifecycle';
import type { EngineLoop } from './engine-loop';
import type { EngineState } from './engine-state';
import { checkGroundCollision, spawnPipe, updateBird, updateClouds, updatePipes } from './physics';
import type { Renderer } from './renderer';

/** Try spawning a pipe if the spawn interval has elapsed, applying timing variation. */
function trySpawnPipe(
  state: EngineState,
  config: GameConfig,
  pipePool: Pipe[],
  activeCount: number,
  now: number,
): number {
  const spawnDelay = state.nextSpawnDelay > 0 ? state.nextSpawnDelay : config.pipeSpawn;
  if (now - state.lastPipeTime <= spawnDelay) return activeCount;
  const newCount = spawnPipe(pipePool, activeCount, config);
  state.lastPipeTime = now;
  state.nextSpawnDelay =
    config.pipeSpawnVariation > 0
      ? config.pipeSpawn + (Math.random() * 2 - 1) * config.pipeSpawnVariation
      : config.pipeSpawn;
  return newCount;
}

/**
 * Run one simulation tick. Returns the updated active pipe count.
 * Debug timing is handled by the caller to keep this path branch-free.
 */
export function engineUpdate(
  loop: EngineLoop,
  state: EngineState,
  config: GameConfig,
  bird: Bird,
  prevBird: Bird,
  clouds: Cloud[],
  bg: BackgroundSystem,
  pipePool: Pipe[],
  pipeActiveCount: number,
  dt: number,
  now: number,
): number {
  loop.globalTime = now;
  updateClouds(clouds, config, dt);
  bg.update(dt, now, state.state === 'play', loop.reducedMotion);
  syncPrevBird(prevBird, bird);
  let activeCount = pipeActiveCount;
  if (state.state === 'play') {
    updateBird(bird, config, dt);
    if (checkGroundCollision(bird, config)) {
      state.die();
    } else {
      activeCount = trySpawnPipe(state, config, pipePool, activeCount, now);
      const r = updatePipes(pipePool, activeCount, bird, config, dt);
      activeCount = r.activeCount;
      if (r.scoreInc > 0) state.setScore(state.score + r.scoreInc);
      if (r.died) state.die();
    }
  }
  return activeCount;
}

/**
 * Render one frame. Debug timing is handled by the caller.
 */
export function engineDraw(
  loop: EngineLoop,
  state: EngineState,
  renderer: Renderer,
  bg: BackgroundSystem,
  clouds: Cloud[],
  pipePool: Pipe[],
  pipeActiveCount: number,
  bird: Bird,
  prevBird: Bird,
  settingsIconHovered: boolean,
  now: number,
): void {
  renderer.drawBgLayer(bg, now);
  renderer.drawMgLayer(bg, clouds, now);
  renderer.clearFg();
  renderer.drawPipes(pipePool, pipeActiveCount);
  renderer.drawGround(bg);
  if (state.state !== 'idle') {
    const a = loop.alpha;
    const y = prevBird.y + (bird.y - prevBird.y) * a;
    const rot = prevBird.rot + (bird.rot - prevBird.rot) * a;
    renderer.drawBird(y, rot);
    renderer.drawScore(state.score);
    renderer.drawSettingsIcon(settingsIconHovered);
  }
  loop.updateFps(now);
}
