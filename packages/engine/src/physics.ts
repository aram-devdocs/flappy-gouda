import type { Bird, Cloud, GameConfig, Pipe } from '@repo/types';

export interface PhysicsResult {
  died: boolean;
  scored: boolean;
}

export function updateBird(bird: Bird, config: GameConfig, dt: number): void {
  bird.vy += config.gravity * dt;
  if (bird.vy > config.terminalVel) bird.vy = config.terminalVel;
  bird.y += bird.vy * dt;

  const targetRot = Math.max(-20, Math.min(55, bird.vy * 3.2));
  bird.rot += (targetRot - bird.rot) * 0.12;

  // Ceiling clamp
  if (bird.y < 0) {
    bird.y = 0;
    bird.vy = 0;
  }
}

export function checkGroundCollision(bird: Bird, config: GameConfig): boolean {
  return bird.y + config.birdSize > config.height - config.groundH;
}

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

export function checkPipeScore(pipe: Pipe, config: GameConfig): boolean {
  return !pipe.scored && pipe.x + config.pipeWidth < config.birdX;
}

export function updateClouds(clouds: Cloud[], config: GameConfig, dt: number): void {
  for (const c of clouds) {
    c.x -= c.speed * dt;
    if (c.x + c.w < 0) {
      c.x = config.width + 10;
      c.y = 30 + Math.random() * (config.height * 0.35);
    }
  }
}

export function spawnPipe(pipePool: Pipe[], activeCount: number, config: GameConfig): number {
  if (activeCount >= pipePool.length) return activeCount;
  const minTop = 60;
  const maxTop = config.height - config.groundH - config.pipeGap - 60;
  const topH = minTop + Math.random() * (maxTop - minTop);
  const p = pipePool[activeCount] as Pipe;
  p.x = config.width;
  p.topH = topH;
  p.scored = false;
  return activeCount + 1;
}

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
    const p = pipePool[i] as Pipe;
    p.x -= config.pipeSpeed * dt;

    // Remove off-screen
    if (p.x + config.pipeWidth < 0) {
      const last = count - 1;
      if (i !== last) {
        const tmp = pipePool[i] as Pipe;
        pipePool[i] = pipePool[last] as Pipe;
        pipePool[last] = tmp;
      }
      count--;
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
