import type { GameColors, Pipe } from '@repo/types';
import type { BackgroundSystem } from './background';
import type { CachedFonts } from './cache';

/** Three rendering contexts for the layered canvas architecture. */
export interface CanvasContexts {
  bg: CanvasRenderingContext2D;
  mg: CanvasRenderingContext2D;
  fg: CanvasRenderingContext2D;
}

/** Layout dimensions the renderer needs from the game config. */
export interface RendererDeps {
  width: number;
  height: number;
  groundH: number;
  pipeWidth: number;
  pipeGap: number;
  birdSize: number;
  birdX: number;
}

import {
  drawBird,
  drawPipes,
  drawScore,
  drawSettingsIcon,
  drawSettingsIconCached,
} from './renderer-entities';
import { drawGround } from './renderer-ground';
import type { GradientCache, PipeLipCache, SettingsIconCache } from './renderer-prerender';

export function renderPipes(
  ctx: CanvasRenderingContext2D,
  pipes: Pipe[],
  activeCount: number,
  pipeWidth: number,
  pipeGap: number,
  height: number,
  grads: GradientCache,
  pipeLip: PipeLipCache,
): void {
  drawPipes(ctx, pipes, activeCount, pipeWidth, pipeGap, height, grads.pipeGrad, pipeLip);
}

export function renderGround(
  ctx: CanvasRenderingContext2D,
  bg: BackgroundSystem,
  width: number,
  height: number,
  groundH: number,
  colors: GameColors,
  accentGrad: CanvasGradient | null,
): void {
  drawGround(ctx, width, height, groundH, colors, bg.layers?.groundDeco ?? null, accentGrad);
}

export function renderBird(
  ctx: CanvasRenderingContext2D,
  y: number,
  rot: number,
  birdX: number,
  birdSize: number,
  spriteImg: HTMLImageElement | null,
  colors: GameColors,
): void {
  drawBird(ctx, y, rot, birdX, birdSize, spriteImg, colors);
}

export function renderScore(
  ctx: CanvasRenderingContext2D,
  scoreStr: string,
  width: number,
  fonts: CachedFonts,
  colors: GameColors,
): void {
  drawScore(ctx, scoreStr, width, fonts, colors);
}

export function renderSettingsIcon(
  ctx: CanvasRenderingContext2D,
  width: number,
  colors: GameColors,
  iconCache: SettingsIconCache,
  hovered: boolean,
): void {
  if (iconCache.normal) {
    drawSettingsIconCached(ctx, width, iconCache, hovered);
  } else {
    drawSettingsIcon(ctx, width, colors, hovered);
  }
}
