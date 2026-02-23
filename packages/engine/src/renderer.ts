import type { Building, Cloud, GameColors, Pipe, Plane, SkylineSegment, Tree } from '@repo/types';
import type { BackgroundSystem } from './background.js';
import type { CachedFonts } from './cache.js';
import { BG } from './config.js';
import { TAU } from './math.js';

interface RendererDeps {
  width: number;
  height: number;
  groundH: number;
  pipeWidth: number;
  pipeGap: number;
  birdSize: number;
  birdX: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private deps: RendererDeps;
  private colors: GameColors;
  private fonts: CachedFonts;
  private dpr: number;
  private skyGrad: CanvasGradient | null = null;
  private accentGrad: CanvasGradient | null = null;
  private pipeGrad: CanvasGradient | null = null;
  private pipeLipCanvas: HTMLCanvasElement | null = null;
  private pipeLipLogW = 0;
  private pipeLipLogH = 0;
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

  buildGradients(): void {
    const ctx = this.ctx;
    const { width, height, groundH, pipeWidth } = this.deps;
    const CC = this.colors;

    this.skyGrad = ctx.createLinearGradient(0, 0, 0, height - groundH);
    this.skyGrad.addColorStop(0, CC.light);
    this.skyGrad.addColorStop(0.6, CC.white);
    this.skyGrad.addColorStop(1, '#F5F0F8');

    this.accentGrad = ctx.createLinearGradient(0, 0, width, 0);
    this.accentGrad.addColorStop(0, CC.magenta);
    this.accentGrad.addColorStop(1, CC.cyan);

    this.pipeGrad = ctx.createLinearGradient(0, 0, pipeWidth, 0);
    this.pipeGrad.addColorStop(0, CC.navy);
    this.pipeGrad.addColorStop(1, CC.midviolet);

    // Pre-render pipe lip
    const lipW = pipeWidth + 8;
    const lipH = 20;
    const lipR = 8;
    const offC = document.createElement('canvas');
    offC.width = lipW * this.dpr;
    offC.height = lipH * this.dpr;
    const oCtx = offC.getContext('2d');
    if (!oCtx) return;
    oCtx.scale(this.dpr, this.dpr);
    oCtx.fillStyle = CC.violet;
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
    this.pipeLipCanvas = offC;
    this.pipeLipLogW = lipW;
    this.pipeLipLogH = lipH;
  }

  prerenderCloud(c: Cloud): void {
    const pad = 4;
    const w = c.w;
    const h = w * 0.45;
    const cW = Math.ceil(w + pad * 2);
    const cH = Math.ceil(h + pad * 2);
    const offC = document.createElement('canvas');
    offC.width = cW * this.dpr;
    offC.height = cH * this.dpr;
    const oCtx = offC.getContext('2d');
    if (!oCtx) return;
    oCtx.scale(this.dpr, this.dpr);
    oCtx.fillStyle = this.colors.cyan;
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

  prerenderAllClouds(nearClouds: Cloud[], bg: BackgroundSystem): void {
    for (const c of nearClouds) this.prerenderCloud(c);
    if (bg.layers) {
      for (const c of bg.layers.farClouds) this.prerenderCloud(c);
      for (const c of bg.layers.midClouds) this.prerenderCloud(c);
    }
  }

  drawSky(): void {
    if (this.skyGrad) {
      this.ctx.fillStyle = this.skyGrad;
      this.ctx.fillRect(0, 0, this.deps.width, this.deps.height);
    }
  }

  drawBackground(bg: BackgroundSystem, globalTime: number): void {
    if (!bg.layers) return;
    const ctx = this.ctx;
    const CC = this.colors;

    // Layer 0: Far clouds
    ctx.globalAlpha = BG.cloudFarAlpha;
    this.drawCloudsPrerendered(bg.layers.farClouds);

    // Layer 1: Skyline
    ctx.globalAlpha = BG.skylineAlpha;
    ctx.fillStyle = CC.navy;
    for (const seg of bg.layers.skyline) {
      if (seg.x > this.deps.width || seg.x + seg.totalW < 0) continue;
      this.drawSkylineSegment(seg);
    }

    // Layer 2: Mid clouds
    ctx.globalAlpha = BG.cloudMidAlpha;
    this.drawCloudsPrerendered(bg.layers.midClouds);

    // Layer 3: Planes
    for (let i = 0; i < bg.planeActiveCount; i++) {
      this.drawPlane(bg.planePool[i] as Plane, globalTime);
    }

    // Layer 4: Buildings
    ctx.globalAlpha = BG.buildingAlpha;
    for (const b of bg.layers.buildings) {
      if (b.x + b.w < 0 || b.x > this.deps.width) continue;
      this.drawBuilding(b);
    }

    // Layer 5: Trees
    ctx.globalAlpha = BG.treeAlpha;
    for (const t of bg.layers.trees) {
      if (t.x + t.w < 0 || t.x > this.deps.width) continue;
      this.drawTree(t);
    }

    ctx.globalAlpha = 1;
  }

  drawNearClouds(clouds: Cloud[]): void {
    this.ctx.globalAlpha = 0.12;
    this.drawCloudsPrerendered(clouds);
    this.ctx.globalAlpha = 1;
  }

  drawPipes(pipes: Pipe[], activeCount: number): void {
    for (let i = 0; i < activeCount; i++) {
      this.drawPipe(pipes[i] as Pipe);
    }
  }

  drawGround(bg: BackgroundSystem): void {
    const ctx = this.ctx;
    const { width, height, groundH } = this.deps;
    const CC = this.colors;

    ctx.fillStyle = CC.navy;
    ctx.fillRect(0, height - groundH, width, groundH);

    // Ground deco
    if (bg.layers) {
      const groundY = height - groundH;
      const dashY = groundY + groundH / 2 - 1;
      const dotY = groundY + groundH * 0.7;
      ctx.globalAlpha = 0.15;

      ctx.fillStyle = CC.cyan;
      for (const g of bg.layers.groundDeco) {
        if (g.type === 'dash') ctx.fillRect(g.x, dashY, 8, 2);
      }

      ctx.fillStyle = CC.magenta;
      ctx.beginPath();
      for (const g of bg.layers.groundDeco) {
        if (g.type !== 'dash') {
          ctx.moveTo(g.x + 1.5, dotY);
          ctx.arc(g.x, dotY, 1.5, 0, TAU);
        }
      }
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Accent line
    if (this.accentGrad) {
      ctx.fillStyle = this.accentGrad;
      ctx.fillRect(0, height - groundH, width, 3);
    }
  }

  drawBird(y: number, rot: number): void {
    const ctx = this.ctx;
    const { birdX, birdSize } = this.deps;
    const cx = birdX + birdSize / 2;
    const cy = y + birdSize / 2;
    const rad = rot * (Math.PI / 180);
    ctx.translate(cx, cy);
    ctx.rotate(rad);

    if (this.heartImg) {
      ctx.drawImage(this.heartImg, -birdSize / 2, -birdSize / 2, birdSize, birdSize);
    } else {
      ctx.fillStyle = this.colors.violet;
      ctx.beginPath();
      ctx.arc(0, 0, birdSize / 2, 0, TAU);
      ctx.fill();
    }
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  drawScore(score: number): void {
    const ctx = this.ctx;
    ctx.font = this.fonts.score;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.colors.navy;
    ctx.globalAlpha = 0.12;
    ctx.fillText(String(score), this.deps.width / 2 + 2, 52);
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.colors.magenta;
    ctx.fillText(String(score), this.deps.width / 2, 50);
  }

  private drawCloudsPrerendered(cloudArr: Cloud[]): void {
    for (const c of cloudArr) {
      if (c._canvas) {
        this.ctx.drawImage(c._canvas, c.x - c._pad, c.y - c._pad, c._logW, c._logH);
      }
    }
  }

  private drawPipe(p: Pipe): void {
    const ctx = this.ctx;
    const W = this.deps.pipeWidth;
    const gapBottom = p.topH + this.deps.pipeGap;

    ctx.translate(p.x, 0);

    // Top pipe
    if (this.pipeGrad) {
      ctx.fillStyle = this.pipeGrad;
      ctx.fillRect(0, -4, W, p.topH + 4);
    }
    if (this.pipeLipCanvas) {
      ctx.drawImage(this.pipeLipCanvas, -4, p.topH - 20, this.pipeLipLogW, this.pipeLipLogH);
    }

    // Bottom pipe
    if (this.pipeGrad) {
      ctx.fillStyle = this.pipeGrad;
      ctx.fillRect(0, gapBottom, W, this.deps.height - gapBottom);
    }
    if (this.pipeLipCanvas) {
      ctx.drawImage(this.pipeLipCanvas, -4, gapBottom, this.pipeLipLogW, this.pipeLipLogH);
    }

    ctx.translate(-p.x, 0);
  }

  private drawSkylineSegment(seg: SkylineSegment): void {
    const ctx = this.ctx;
    for (const b of seg.buildings) {
      const x = seg.x + b.ox;
      const y = seg.groundY - b.h;
      ctx.fillRect(x, y, b.w, b.h);

      if (b.hasSpire) {
        ctx.beginPath();
        ctx.moveTo(x + b.w * 0.4, y);
        ctx.lineTo(x + b.w * 0.5, y - 12);
        ctx.lineTo(x + b.w * 0.6, y);
        ctx.fill();
      }
      if (b.hasDome) {
        ctx.beginPath();
        ctx.arc(x + b.w / 2, y, b.w * 0.35, Math.PI, 0);
        ctx.fill();
      }
      if (b.hasCactus) {
        const cacX = x + b.w + 4;
        const cacY = seg.groundY;
        ctx.fillRect(cacX, cacY - 18, 3, 18);
        ctx.fillRect(cacX - 4, cacY - 14, 4, 3);
        ctx.fillRect(cacX + 3, cacY - 11, 4, 3);
        ctx.fillRect(cacX - 4, cacY - 14, 3, -6);
        ctx.fillRect(cacX + 4, cacY - 11, 3, -5);
      }
    }
  }

  private drawPlane(p: Plane, globalTime: number): void {
    const ctx = this.ctx;
    const CC = this.colors;
    const wobbleY = Math.sin(globalTime * 0.0015 + p.wobble) * 3;
    const py = p.y + wobbleY;
    const dir = p.dir;
    const px = p.x;

    const tailX = px - 12 * dir;
    const ropeLen = 18;
    const bannerX = tailX - ropeLen * dir;
    const bw = p.bannerW;
    const bh = 16;
    const bLeft = dir > 0 ? bannerX - bw : bannerX;
    const bTop = py - bh / 2;

    // Rope
    ctx.strokeStyle = CC.navy;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = BG.bannerAlpha * 0.6;
    ctx.beginPath();
    ctx.moveTo(tailX, py);
    ctx.lineTo(dir > 0 ? bLeft + bw : bLeft, py);
    ctx.stroke();

    // Banner
    ctx.globalAlpha = BG.bannerAlpha;
    ctx.fillStyle = CC.magenta;
    this.roundRectPath(bLeft, bTop, bw, bh, 3);
    ctx.fill();

    // Banner text
    ctx.globalAlpha = BG.bannerAlpha + 0.15;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = this.fonts.banner;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.bannerText, bLeft + bw / 2, bTop + bh / 2 + 0.5);

    // Plane body
    ctx.globalAlpha = BG.planeAlpha;
    ctx.fillStyle = CC.navy;

    ctx.beginPath();
    ctx.ellipse(px, py, 12, 4, 0, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px + 12 * dir, py);
    ctx.lineTo(px + 17 * dir, py - 1.5);
    ctx.lineTo(px + 17 * dir, py + 1.5);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px + 3 * dir, py);
    ctx.lineTo(px - 4 * dir, py - 9);
    ctx.lineTo(px - 8 * dir, py - 8);
    ctx.lineTo(px - 2 * dir, py);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(px - 10 * dir, py - 1);
    ctx.lineTo(px - 14 * dir, py - 7);
    ctx.lineTo(px - 12 * dir, py);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  }

  private drawBuilding(b: Building): void {
    const ctx = this.ctx;
    const CC = this.colors;
    const groundY = this.deps.height - this.deps.groundH;

    ctx.fillStyle = CC.navy;
    switch (b.type) {
      case 'house': {
        ctx.fillRect(b.x, b.y + 8, b.w, b.h - 8);
        ctx.beginPath();
        ctx.moveTo(b.x - 3, b.y + 8);
        ctx.lineTo(b.x + b.w / 2, b.y);
        ctx.lineTo(b.x + b.w + 3, b.y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = CC.violet;
        const dw = b.w * 0.22;
        ctx.fillRect(b.x + (b.w - dw) / 2, groundY - 10, dw, 10);
        ctx.fillStyle = CC.navy;
        if (b.windows >= 1) {
          ctx.fillStyle = CC.violet;
          ctx.fillRect(b.x + 4, b.y + 14, 4, 4);
          if (b.w > 30) ctx.fillRect(b.x + b.w - 8, b.y + 14, 4, 4);
          ctx.fillStyle = CC.navy;
        }
        break;
      }
      case 'apartment': {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = CC.violet;
        const cols = Math.max(2, Math.floor(b.w / 10));
        const rows = Math.max(2, Math.floor(b.h / 14));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            ctx.fillRect(b.x + 4 + c * ((b.w - 8) / cols), b.y + 5 + r * ((b.h - 10) / rows), 3, 4);
          }
        }
        ctx.fillStyle = CC.navy;
        break;
      }
      case 'office': {
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillRect(b.x + b.w / 2 - 1, b.y - 8, 2, 8);
        ctx.fillStyle = CC.violet;
        const floors = Math.floor(b.h / 10);
        for (let f = 0; f < floors; f++) {
          ctx.fillRect(b.x + 2, b.y + 4 + f * 10, b.w - 4, 1);
        }
        ctx.fillStyle = CC.navy;
        break;
      }
    }
  }

  private drawTree(t: Tree): void {
    const ctx = this.ctx;
    const CC = this.colors;
    const cx = t.x + t.w / 2;

    ctx.fillStyle = CC.navy;
    ctx.fillRect(cx - 1.5, t.y - t.h * 0.4, 3, t.h * 0.4);

    if (t.type === 'pine') {
      ctx.beginPath();
      ctx.moveTo(cx, t.y - t.h);
      ctx.lineTo(cx - t.w / 2, t.y - t.h * 0.3);
      ctx.lineTo(cx + t.w / 2, t.y - t.h * 0.3);
      ctx.closePath();
      ctx.fillStyle = CC.violet;
      ctx.fill();
    } else {
      ctx.fillStyle = CC.violet;
      ctx.beginPath();
      ctx.arc(cx, t.y - t.h * 0.55, t.w * 0.55, 0, TAU);
      ctx.fill();
    }
  }

  private roundRectPath(x: number, y: number, w: number, h: number, r: number): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
