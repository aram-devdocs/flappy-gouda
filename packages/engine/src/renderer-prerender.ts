import type { Cloud, GameColors } from '@repo/types';
import type { BackgroundSystem } from './background.js';
import { PIPE_LIP } from './config.js';
import { createLogger } from './logger.js';
import { TAU } from './math.js';

const log = createLogger('renderer-prerender');

export interface PipeLipCache {
  canvas: HTMLCanvasElement | null;
  logW: number;
  logH: number;
}

export function prerenderCloud(c: Cloud, dpr: number, colors: GameColors): void {
  const pad = 4;
  const w = c.w;
  const h = w * 0.45;
  const cW = Math.ceil(w + pad * 2);
  const cH = Math.ceil(h + pad * 2);
  const offC = document.createElement('canvas');
  offC.width = cW * dpr;
  offC.height = cH * dpr;
  const oCtx = offC.getContext('2d');
  if (!oCtx) {
    log.warn('Failed to get 2D context for cloud prerender');
    return;
  }
  oCtx.scale(dpr, dpr);
  oCtx.fillStyle = colors.cyan;
  oCtx.beginPath();
  oCtx.ellipse(pad + w * 0.35, pad + h * 0.6, w * 0.35, h * 0.45, 0, 0, TAU);
  oCtx.moveTo(pad + w * 0.65 + w * 0.3, pad + h * 0.5);
  oCtx.ellipse(pad + w * 0.65, pad + h * 0.5, w * 0.3, h * 0.4, 0, 0, TAU);
  oCtx.moveTo(pad + w * 0.5 + w * 0.25, pad + h * 0.35);
  oCtx.ellipse(pad + w * 0.5, pad + h * 0.35, w * 0.25, h * 0.35, 0, 0, TAU);
  oCtx.fill();
  c._canvas = offC;
  c._pad = pad;
  c._logW = cW;
  c._logH = cH;
}

export function prerenderAllClouds(
  nearClouds: Cloud[],
  bg: BackgroundSystem,
  dpr: number,
  colors: GameColors,
): void {
  for (const c of nearClouds) prerenderCloud(c, dpr, colors);
  if (bg.layers) {
    for (const c of bg.layers.farClouds) prerenderCloud(c, dpr, colors);
    for (const c of bg.layers.midClouds) prerenderCloud(c, dpr, colors);
  }
}

export function buildPipeLipCache(
  pipeWidth: number,
  dpr: number,
  colors: GameColors,
): PipeLipCache {
  const lipW = pipeWidth + PIPE_LIP.extraW;
  const lipH = PIPE_LIP.height;
  const lipR = PIPE_LIP.radius;
  const offC = document.createElement('canvas');
  offC.width = lipW * dpr;
  offC.height = lipH * dpr;
  const oCtx = offC.getContext('2d');
  if (!oCtx) {
    log.warn('Failed to get 2D context for pipe lip cache');
    return { canvas: null, logW: lipW, logH: lipH };
  }
  oCtx.scale(dpr, dpr);
  oCtx.fillStyle = colors.violet;
  oCtx.beginPath();
  oCtx.moveTo(lipR, 0);
  oCtx.lineTo(lipW - lipR, 0);
  oCtx.quadraticCurveTo(lipW, 0, lipW, lipR);
  oCtx.lineTo(lipW, lipH - lipR);
  oCtx.quadraticCurveTo(lipW, lipH, lipW - lipR, lipH);
  oCtx.lineTo(lipR, lipH);
  oCtx.quadraticCurveTo(0, lipH, 0, lipH - lipR);
  oCtx.lineTo(0, lipR);
  oCtx.quadraticCurveTo(0, 0, lipR, 0);
  oCtx.closePath();
  oCtx.fill();
  return { canvas: offC, logW: lipW, logH: lipH };
}

export interface GradientCache {
  skyGrad: CanvasGradient | null;
  accentGrad: CanvasGradient | null;
  pipeGrad: CanvasGradient | null;
}

export function buildGradients(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundH: number,
  pipeWidth: number,
  colors: GameColors,
): GradientCache {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height - groundH);
  skyGrad.addColorStop(0, colors.light);
  skyGrad.addColorStop(0.6, colors.white);
  skyGrad.addColorStop(1, colors.skyBottom);

  const accentGrad = ctx.createLinearGradient(0, 0, width, 0);
  accentGrad.addColorStop(0, colors.magenta);
  accentGrad.addColorStop(1, colors.cyan);

  const pipeGrad = ctx.createLinearGradient(0, 0, pipeWidth, 0);
  pipeGrad.addColorStop(0, colors.navy);
  pipeGrad.addColorStop(1, colors.midviolet);

  return { skyGrad, accentGrad, pipeGrad };
}
