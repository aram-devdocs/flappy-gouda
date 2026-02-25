import type { Cloud, GameColors, GameConfig } from '@repo/types';
import { BackgroundSystem } from './background';
import type { CachedFonts } from './cache';
import { BASE_H, BASE_W } from './config';
import { Renderer } from './renderer';

/** Configure canvas dimensions and DPR scaling, returning the device pixel ratio. */
export function setupCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): number {
  const maxCssW = Math.max(1, Math.min(BASE_W, window.innerWidth - 48));
  const cssScale = maxCssW / BASE_W;
  const cssW = Math.round(BASE_W * cssScale);
  const cssH = Math.round(BASE_H * cssScale);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = BASE_W * dpr;
  canvas.height = BASE_H * dpr;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.scale(dpr, dpr);
  return dpr;
}

/** Create the initial array of randomly positioned clouds based on game config. */
export function initClouds(config: GameConfig): Cloud[] {
  const clouds: Cloud[] = [];
  for (let i = 0; i < config.cloudCount; i++) {
    clouds.push({
      x: Math.random() * config.width,
      y: 30 + Math.random() * (config.height * 0.35),
      w: 40 + Math.random() * 50,
      speed: 0.15 + Math.random() * 0.25,
      _canvas: null,
      _pad: 0,
      _logW: 0,
      _logH: 0,
    });
  }
  return clouds;
}

/** Instantiate a BackgroundSystem with layout derived from the game config. */
export function createBgSystem(config: GameConfig, bannerTexts: string[]): BackgroundSystem {
  return new BackgroundSystem({
    width: config.width,
    height: config.height,
    groundH: config.groundH,
    pipeSpeed: config.pipeSpeed,
    bannerTexts,
  });
}

/** Create a Renderer instance wired to the given canvas context, config, colors, and fonts. */
export function createRenderer(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  colors: GameColors,
  fonts: CachedFonts,
  dpr: number,
): Renderer {
  return new Renderer(
    ctx,
    {
      width: config.width,
      height: config.height,
      groundH: config.groundH,
      pipeWidth: config.pipeWidth,
      pipeGap: config.pipeGap,
      birdSize: config.birdSize,
      birdX: config.birdX,
    },
    colors,
    fonts,
    dpr,
  );
}
