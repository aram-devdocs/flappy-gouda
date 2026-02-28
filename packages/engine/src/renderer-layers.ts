import type { Building, Cloud, GameColors, SkylineSegment, Tree } from '@repo/types';
import { BG } from './config';
import {
  drawBuilding,
  drawCloudsPrerendered,
  drawSkylineSegment,
  drawTree,
} from './renderer-background';
import {
  prerenderBuilding,
  prerenderSkylineSegment,
  prerenderTree,
} from './renderer-prerender-entities';

/** Draw far-layer elements: far clouds and skyline segments (with pre-render). */
export function drawFarLayer(
  ctx: CanvasRenderingContext2D,
  farClouds: Cloud[],
  skyline: SkylineSegment[],
  viewW: number,
  dpr: number,
  colors: GameColors,
): void {
  ctx.globalAlpha = BG.cloudFarAlpha;
  drawCloudsPrerendered(ctx, farClouds);
  ctx.globalAlpha = BG.skylineAlpha;
  ctx.fillStyle = colors.navy;
  for (const seg of skyline) {
    if (seg.x > viewW || seg.x + seg.totalW < 0) continue;
    if (!seg._canvas) prerenderSkylineSegment(seg, dpr, colors);
    if (seg._canvas) {
      ctx.drawImage(
        seg._canvas,
        (seg.x + seg._cacheOffX) | 0,
        (seg.groundY + seg._cacheOffY) | 0,
        seg._cacheW,
        seg._cacheH,
      );
    } else {
      drawSkylineSegment(ctx, seg);
    }
  }
  ctx.globalAlpha = 1;
}

function blitBuildings(
  ctx: CanvasRenderingContext2D,
  buildings: Building[],
  groundY: number,
  viewW: number,
  dpr: number,
  colors: GameColors,
): void {
  for (const b of buildings) {
    if (b.x + b.w < 0 || b.x > viewW) continue;
    if (!b._canvas) prerenderBuilding(b, groundY, dpr, colors);
    if (b._canvas) {
      ctx.drawImage(
        b._canvas,
        (b.x + b._cacheOffX) | 0,
        (b.y + b._cacheOffY) | 0,
        b._cacheW,
        b._cacheH,
      );
    } else {
      drawBuilding(ctx, b, groundY, colors);
    }
  }
}

function blitTrees(
  ctx: CanvasRenderingContext2D,
  trees: Tree[],
  viewW: number,
  dpr: number,
  colors: GameColors,
): void {
  for (const t of trees) {
    if (t.x + t.w < 0 || t.x > viewW) continue;
    if (!t._canvas) prerenderTree(t, dpr, colors);
    if (t._canvas) {
      ctx.drawImage(
        t._canvas,
        (t.x + t._cacheOffX) | 0,
        (t.y + t._cacheOffY) | 0,
        t._cacheW,
        t._cacheH,
      );
    } else {
      drawTree(ctx, t, colors);
    }
  }
}

/** Draw mid-layer elements: mid clouds, buildings, and trees (with pre-render). */
export function drawMidLayer(
  ctx: CanvasRenderingContext2D,
  midClouds: Cloud[],
  buildings: Building[],
  trees: Tree[],
  groundY: number,
  viewW: number,
  dpr: number,
  colors: GameColors,
): void {
  ctx.globalAlpha = BG.cloudMidAlpha;
  drawCloudsPrerendered(ctx, midClouds);
  ctx.globalAlpha = BG.buildingAlpha;
  blitBuildings(ctx, buildings, groundY, viewW, dpr, colors);
  ctx.globalAlpha = BG.treeAlpha;
  blitTrees(ctx, trees, viewW, dpr, colors);
  ctx.globalAlpha = 1;
}
