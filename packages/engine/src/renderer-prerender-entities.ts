import type { Building, GameColors, SkylineSegment, Tree } from '@repo/types';
import { drawBuilding, drawSkylineSegment, drawTree } from './renderer-background';

function makeOffscreen(
  w: number,
  h: number,
  dpr: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  const c = document.createElement('canvas');
  c.width = Math.ceil(w * dpr);
  c.height = Math.ceil(h * dpr);
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  return { canvas: c, ctx };
}

const ENTITY_PAD = 2;

/** Pre-render a skyline segment to an offscreen canvas for fast blitting. */
export function prerenderSkylineSegment(
  seg: SkylineSegment,
  dpr: number,
  colors: GameColors,
): void {
  let maxAbove = 0;
  let maxRight = 0;
  for (const b of seg.buildings) {
    const above = b.h + (b.hasSpire ? 12 : b.hasDome ? b.w * 0.35 : 0);
    if (above > maxAbove) maxAbove = above;
    const right = b.ox + b.w + (b.hasCactus ? 8 : 0);
    if (right > maxRight) maxRight = right;
  }
  const w = maxRight + ENTITY_PAD * 2;
  const h = maxAbove + ENTITY_PAD * 2;
  const off = makeOffscreen(w, h, dpr);
  if (!off) return;
  off.ctx.translate(ENTITY_PAD - seg.x, ENTITY_PAD + maxAbove - seg.groundY);
  off.ctx.fillStyle = colors.navy;
  drawSkylineSegment(off.ctx, seg);
  seg._canvas = off.canvas;
  seg._cacheOffX = -ENTITY_PAD;
  seg._cacheOffY = -maxAbove - ENTITY_PAD;
  seg._cacheW = w;
  seg._cacheH = h;
}

/** Pre-render a foreground building to an offscreen canvas for fast blitting. */
export function prerenderBuilding(
  b: Building,
  groundY: number,
  dpr: number,
  colors: GameColors,
): void {
  let relL = 0;
  let relT = 0;
  let relR = b.w;
  let relB = b.h;
  if (b.type === 'house') {
    relL = -3;
    relR = b.w + 3;
    relB = groundY - b.y;
  }
  if (b.type === 'office') relT = -8;
  const w = relR - relL + ENTITY_PAD * 2;
  const h = relB - relT + ENTITY_PAD * 2;
  const off = makeOffscreen(w, h, dpr);
  if (!off) return;
  off.ctx.translate(ENTITY_PAD - relL - b.x, ENTITY_PAD - relT - b.y);
  drawBuilding(off.ctx, b, groundY, colors);
  b._canvas = off.canvas;
  b._cacheOffX = relL - ENTITY_PAD;
  b._cacheOffY = relT - ENTITY_PAD;
  b._cacheW = w;
  b._cacheH = h;
}

/** Pre-render a tree to an offscreen canvas for fast blitting. */
export function prerenderTree(t: Tree, dpr: number, colors: GameColors): void {
  const margin = t.w * 0.1;
  const w = t.w + margin * 2 + ENTITY_PAD * 2;
  const h = t.h + ENTITY_PAD * 2;
  const off = makeOffscreen(w, h, dpr);
  if (!off) return;
  off.ctx.translate(ENTITY_PAD + margin - t.x, ENTITY_PAD + t.h - t.y);
  drawTree(off.ctx, t, colors);
  t._canvas = off.canvas;
  t._cacheOffX = -margin - ENTITY_PAD;
  t._cacheOffY = -t.h - ENTITY_PAD;
  t._cacheW = w;
  t._cacheH = h;
}
