import type { Cloud, GameColors, Pipe } from '@repo/types';
import { atIndex } from './assert.js';
import type { BackgroundSystem } from './background.js';
import type { CachedFonts } from './cache.js';
import { BG } from './config.js';
import {
  drawBuilding,
  drawCloudsPrerendered,
  drawPlane,
  drawSkylineSegment,
  drawTree,
} from './renderer-background.js';
import { drawBird, drawPipes, drawScore, drawSettingsIcon } from './renderer-entities.js';
import { drawGround, drawSky } from './renderer-ground.js';
import {
  buildGradients,
  buildPipeLipCache,
  prerenderAllClouds,
  prerenderCloud,
} from './renderer-prerender.js';
import type { GradientCache, PipeLipCache } from './renderer-prerender.js';

interface RendererDeps {
  width: number;
  height: number;
  groundH: number;
  pipeWidth: number;
  pipeGap: number;
  birdSize: number;
  birdX: number;
}

/** Canvas 2D renderer that draws all visual layers each frame. */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private deps: RendererDeps;
  private colors: GameColors;
  private fonts: CachedFonts;
  private dpr: number;
  private grads: GradientCache = { skyGrad: null, accentGrad: null, pipeGrad: null };
  private pipeLip: PipeLipCache = { canvas: null, logW: 0, logH: 0 };
  heartImg: HTMLImageElement | null = null;

  constructor(
    ctx: CanvasRenderingContext2D,
    deps: RendererDeps,
    colors: GameColors,
    fonts: CachedFonts,
    dpr: number,
  ) {
    this.ctx = ctx;
    this.deps = deps;
    this.colors = colors;
    this.fonts = fonts;
    this.dpr = dpr;
  }

  /** Release cached offscreen canvases and gradient references. */
  dispose(): void {
    this.grads = { skyGrad: null, accentGrad: null, pipeGrad: null };
    this.pipeLip = { canvas: null, logW: 0, logH: 0 };
    this.heartImg = null;
  }

  /** Create and cache all canvas gradients and the pipe lip sprite. */
  buildGradients(): void {
    this.grads = buildGradients(
      this.ctx,
      this.deps.width,
      this.deps.height,
      this.deps.groundH,
      this.deps.pipeWidth,
      this.colors,
    );
    this.pipeLip = buildPipeLipCache(this.deps.pipeWidth, this.dpr, this.colors);
  }

  prerenderCloud(c: Cloud): void {
    prerenderCloud(c, this.dpr, this.colors);
  }

  prerenderAllClouds(nearClouds: Cloud[], bg: BackgroundSystem): void {
    prerenderAllClouds(nearClouds, bg, this.dpr, this.colors);
  }

  /** Fill the canvas with the sky gradient. */
  drawSky(): void {
    drawSky(this.ctx, this.deps.width, this.deps.height, this.grads.skyGrad);
  }

  /** Draw all parallax background layers (clouds, skyline, buildings, trees, planes). */
  drawBackground(bg: BackgroundSystem, globalTime: number): void {
    if (!bg.layers) return;
    const ctx = this.ctx;

    ctx.globalAlpha = BG.cloudFarAlpha;
    drawCloudsPrerendered(ctx, bg.layers.farClouds);

    ctx.globalAlpha = BG.skylineAlpha;
    ctx.fillStyle = this.colors.navy;
    for (const seg of bg.layers.skyline) {
      if (seg.x > this.deps.width || seg.x + seg.totalW < 0) continue;
      drawSkylineSegment(ctx, seg);
    }

    ctx.globalAlpha = BG.cloudMidAlpha;
    drawCloudsPrerendered(ctx, bg.layers.midClouds);

    for (let i = 0; i < bg.planeActiveCount; i++) {
      drawPlane(ctx, atIndex(bg.planePool, i), globalTime, this.colors, this.fonts);
    }

    ctx.globalAlpha = BG.buildingAlpha;
    const groundY = this.deps.height - this.deps.groundH;
    for (const b of bg.layers.buildings) {
      if (b.x + b.w < 0 || b.x > this.deps.width) continue;
      drawBuilding(ctx, b, groundY, this.colors);
    }

    ctx.globalAlpha = BG.treeAlpha;
    for (const t of bg.layers.trees) {
      if (t.x + t.w < 0 || t.x > this.deps.width) continue;
      drawTree(ctx, t, this.colors);
    }

    ctx.globalAlpha = 1;
  }

  drawNearClouds(clouds: Cloud[]): void {
    this.ctx.globalAlpha = 0.12;
    drawCloudsPrerendered(this.ctx, clouds);
    this.ctx.globalAlpha = 1;
  }

  drawPipes(pipes: Pipe[], activeCount: number): void {
    drawPipes(
      this.ctx,
      pipes,
      activeCount,
      this.deps.pipeWidth,
      this.deps.pipeGap,
      this.deps.height,
      this.grads.pipeGrad,
      this.pipeLip,
    );
  }

  /** Draw the ground strip with decorations and accent gradient. */
  drawGround(bg: BackgroundSystem): void {
    drawGround(
      this.ctx,
      this.deps.width,
      this.deps.height,
      this.deps.groundH,
      this.colors,
      bg.layers?.groundDeco ?? null,
      this.grads.accentGrad,
    );
  }

  drawBird(y: number, rot: number): void {
    drawBird(this.ctx, y, rot, this.deps.birdX, this.deps.birdSize, this.heartImg, this.colors);
  }

  drawScore(score: number): void {
    drawScore(this.ctx, score, this.deps.width, this.fonts, this.colors);
  }

  drawSettingsIcon(hovered: boolean): void {
    drawSettingsIcon(this.ctx, this.deps.width, this.colors, hovered);
  }
}
