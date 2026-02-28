import type { Cloud, GameColors, Pipe } from '@repo/types';
import type { BackgroundSystem } from './background';
import type { CachedFonts } from './cache';
import { drawCloudsPrerendered } from './renderer-background';
import { ICON_SIZE } from './renderer-entities';
import {
  renderBird,
  renderGround,
  renderPipes,
  renderScoreWithEffects,
  renderSettingsIcon,
} from './renderer-fg';
import type { CanvasContexts, RendererDeps } from './renderer-fg';
import { drawSky } from './renderer-ground';
import { drawFarLayer, drawMidLayer } from './renderer-layers';
import { buildPipeLipCache, buildSettingsIconCache } from './renderer-prerender';
import type { GradientCache, PipeLipCache, SettingsIconCache } from './renderer-prerender';

const BG_REDRAW_MS = 0;
const MG_REDRAW_MS = 0;

/** Canvas 2D renderer supporting layered or single-context rendering. */
export class Renderer {
  private bgCtx: CanvasRenderingContext2D;
  private mgCtx: CanvasRenderingContext2D;
  private fgCtx: CanvasRenderingContext2D;
  private deps: RendererDeps;
  private colors: GameColors;
  private fonts: CachedFonts;
  private dpr: number;
  private grads: GradientCache = { skyGrad: null, accentGrad: null, pipeGrad: null };
  private pipeLip: PipeLipCache = { canvas: null, logW: 0, logH: 0 };
  private iconCache: SettingsIconCache = { normal: null, hovered: null, logW: 0, logH: 0 };
  private cachedScoreStr = '0';
  private cachedScoreNum = -1;
  private lastBgDraw = 0;
  private lastMgDraw = 0;
  spriteImg: HTMLImageElement | null = null;

  constructor(
    ctxOrContexts: CanvasRenderingContext2D | CanvasContexts,
    deps: RendererDeps,
    colors: GameColors,
    fonts: CachedFonts,
    dpr: number,
  ) {
    const layered = typeof ctxOrContexts === 'object' && 'bg' in ctxOrContexts;
    this.bgCtx = layered ? ctxOrContexts.bg : ctxOrContexts;
    this.mgCtx = layered ? ctxOrContexts.mg : ctxOrContexts;
    this.fgCtx = layered ? ctxOrContexts.fg : ctxOrContexts;
    this.deps = deps;
    this.colors = colors;
    this.fonts = fonts;
    this.dpr = dpr;
  }

  private get isLayered(): boolean {
    return this.bgCtx !== this.fgCtx;
  }
  dispose(): void {
    this.grads = { skyGrad: null, accentGrad: null, pipeGrad: null };
    this.pipeLip = { canvas: null, logW: 0, logH: 0 };
    this.iconCache = { normal: null, hovered: null, logW: 0, logH: 0 };
    this.cachedScoreStr = '0';
    this.cachedScoreNum = -1;
    this.spriteImg = null;
    this.lastBgDraw = this.lastMgDraw = 0;
  }
  buildGradients(): void {
    const { width, height, groundH, pipeWidth } = this.deps;
    const c = this.colors;
    const skyGrad = this.bgCtx.createLinearGradient(0, 0, 0, height - groundH);
    skyGrad.addColorStop(0, c.light);
    skyGrad.addColorStop(0.6, c.white);
    skyGrad.addColorStop(1, c.skyBottom);
    const accentGrad = this.fgCtx.createLinearGradient(0, 0, width, 0);
    accentGrad.addColorStop(0, c.magenta);
    accentGrad.addColorStop(1, c.cyan);
    const pipeGrad = this.fgCtx.createLinearGradient(0, 0, pipeWidth, 0);
    pipeGrad.addColorStop(0, c.navy);
    pipeGrad.addColorStop(1, c.midviolet);
    this.grads = { skyGrad, accentGrad, pipeGrad };
    this.pipeLip = buildPipeLipCache(pipeWidth, this.dpr, c);
    this.iconCache = buildSettingsIconCache(ICON_SIZE, this.dpr, c);
  }
  markAllDirty(): void {
    this.lastBgDraw = this.lastMgDraw = 0;
  }
  drawBgLayer(bg: BackgroundSystem, now: number): void {
    if (this.isLayered && now - this.lastBgDraw < BG_REDRAW_MS) return;
    this.lastBgDraw = now;
    drawSky(this.bgCtx, this.deps.width, this.deps.height, this.grads.skyGrad);
    if (bg.layers) {
      drawFarLayer(
        this.bgCtx,
        bg.layers.farClouds,
        bg.layers.skyline,
        this.deps.width,
        this.dpr,
        this.colors,
      );
    }
  }
  drawMgLayer(bg: BackgroundSystem, nearClouds: Cloud[], now: number): void {
    if (this.isLayered && now - this.lastMgDraw < MG_REDRAW_MS) return;
    this.lastMgDraw = now;
    if (this.isLayered) this.mgCtx.clearRect(0, 0, this.deps.width, this.deps.height);
    if (bg.layers) {
      const groundY = this.deps.height - this.deps.groundH;
      drawMidLayer(
        this.mgCtx,
        bg.layers.midClouds,
        bg.layers.buildings,
        bg.layers.trees,
        groundY,
        this.deps.width,
        this.dpr,
        this.colors,
      );
    }
    this.mgCtx.globalAlpha = 0.12;
    drawCloudsPrerendered(this.mgCtx, nearClouds);
    this.mgCtx.globalAlpha = 1;
  }

  clearFg(): void {
    if (this.isLayered) this.fgCtx.clearRect(0, 0, this.deps.width, this.deps.height);
  }

  drawPipes(pipes: Pipe[], activeCount: number): void {
    const d = this.deps;
    renderPipes(
      this.fgCtx,
      pipes,
      activeCount,
      d.pipeWidth,
      d.pipeGap,
      d.height,
      this.grads,
      this.pipeLip,
    );
  }
  drawGround(bg: BackgroundSystem): void {
    renderGround(
      this.fgCtx,
      bg,
      this.deps.width,
      this.deps.height,
      this.deps.groundH,
      this.colors,
      this.grads.accentGrad,
    );
  }
  drawBird(y: number, rot: number): void {
    renderBird(
      this.fgCtx,
      y,
      rot,
      this.deps.birdX,
      this.deps.birdSize,
      this.spriteImg,
      this.colors,
    );
  }

  drawScore(score: number, scale = 1, flashAlpha = 0): void {
    if (score !== this.cachedScoreNum) {
      this.cachedScoreNum = score;
      this.cachedScoreStr = String(score);
    }
    renderScoreWithEffects(
      this.fgCtx,
      this.cachedScoreStr,
      this.deps.width,
      this.fonts,
      this.colors,
      scale,
      flashAlpha,
    );
  }

  translateFg(x: number, y: number): void {
    this.fgCtx.translate(x, y);
  }
  drawScreenFlash(alpha: number): void {
    if (alpha <= 0) return;
    this.fgCtx.globalAlpha = alpha;
    this.fgCtx.fillStyle = '#ffffff';
    this.fgCtx.fillRect(0, 0, this.deps.width, this.deps.height);
    this.fgCtx.globalAlpha = 1;
  }
  drawSettingsIcon(hovered: boolean): void {
    renderSettingsIcon(this.fgCtx, this.deps.width, this.colors, this.iconCache, hovered);
  }
}
