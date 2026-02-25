import type { GameColors, GroundDeco } from '@repo/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_COLORS } from '../cache';
import { drawGround, drawSky } from '../renderer-ground';

function makeCtx(): CanvasRenderingContext2D {
  return {
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    fillStyle: '',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

function makeColors(): GameColors {
  return { ...DEFAULT_COLORS };
}

function makeDeco(): GroundDeco[] {
  return [
    { x: 20, type: 'dash', speed: 0.5 },
    { x: 40, type: 'dot', speed: 0.5 },
  ];
}

describe('drawSky', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = makeCtx();
  });

  it('fills with gradient when provided', () => {
    const grad = {} as CanvasGradient;
    drawSky(ctx, 400, 600, grad);
    expect(ctx.fillStyle).toBe(grad);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 400, 600);
  });

  it('does nothing when grad is null', () => {
    drawSky(ctx, 400, 600, null);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});

describe('drawGround', () => {
  let ctx: CanvasRenderingContext2D;
  let colors: GameColors;

  beforeEach(() => {
    ctx = makeCtx();
    colors = makeColors();
  });

  it('fills navy strip', () => {
    drawGround(ctx, 400, 600, 50, colors, null, null);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 550, 400, 50);
  });

  it('draws dashes and dots from groundDeco', () => {
    const deco = makeDeco();
    drawGround(ctx, 400, 600, 50, colors, deco, null);

    expect(ctx.fillRect).toHaveBeenCalledTimes(2);
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });

  it('draws accent strip when grad provided', () => {
    const grad = {} as CanvasGradient;
    drawGround(ctx, 400, 600, 50, colors, null, grad);

    expect(ctx.fillStyle).toBe(grad);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 550, 400, 3);
  });

  it('skips decorations when groundDeco is null', () => {
    drawGround(ctx, 400, 600, 50, colors, null, null);
    expect(ctx.beginPath).not.toHaveBeenCalled();
    expect(ctx.arc).not.toHaveBeenCalled();
  });

  it('restores globalAlpha after decorations', () => {
    const deco = makeDeco();
    drawGround(ctx, 400, 600, 50, colors, deco, null);
    expect(ctx.globalAlpha).toBe(1);
  });
});
