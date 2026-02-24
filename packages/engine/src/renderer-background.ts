import type { Building, Cloud, GameColors, Plane, SkylineSegment, Tree } from '@repo/types';
import type { CachedFonts } from './cache.js';
import { BG } from './config.js';
import { TAU, roundRectPath } from './math.js';

export function drawCloudsPrerendered(ctx: CanvasRenderingContext2D, cloudArr: Cloud[]): void {
  for (const c of cloudArr) {
    if (c._canvas) {
      ctx.drawImage(c._canvas, c.x - c._pad, c.y - c._pad, c._logW, c._logH);
    }
  }
}

export function drawSkylineSegment(ctx: CanvasRenderingContext2D, seg: SkylineSegment): void {
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

export function drawPlane(
  ctx: CanvasRenderingContext2D,
  p: Plane,
  globalTime: number,
  colors: GameColors,
  fonts: CachedFonts,
): void {
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

  ctx.strokeStyle = colors.navy;
  ctx.lineWidth = 0.8;
  ctx.globalAlpha = BG.bannerAlpha * 0.6;
  ctx.beginPath();
  ctx.moveTo(tailX, py);
  ctx.lineTo(dir > 0 ? bLeft + bw : bLeft, py);
  ctx.stroke();

  ctx.globalAlpha = BG.bannerAlpha;
  ctx.fillStyle = colors.magenta;
  roundRectPath(ctx, bLeft, bTop, bw, bh, 3);
  ctx.fill();

  ctx.globalAlpha = BG.bannerAlpha + 0.15;
  ctx.fillStyle = colors.white;
  ctx.font = fonts.banner;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(p.bannerText, bLeft + bw / 2, bTop + bh / 2 + 0.5);

  ctx.globalAlpha = BG.planeAlpha;
  ctx.fillStyle = colors.navy;

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

export function drawBuilding(
  ctx: CanvasRenderingContext2D,
  b: Building,
  groundY: number,
  colors: GameColors,
): void {
  ctx.fillStyle = colors.navy;
  switch (b.type) {
    case 'house': {
      ctx.fillRect(b.x, b.y + 8, b.w, b.h - 8);
      ctx.beginPath();
      ctx.moveTo(b.x - 3, b.y + 8);
      ctx.lineTo(b.x + b.w / 2, b.y);
      ctx.lineTo(b.x + b.w + 3, b.y + 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = colors.violet;
      const dw = b.w * 0.22;
      ctx.fillRect(b.x + (b.w - dw) / 2, groundY - 10, dw, 10);
      ctx.fillStyle = colors.navy;
      if (b.windows >= 1) {
        ctx.fillStyle = colors.violet;
        ctx.fillRect(b.x + 4, b.y + 14, 4, 4);
        if (b.w > 30) ctx.fillRect(b.x + b.w - 8, b.y + 14, 4, 4);
        ctx.fillStyle = colors.navy;
      }
      break;
    }
    case 'apartment': {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = colors.violet;
      const cols = Math.max(2, Math.floor(b.w / 10));
      const rows = Math.max(2, Math.floor(b.h / 14));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillRect(b.x + 4 + c * ((b.w - 8) / cols), b.y + 5 + r * ((b.h - 10) / rows), 3, 4);
        }
      }
      ctx.fillStyle = colors.navy;
      break;
    }
    case 'office': {
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillRect(b.x + b.w / 2 - 1, b.y - 8, 2, 8);
      ctx.fillStyle = colors.violet;
      const floors = Math.floor(b.h / 10);
      for (let f = 0; f < floors; f++) {
        ctx.fillRect(b.x + 2, b.y + 4 + f * 10, b.w - 4, 1);
      }
      ctx.fillStyle = colors.navy;
      break;
    }
  }
}

export function drawTree(ctx: CanvasRenderingContext2D, t: Tree, colors: GameColors): void {
  const cx = t.x + t.w / 2;

  ctx.fillStyle = colors.navy;
  ctx.fillRect(cx - 1.5, t.y - t.h * 0.4, 3, t.h * 0.4);

  if (t.type === 'pine') {
    ctx.beginPath();
    ctx.moveTo(cx, t.y - t.h);
    ctx.lineTo(cx - t.w / 2, t.y - t.h * 0.3);
    ctx.lineTo(cx + t.w / 2, t.y - t.h * 0.3);
    ctx.closePath();
    ctx.fillStyle = colors.violet;
    ctx.fill();
  } else {
    ctx.fillStyle = colors.violet;
    ctx.beginPath();
    ctx.arc(cx, t.y - t.h * 0.55, t.w * 0.55, 0, TAU);
    ctx.fill();
  }
}
