import type { GameColors, Pipe } from '@repo/types';
import { atIndex } from './assert';
import type { CachedFonts } from './cache';
import { PIPE_LIP } from './config';
import { DEG_TO_RAD, TAU } from './math';
import type { PipeLipCache } from './renderer-prerender';

/** Bounding rectangle for a UI icon in logical (CSS) pixels. */
export interface IconBounds {
  /** Left edge x-coordinate. */
  x: number;
  /** Top edge y-coordinate. */
  y: number;
  /** Width of the icon. */
  w: number;
  /** Height of the icon. */
  h: number;
}

/** Draw the bird sprite (heart image or fallback circle) at the given position with rotation. */
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

/** Draw all active pipe pairs (top and bottom columns with lip caps). */
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
    const p = atIndex(pipes, i);
    const gapBottom = p.topH + pipeGap;

    ctx.save();
    ctx.translate(p.x, 0);

    if (pipeGrad) {
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(0, -4, pipeWidth, p.topH + 4);
    }
    if (pipeLip.canvas) {
      ctx.drawImage(
        pipeLip.canvas,
        -PIPE_LIP.extraW / 2,
        p.topH - PIPE_LIP.height,
        pipeLip.logW,
        pipeLip.logH,
      );
    }

    if (pipeGrad) {
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(0, gapBottom, pipeWidth, height - gapBottom);
    }
    if (pipeLip.canvas) {
      ctx.drawImage(pipeLip.canvas, -PIPE_LIP.extraW / 2, gapBottom, pipeLip.logW, pipeLip.logH);
    }

    ctx.restore();
  }
}

/** Draw the current score centered at the top of the canvas with a drop shadow. */
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

const ICON_SIZE = 22;
const ICON_PAD = 10;

/** Compute the bounding rectangle for the settings gear icon. */
export function getSettingsIconBounds(width: number): IconBounds {
  return { x: width - ICON_SIZE - ICON_PAD, y: ICON_PAD, w: ICON_SIZE, h: ICON_SIZE };
}

/** Draw a gear-shaped settings icon in the top-right corner of the canvas. */
export function drawSettingsIcon(
  ctx: CanvasRenderingContext2D,
  width: number,
  colors: GameColors,
  hovered = false,
): void {
  const b = getSettingsIconBounds(width);
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const outer = b.w / 2;
  const inner = outer * 0.62;
  const hole = outer * 0.3;
  const teeth = 8;

  ctx.save();
  ctx.globalAlpha = hovered ? 0.7 : 0.35;
  ctx.fillStyle = colors.navy;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    const a0 = (TAU / teeth) * i - TAU / (teeth * 4);
    const a1 = a0 + TAU / (teeth * 4);
    const a2 = a1 + TAU / (teeth * 4);
    ctx.lineTo(cx + Math.cos(a0) * outer, cy + Math.sin(a0) * outer);
    ctx.lineTo(cx + Math.cos(a1) * outer, cy + Math.sin(a1) * outer);
    ctx.lineTo(cx + Math.cos(a1) * inner, cy + Math.sin(a1) * inner);
    ctx.lineTo(cx + Math.cos(a2) * inner, cy + Math.sin(a2) * inner);
  }
  ctx.closePath();
  ctx.moveTo(cx + hole, cy);
  ctx.arc(cx, cy, hole, 0, TAU, true);
  ctx.fill('evenodd');
  ctx.restore();
}

/** Return true if the given logical coordinates fall within the settings icon bounds. */
export function hitTestSettingsIcon(logicalX: number, logicalY: number, width: number): boolean {
  const b = getSettingsIconBounds(width);
  return logicalX >= b.x && logicalX <= b.x + b.w && logicalY >= b.y && logicalY <= b.y + b.h;
}
