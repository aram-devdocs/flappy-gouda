import type { GameColors, Pipe } from '@repo/types';
import type { CachedFonts } from './cache.js';
import { DEG_TO_RAD, TAU } from './math.js';
import type { PipeLipCache } from './renderer-prerender.js';

export function drawBird(
  ctx: CanvasRenderingContext2D,
  y: number,
  rot: number,
  birdX: number,
  birdSize: number,
  heartImg: HTMLImageElement | null,
  colors: GameColors,
): void {
  const cx = birdX + birdSize / 2;
  const cy = y + birdSize / 2;
  const rad = rot * DEG_TO_RAD;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);

  if (heartImg) {
    ctx.drawImage(heartImg, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
  } else {
    ctx.fillStyle = colors.violet;
    ctx.beginPath();
    ctx.arc(0, 0, birdSize / 2, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawPipes(
  ctx: CanvasRenderingContext2D,
  pipes: Pipe[],
  activeCount: number,
  pipeWidth: number,
  pipeGap: number,
  height: number,
  pipeGrad: CanvasGradient | null,
  pipeLip: PipeLipCache,
): void {
  for (let i = 0; i < activeCount; i++) {
    const p = pipes[i] as Pipe;
    const gapBottom = p.topH + pipeGap;

    ctx.save();
    ctx.translate(p.x, 0);

    if (pipeGrad) {
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(0, -4, pipeWidth, p.topH + 4);
    }
    if (pipeLip.canvas) {
      ctx.drawImage(pipeLip.canvas, -4, p.topH - 20, pipeLip.logW, pipeLip.logH);
    }

    if (pipeGrad) {
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(0, gapBottom, pipeWidth, height - gapBottom);
    }
    if (pipeLip.canvas) {
      ctx.drawImage(pipeLip.canvas, -4, gapBottom, pipeLip.logW, pipeLip.logH);
    }

    ctx.restore();
  }
}

export function drawScore(
  ctx: CanvasRenderingContext2D,
  score: number,
  width: number,
  fonts: CachedFonts,
  colors: GameColors,
): void {
  ctx.font = fonts.score;
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.navy;
  ctx.globalAlpha = 0.12;
  ctx.fillText(String(score), width / 2 + 2, 52);
  ctx.globalAlpha = 1;
  ctx.fillStyle = colors.magenta;
  ctx.fillText(String(score), width / 2, 50);
}
