import type { GameColors, GroundDeco } from '@repo/types';
import { TAU } from './math';

/** Fill the canvas with the sky gradient (no-op when grad is null). */
export function drawSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  skyGrad: CanvasGradient | null,
): void {
  if (skyGrad) {
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);
  }
}

/** Draw the ground strip with optional decorations and accent gradient. */
export function drawGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundH: number,
  colors: GameColors,
  groundDeco: GroundDeco[] | null,
  accentGrad: CanvasGradient | null,
): void {
  ctx.fillStyle = colors.navy;
  ctx.fillRect(0, height - groundH, width, groundH);

  if (groundDeco) {
    const groundY = height - groundH;
    const dashY = groundY + groundH / 2 - 1;
    const dotY = groundY + groundH * 0.7;
    ctx.globalAlpha = 0.15;

    ctx.fillStyle = colors.cyan;
    for (const g of groundDeco) {
      if (g.type === 'dash') ctx.fillRect(g.x, dashY, 8, 2);
    }

    ctx.fillStyle = colors.magenta;
    ctx.beginPath();
    for (const g of groundDeco) {
      if (g.type !== 'dash') {
        ctx.moveTo(g.x + 1.5, dotY);
        ctx.arc(g.x, dotY, 1.5, 0, TAU);
      }
    }
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (accentGrad) {
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, height - groundH, width, 3);
  }
}
