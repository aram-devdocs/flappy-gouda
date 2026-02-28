import type { GameColors, Pipe } from '@repo/types';
import { atIndex } from './assert';
import type { CachedFonts } from './cache';
import { PIPE_LIP } from './config';
import { DEG_TO_RAD, TAU } from './math';
import type { PipeLipCache, SettingsIconCache } from './renderer-prerender';

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

/** Settings icon dimensions in logical pixels. */
export const ICON_SIZE = 22;
export const ICON_PAD = 10;

const SCORE_SHADOW_ALPHA = 0.12;
const SCORE_SHADOW_OFFSET_X = 2;
const SCORE_SHADOW_OFFSET_Y = 52;
const SCORE_Y = 50;
const GEAR_INNER_RATIO = 0.62;
const GEAR_HOLE_RATIO = 0.3;
const GEAR_TEETH = 8;

/** Draw the bird sprite (cheese image or fallback circle) at the given position with rotation. */
export function drawBird(
  ctx: CanvasRenderingContext2D,
  y: number,
  rot: number,
  birdX: number,
  birdSize: number,
  spriteImg: HTMLImageElement | null,
  colors: GameColors,
): void {
  const half = (birdSize / 2) | 0;
  const cx = (birdX + half) | 0;
  const cy = (y + half) | 0;
  const rad = rot * DEG_TO_RAD;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);

  if (spriteImg) {
    ctx.drawImage(spriteImg, -half, -half, birdSize, birdSize);
  } else {
    ctx.fillStyle = colors.violet;
    ctx.beginPath();
    ctx.arc(0, 0, half, 0, TAU);
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
  fallbackGap: number,
  height: number,
  pipeGrad: CanvasGradient | null,
  pipeLip: PipeLipCache,
): void {
  const lipOffsetX = (PIPE_LIP.extraW / 2) | 0;
  for (let i = 0; i < activeCount; i++) {
    const p = atIndex(pipes, i);
    const px = p.x | 0;
    const topH = p.topH | 0;
    const gapBottom = (p.topH + (p.gap > 0 ? p.gap : fallbackGap)) | 0;
    const lipX = px - lipOffsetX;

    if (pipeGrad) {
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(px, -4, pipeWidth, topH + 4);
    }
    if (pipeLip.canvas) {
      ctx.drawImage(pipeLip.canvas, lipX, topH - PIPE_LIP.height, pipeLip.logW, pipeLip.logH);
    }

    if (pipeGrad) {
      ctx.fillStyle = pipeGrad;
      ctx.fillRect(px, gapBottom, pipeWidth, height - gapBottom);
    }
    if (pipeLip.canvas) {
      ctx.drawImage(pipeLip.canvas, lipX, gapBottom, pipeLip.logW, pipeLip.logH);
    }
  }
}

/**
 * Draw the current score centered at the top of the canvas with a drop shadow.
 * Accepts a pre-cached string to avoid per-frame String() allocation.
 */
export function drawScore(
  ctx: CanvasRenderingContext2D,
  scoreStr: string,
  width: number,
  fonts: CachedFonts,
  colors: GameColors,
): void {
  const cx = (width / 2) | 0;
  ctx.font = fonts.score;
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.navy;
  ctx.globalAlpha = SCORE_SHADOW_ALPHA;
  ctx.fillText(scoreStr, cx + SCORE_SHADOW_OFFSET_X, SCORE_SHADOW_OFFSET_Y);
  ctx.globalAlpha = 1;
  ctx.fillStyle = colors.magenta;
  ctx.fillText(scoreStr, cx, SCORE_Y);
}

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
  const inner = outer * GEAR_INNER_RATIO;
  const hole = outer * GEAR_HOLE_RATIO;
  const teeth = GEAR_TEETH;

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

/** Draw a pre-rendered settings icon from cache, avoiding per-frame path computation. */
export function drawSettingsIconCached(
  ctx: CanvasRenderingContext2D,
  width: number,
  cache: SettingsIconCache,
  hovered: boolean,
): void {
  const variant = hovered ? cache.hovered : cache.normal;
  if (!variant) return;
  const b = getSettingsIconBounds(width);
  ctx.drawImage(variant, b.x | 0, b.y | 0, cache.logW, cache.logH);
}

/** Return true if the given logical coordinates fall within the settings icon bounds. */
export function hitTestSettingsIcon(logicalX: number, logicalY: number, width: number): boolean {
  const b = getSettingsIconBounds(width);
  return logicalX >= b.x && logicalX <= b.x + b.w && logicalY >= b.y && logicalY <= b.y + b.h;
}
