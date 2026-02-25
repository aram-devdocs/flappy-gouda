import type { Bird, Cloud, GameConfig, Pipe } from '@repo/types';
import type { BackgroundSystem } from './background.js';
import type { DebugMetricsCollector } from './debug-metrics.js';
import { recordDebugFrame } from './engine-debug-bridge.js';
import { syncPrevBird } from './engine-lifecycle.js';
import type { EngineLoop } from './engine-loop.js';
import type { EngineState } from './engine-state.js';
import {
  checkGroundCollision,
  spawnPipe,
  updateBird,
  updateClouds,
  updatePipes,
} from './physics.js';
import type { Renderer } from './renderer.js';

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
  dc: DebugMetricsCollector | null,
  dt: number,
  now: number,
): { activeCount: number; updateMs: number } {
  const t0 = dc ? performance.now() : 0;
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
      if (now - state.lastPipeTime > config.pipeSpawn) {
        activeCount = spawnPipe(pipePool, activeCount, config);
        state.lastPipeTime = now;
      }
      const r = updatePipes(pipePool, activeCount, bird, config, dt);
      activeCount = r.activeCount;
      if (r.scoreInc > 0) state.setScore(state.score + r.scoreInc);
      if (r.died) state.die();
    }
  }
  return { activeCount, updateMs: dc ? performance.now() - t0 : 0 };
}

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
  dc: DebugMetricsCollector | null,
  updateMs: number,
  now: number,
): void {
  const drawT0 = dc ? performance.now() : 0;
  renderer.drawSky();
  renderer.drawBackground(bg, loop.globalTime);
  renderer.drawNearClouds(clouds);
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
  if (dc) {
    recordDebugFrame(
      dc,
      loop,
      updateMs,
      performance.now() - drawT0,
      now,
      pipeActiveCount,
      clouds.length,
      bg,
    );
  }
}
