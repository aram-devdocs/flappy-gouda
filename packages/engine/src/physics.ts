import type { Bird, Cloud, GameConfig, Pipe } from '@repo/types';
import { atIndex } from './assert.js';
import { BIRD_ROTATION, PIPE_SPAWN_MARGIN } from './config.js';
import { poolRemove } from './pool.js';

/** Outcome flags returned after a physics tick. */
export interface PhysicsResult {
  died: boolean;
  scored: boolean;
}

/** Apply gravity, velocity, and rotation to the bird for one physics step. */
export function updateBird(bird: Bird, config: GameConfig, dt: number): void {
  if (!Number.isFinite(bird.vy)) bird.vy = 0;
  bird.vy += config.gravity * dt;
  if (bird.vy > config.terminalVel) bird.vy = config.terminalVel;
  bird.y += bird.vy * dt;

  const targetRot = Math.max(
    BIRD_ROTATION.minDeg,
    Math.min(BIRD_ROTATION.maxDeg, bird.vy * BIRD_ROTATION.velocityScale),
  );
  bird.rot += (targetRot - bird.rot) * BIRD_ROTATION.lerpFactor;

  // Ceiling clamp
  if (bird.y < 0) {
    bird.y = 0;
    bird.vy = 0;
  }
}

/** Returns true if the bird has hit the ground plane. */
export function checkGroundCollision(bird: Bird, config: GameConfig): boolean {
  return bird.y + config.birdSize > config.height - config.groundH;
}

/** Returns true if the bird's hitbox overlaps a pipe opening. */
export function checkPipeCollision(bird: Bird, pipe: Pipe, config: GameConfig): boolean {
  const pad = config.hitboxPad;
  const bx = config.birdX + pad;
  const by = bird.y + pad;
  const bs = config.birdSize - pad * 2;

  if (bx + bs > pipe.x && bx < pipe.x + config.pipeWidth) {
    if (by < pipe.topH || by + bs > pipe.topH + config.pipeGap) {
      return true;
    }
  }
  return false;
}

/** Returns true if the bird has passed this pipe and it hasn't been scored yet. */
export function checkPipeScore(pipe: Pipe, config: GameConfig): boolean {
  return !pipe.scored && pipe.x + config.pipeWidth < config.birdX;
}

/** Move clouds leftward and wrap them to the right edge when off-screen. */
export function updateClouds(clouds: Cloud[], config: GameConfig, dt: number): void {
  for (const c of clouds) {
    c.x -= c.speed * dt;
    if (c.x + c.w < 0) {
      c.x = config.width + 10;
      c.y = 30 + Math.random() * (config.height * 0.35);
    }
  }
}

/** Activate the next pipe in the pool with a random gap position. Returns the new active count. */
export function spawnPipe(pipePool: Pipe[], activeCount: number, config: GameConfig): number {
  if (activeCount >= pipePool.length) return activeCount;
  const minTop = PIPE_SPAWN_MARGIN;
  const maxTop = config.height - config.groundH - config.pipeGap - PIPE_SPAWN_MARGIN;
  const topH = minTop + Math.random() * (maxTop - minTop);
  const p = atIndex(pipePool, activeCount);
  p.x = config.width;
  p.topH = topH;
  p.scored = false;
  return activeCount + 1;
}

/** Move all active pipes, recycle off-screen ones, check scoring and collisions. */
export function updatePipes(
  pipePool: Pipe[],
  initialActiveCount: number,
  bird: Bird,
  config: GameConfig,
  dt: number,
): { activeCount: number; scoreInc: number; died: boolean } {
  let scoreInc = 0;
  let died = false;
  let count = initialActiveCount;

  for (let i = count - 1; i >= 0; i--) {
    const p = atIndex(pipePool, i);
    p.x -= config.pipeSpeed * dt;

    // Remove off-screen
    if (p.x + config.pipeWidth < 0) {
      count = poolRemove(pipePool, i, count);
      continue;
    }

    // Score
    if (checkPipeScore(p, config)) {
      p.scored = true;
      scoreInc++;
    }

    // Collision
    if (checkPipeCollision(bird, p, config)) {
      died = true;
      return { activeCount: count, scoreInc, died };
    }
  }

  return { activeCount: count, scoreInc, died };
}
