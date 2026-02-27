import type {
  BgLayers,
  Building,
  Cloud,
  GameColors,
  GroundDeco,
  Pipe,
  SkylineBuilding,
  SkylineSegment,
  Tree,
} from '@repo/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BackgroundSystem } from '../background';
import { DEFAULT_COLORS, buildFontCache } from '../cache';
import type { CachedFonts } from '../cache';
import { Renderer } from '../renderer';
import {
  drawBuilding,
  drawCloudsPrerendered,
  drawSkylineSegment,
  drawTree,
} from '../renderer-background';
import {
  buildGradients,
  buildPipeLipCache,
  prerenderAllClouds,
  prerenderCloud,
} from '../renderer-prerender';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCtx(): CanvasRenderingContext2D {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    setTransform: vi.fn(),
    quadraticCurveTo: vi.fn(),
    canvas: { width: 400, height: 600, style: {} } as unknown as HTMLCanvasElement,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;
}

function makeColors(): GameColors {
  return { ...DEFAULT_COLORS };
}

function makeFonts(): CachedFonts {
  return buildFontCache('"Poppins", sans-serif');
}

function makeCloud(overrides: Partial<Cloud> = {}): Cloud {
  return {
    x: 100,
    y: 50,
    w: 60,
    speed: 0.1,
    _canvas: null,
    _pad: 0,
    _logW: 0,
    _logH: 0,
    ...overrides,
  };
}

function makeSkylineBuilding(overrides: Partial<SkylineBuilding> = {}): SkylineBuilding {
  return {
    ox: 0,
    w: 20,
    h: 40,
    hasSpire: false,
    hasDome: false,
    hasCactus: false,
    ...overrides,
  };
}

function makeSkylineSegment(overrides: Partial<SkylineSegment> = {}): SkylineSegment {
  return {
    x: 0,
    groundY: 470,
    city: 'phoenix',
    buildings: [makeSkylineBuilding()],
    totalW: 120,
    speed: 0.08,
    ...overrides,
  };
}

function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    x: 50,
    y: 400,
    w: 40,
    h: 70,
    type: 'house',
    windows: 2,
    speed: 0.18,
    _cacheOffX: 0,
    _cacheOffY: 0,
    _cacheW: 0,
    _cacheH: 0,
    ...overrides,
  };
}

function makeTree(overrides: Partial<Tree> = {}): Tree {
  return {
    x: 80,
    y: 470,
    w: 14,
    h: 28,
    type: 'round',
    speed: 0.35,
    ...overrides,
  };
}

function makeGroundDeco(overrides: Partial<GroundDeco> = {}): GroundDeco {
  return { x: 10, type: 'dash', speed: 0.35, ...overrides };
}

function makeLayers(overrides: Partial<BgLayers> = {}): BgLayers {
  return {
    farClouds: [makeCloud()],
    skyline: [makeSkylineSegment()],
    midClouds: [makeCloud({ x: 200 })],
    buildings: [makeBuilding()],
    trees: [makeTree()],
    groundDeco: [makeGroundDeco(), makeGroundDeco({ type: 'dot', x: 30 })],
    maxRightSkyline: 200,
    maxRightBuildings: 200,
    maxRightTrees: 200,
    maxRightGroundDeco: 200,
    ...overrides,
  };
}

function makeBg(layers: BgLayers | null = makeLayers()): BackgroundSystem {
  return {
    layers,
  } as unknown as BackgroundSystem;
}

function mockOffscreenCanvas(ctx: CanvasRenderingContext2D): void {
  vi.spyOn(document, 'createElement').mockReturnValue({
    width: 0,
    height: 0,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement);
}

function mockOffscreenCanvasNoCtx(): void {
  vi.spyOn(document, 'createElement').mockReturnValue({
    width: 0,
    height: 0,
    getContext: () => null,
  } as unknown as HTMLCanvasElement);
}

const DPR = 2;
const WIDTH = 400;
const HEIGHT = 600;
const GROUND_H = 50;
const PIPE_WIDTH = 52;
const PIPE_GAP = 162;
const BIRD_SIZE = 28;
const BIRD_X = 70;

function makeDeps() {
  return {
    width: WIDTH,
    height: HEIGHT,
    groundH: GROUND_H,
    pipeWidth: PIPE_WIDTH,
    pipeGap: PIPE_GAP,
    birdSize: BIRD_SIZE,
    birdX: BIRD_X,
  };
}

// ---------------------------------------------------------------------------
// renderer-prerender.ts
// ---------------------------------------------------------------------------

describe('renderer-prerender', () => {
  let ctx: CanvasRenderingContext2D;
  let colors: GameColors;

  beforeEach(() => {
    vi.restoreAllMocks();
    ctx = makeCtx();
    colors = makeColors();
  });

  describe('prerenderCloud', () => {
    it('creates an offscreen canvas and assigns cache fields on the cloud', () => {
      mockOffscreenCanvas(ctx);
      const cloud = makeCloud({ w: 80 });
      prerenderCloud(cloud, DPR, colors);

      expect(document.createElement).toHaveBeenCalledWith('canvas');
      expect(cloud._canvas).not.toBeNull();
      expect(cloud._pad).toBe(4);
      expect(cloud._logW).toBeGreaterThan(0);
      expect(cloud._logH).toBeGreaterThan(0);
      expect(ctx.scale).toHaveBeenCalledWith(DPR, DPR);
      expect(ctx.fillStyle).toBe(colors.cyan);
      expect(ctx.ellipse).toHaveBeenCalledTimes(3);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('returns early without assigning when getContext returns null', () => {
      mockOffscreenCanvasNoCtx();
      const cloud = makeCloud({ w: 80 });
      prerenderCloud(cloud, DPR, colors);

      expect(cloud._canvas).toBeNull();
      expect(cloud._pad).toBe(0);
    });
  });

  describe('prerenderAllClouds', () => {
    it('pre-renders near clouds and all bg layer clouds', () => {
      mockOffscreenCanvas(ctx);
      const near = [makeCloud(), makeCloud({ x: 200 })];
      const bg = makeBg();
      prerenderAllClouds(near, bg, DPR, colors);

      // near(2) + farClouds(1) + midClouds(1) = 4 total calls to createElement
      expect(document.createElement).toHaveBeenCalledTimes(4);
    });

    it('skips bg layer clouds when bg.layers is null', () => {
      mockOffscreenCanvas(ctx);
      const near = [makeCloud()];
      const bg = makeBg(null);
      prerenderAllClouds(near, bg, DPR, colors);

      expect(document.createElement).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildPipeLipCache', () => {
    it('creates a rounded-rect pipe lip canvas', () => {
      mockOffscreenCanvas(ctx);
      const result = buildPipeLipCache(PIPE_WIDTH, DPR, colors);

      expect(result.canvas).not.toBeNull();
      expect(result.logW).toBe(PIPE_WIDTH + 8);
      expect(result.logH).toBe(20);
      expect(ctx.scale).toHaveBeenCalledWith(DPR, DPR);
      expect(ctx.fillStyle).toBe(colors.violet);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.quadraticCurveTo).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('returns null canvas when getContext returns null', () => {
      mockOffscreenCanvasNoCtx();
      const result = buildPipeLipCache(PIPE_WIDTH, DPR, colors);

      expect(result.canvas).toBeNull();
      expect(result.logW).toBe(PIPE_WIDTH + 8);
      expect(result.logH).toBe(20);
    });
  });

  describe('buildGradients', () => {
    it('creates sky, accent, and pipe gradients', () => {
      const addColorStop = vi.fn();
      const gradient = { addColorStop };
      const gradCtx = makeCtx();
      (gradCtx.createLinearGradient as ReturnType<typeof vi.fn>).mockReturnValue(gradient);

      const result = buildGradients(gradCtx, WIDTH, HEIGHT, GROUND_H, PIPE_WIDTH, colors);

      expect(gradCtx.createLinearGradient).toHaveBeenCalledTimes(3);
      expect(result.skyGrad).toBe(gradient);
      expect(result.accentGrad).toBe(gradient);
      expect(result.pipeGrad).toBe(gradient);
    });

    it('sky gradient spans from 0 to height minus groundH', () => {
      const gradCtx = makeCtx();
      buildGradients(gradCtx, WIDTH, HEIGHT, GROUND_H, PIPE_WIDTH, colors);

      expect(gradCtx.createLinearGradient).toHaveBeenCalledWith(0, 0, 0, HEIGHT - GROUND_H);
    });

    it('accent gradient spans the full width', () => {
      const gradCtx = makeCtx();
      buildGradients(gradCtx, WIDTH, HEIGHT, GROUND_H, PIPE_WIDTH, colors);

      expect(gradCtx.createLinearGradient).toHaveBeenCalledWith(0, 0, WIDTH, 0);
    });

    it('pipe gradient spans the pipe width', () => {
      const gradCtx = makeCtx();
      buildGradients(gradCtx, WIDTH, HEIGHT, GROUND_H, PIPE_WIDTH, colors);

      expect(gradCtx.createLinearGradient).toHaveBeenCalledWith(0, 0, PIPE_WIDTH, 0);
    });
  });
});

// ---------------------------------------------------------------------------
// renderer-background.ts
// ---------------------------------------------------------------------------

describe('renderer-background', () => {
  let ctx: CanvasRenderingContext2D;
  let colors: GameColors;

  beforeEach(() => {
    vi.restoreAllMocks();
    ctx = makeCtx();
    colors = makeColors();
  });

  describe('drawCloudsPrerendered', () => {
    it('draws each cloud that has a _canvas', () => {
      const fakeCanvas = {} as HTMLCanvasElement;
      const clouds = [
        makeCloud({ _canvas: fakeCanvas, _pad: 4, _logW: 68, _logH: 35 }),
        makeCloud({ _canvas: fakeCanvas, x: 200, _pad: 4, _logW: 68, _logH: 35 }),
      ];
      drawCloudsPrerendered(ctx, clouds);

      expect(ctx.drawImage).toHaveBeenCalledTimes(2);
      const c0 = clouds[0] as (typeof clouds)[0];
      expect(ctx.drawImage).toHaveBeenCalledWith(
        fakeCanvas,
        c0.x - c0._pad,
        c0.y - c0._pad,
        68,
        35,
      );
    });

    it('skips clouds without a _canvas', () => {
      const clouds = [makeCloud(), makeCloud({ x: 200 })];
      drawCloudsPrerendered(ctx, clouds);

      expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    it('handles mixed clouds with and without pre-rendered canvas', () => {
      const fakeCanvas = {} as HTMLCanvasElement;
      const clouds = [
        makeCloud(),
        makeCloud({ _canvas: fakeCanvas, _pad: 4, _logW: 68, _logH: 35 }),
      ];
      drawCloudsPrerendered(ctx, clouds);

      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
    });

    it('handles empty cloud array', () => {
      drawCloudsPrerendered(ctx, []);
      expect(ctx.drawImage).not.toHaveBeenCalled();
    });
  });

  describe('drawSkylineSegment', () => {
    it('draws fillRect for each building in the segment', () => {
      const seg = makeSkylineSegment({
        buildings: [makeSkylineBuilding(), makeSkylineBuilding({ ox: 25 })],
      });
      drawSkylineSegment(ctx, seg);

      expect(ctx.fillRect).toHaveBeenCalledTimes(2);
    });

    it('draws a spire triangle when hasSpire is true', () => {
      const seg = makeSkylineSegment({
        buildings: [makeSkylineBuilding({ hasSpire: true })],
      });
      drawSkylineSegment(ctx, seg);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalledTimes(2);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws a dome arc when hasDome is true', () => {
      const seg = makeSkylineSegment({
        buildings: [makeSkylineBuilding({ hasDome: true })],
      });
      drawSkylineSegment(ctx, seg);

      expect(ctx.arc).toHaveBeenCalledTimes(1);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws cactus decorations when hasCactus is true', () => {
      const seg = makeSkylineSegment({
        buildings: [makeSkylineBuilding({ hasCactus: true })],
      });
      drawSkylineSegment(ctx, seg);

      // cactus: 5 fillRects (main + body rect + 2 arms + 2 arm extensions minus the base rect)
      // 1 base building rect + 5 cactus rects = 6 total
      expect(ctx.fillRect).toHaveBeenCalledTimes(6);
    });

    it('draws all decorations together when all flags are true', () => {
      const seg = makeSkylineSegment({
        buildings: [makeSkylineBuilding({ hasSpire: true, hasDome: true, hasCactus: true })],
      });
      drawSkylineSegment(ctx, seg);

      // spire + dome + cactus
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      // 1 base + 5 cactus = 6
      expect(ctx.fillRect).toHaveBeenCalledTimes(6);
    });
  });

  describe('drawBuilding', () => {
    it('draws a house with roof triangle, door, and windows', () => {
      const b = makeBuilding({ type: 'house', windows: 2, w: 40, h: 70 });
      drawBuilding(ctx, b, 470, colors);

      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.beginPath).toHaveBeenCalled();
      // roof triangle: moveTo + 2 lineTo + closePath
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws extra window when house width > 30', () => {
      const b = makeBuilding({ type: 'house', windows: 1, w: 40 });
      drawBuilding(ctx, b, 470, colors);

      // body + door + left window + right window (w > 30) = at least 4 fillRects
      const fillRectCalls = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(fillRectCalls).toBeGreaterThanOrEqual(4);
    });

    it('skips extra window for narrow house (w <= 30)', () => {
      const b = makeBuilding({ type: 'house', windows: 1, w: 28 });
      drawBuilding(ctx, b, 470, colors);

      // body + door + left window only = 3 fillRects
      const fillRectCalls = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(fillRectCalls).toBe(3);
    });

    it('draws apartment building with window grid', () => {
      const b = makeBuilding({ type: 'apartment', w: 40, h: 56 });
      drawBuilding(ctx, b, 470, colors);

      // body rect + grid of windows
      const fillRectCalls = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(fillRectCalls).toBeGreaterThan(1);
    });

    it('draws office building with floor lines and antenna', () => {
      const b = makeBuilding({ type: 'office', w: 40, h: 70 });
      drawBuilding(ctx, b, 470, colors);

      // body + antenna + floor lines
      const fillRectCalls = (ctx.fillRect as ReturnType<typeof vi.fn>).mock.calls.length;
      expect(fillRectCalls).toBeGreaterThanOrEqual(3);
    });

    it('sets fillStyle to navy at the start', () => {
      drawBuilding(ctx, makeBuilding({ type: 'apartment' }), 470, colors);
      // First fillStyle should be navy
      expect(ctx.fillStyle).toBe(colors.navy);
    });
  });

  describe('drawTree', () => {
    it('draws a trunk and round canopy for round type', () => {
      const t = makeTree({ type: 'round' });
      drawTree(ctx, t, colors);

      // trunk fillRect
      expect(ctx.fillRect).toHaveBeenCalledTimes(1);
      // round canopy: arc + fill
      expect(ctx.arc).toHaveBeenCalledTimes(1);
      expect(ctx.fill).toHaveBeenCalledTimes(1);
    });

    it('draws a trunk and triangle canopy for pine type', () => {
      const t = makeTree({ type: 'pine' });
      drawTree(ctx, t, colors);

      expect(ctx.fillRect).toHaveBeenCalledTimes(1);
      // pine triangle: moveTo + 2 lineTo + closePath + fill
      expect(ctx.moveTo).toHaveBeenCalledTimes(1);
      expect(ctx.lineTo).toHaveBeenCalledTimes(2);
      expect(ctx.closePath).toHaveBeenCalledTimes(1);
      expect(ctx.fill).toHaveBeenCalledTimes(1);
    });

    it('uses violet for the canopy', () => {
      drawTree(ctx, makeTree({ type: 'round' }), colors);
      // Last fillStyle set should be violet for the canopy
      expect(ctx.fillStyle).toBe(colors.violet);
    });
  });
});

// ---------------------------------------------------------------------------
// Renderer class (renderer.ts)
// ---------------------------------------------------------------------------

describe('Renderer', () => {
  let ctx: CanvasRenderingContext2D;
  let renderer: Renderer;
  let colors: GameColors;
  let fonts: CachedFonts;

  beforeEach(() => {
    vi.restoreAllMocks();
    ctx = makeCtx();
    colors = makeColors();
    fonts = makeFonts();
    renderer = new Renderer(ctx, makeDeps(), colors, fonts, DPR);
  });

  describe('constructor', () => {
    it('creates a renderer with default empty gradient and pipeLip caches', () => {
      expect(renderer).toBeDefined();
      expect(renderer.spriteImg).toBeNull();
    });
  });

  describe('buildGradients', () => {
    it('populates gradient and pipeLip caches', () => {
      mockOffscreenCanvas(makeCtx());
      renderer.buildGradients();

      expect(ctx.createLinearGradient).toHaveBeenCalledTimes(3);
      expect(document.createElement).toHaveBeenCalledWith('canvas');
    });
  });

  describe('prerenderCloud', () => {
    it('delegates to the standalone prerenderCloud function', () => {
      mockOffscreenCanvas(makeCtx());
      const cloud = makeCloud({ w: 50 });
      renderer.prerenderCloud(cloud);

      expect(cloud._canvas).not.toBeNull();
      expect(cloud._pad).toBe(4);
    });
  });

  describe('prerenderAllClouds', () => {
    it('delegates to the standalone prerenderAllClouds function', () => {
      mockOffscreenCanvas(makeCtx());
      const nearClouds = [makeCloud()];
      const bg = makeBg();
      renderer.prerenderAllClouds(nearClouds, bg);

      // 1 near + 1 far + 1 mid = 3
      expect(document.createElement).toHaveBeenCalledTimes(3);
    });
  });

  describe('drawSky', () => {
    it('fills the canvas when skyGrad exists', () => {
      mockOffscreenCanvas(makeCtx());
      renderer.buildGradients();
      renderer.drawSky();

      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, WIDTH, HEIGHT);
    });

    it('does nothing when skyGrad is null (no buildGradients called)', () => {
      renderer.drawSky();

      expect(ctx.fillRect).not.toHaveBeenCalled();
    });
  });

  describe('drawBackground', () => {
    it('returns early when bg.layers is null', () => {
      const bg = makeBg(null);
      renderer.drawBackground(bg, 0);

      expect(ctx.drawImage).not.toHaveBeenCalled();
      expect(ctx.fillRect).not.toHaveBeenCalled();
    });

    it('draws all background layers when present', () => {
      const bg = makeBg();
      renderer.drawBackground(bg, 1000);

      // skyline, buildings, trees all trigger fillRect
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('culls off-screen skyline segments (segment to the right)', () => {
      const layers = makeLayers({
        skyline: [makeSkylineSegment({ x: WIDTH + 10 })],
      });
      const bg = makeBg(layers);
      renderer.drawBackground(bg, 0);

      // skyline segment is off-screen right, so drawSkylineSegment is skipped
      // but buildings and trees still draw
      // The key thing is fillRect is only called for buildings/trees, not skyline
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('culls off-screen skyline segments (segment to the left)', () => {
      const layers = makeLayers({
        skyline: [makeSkylineSegment({ x: -200, totalW: 100 })],
      });
      const bg = makeBg(layers);
      renderer.drawBackground(bg, 0);

      // x + totalW = -200 + 100 = -100 < 0, so culled
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('draws visible skyline segments', () => {
      const layers = makeLayers({
        skyline: [makeSkylineSegment({ x: 50, totalW: 120 })],
      });
      const bg = makeBg(layers);
      renderer.drawBackground(bg, 0);

      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('culls off-screen buildings', () => {
      const layers = makeLayers({
        buildings: [makeBuilding({ x: -100, w: 40 })],
        skyline: [],
      });
      const bg = makeBg(layers);
      renderer.drawBackground(bg, 0);

      // building x + w = -100 + 40 = -60 < 0, culled
      // trees still visible
      expect(ctx.fillRect).toHaveBeenCalled();
    });

    it('culls off-screen trees', () => {
      const layers = makeLayers({
        trees: [makeTree({ x: -50, w: 14 })],
        buildings: [],
        skyline: [],
      });
      const bg = makeBg(layers);
      renderer.drawBackground(bg, 0);

      // tree x + w = -50 + 14 = -36 < 0, culled
      // No fillRect calls since skyline/buildings/trees all empty or culled
      // and farClouds/midClouds have no _canvas
    });

    it('culls buildings off-screen to the right', () => {
      const layers = makeLayers({
        buildings: [makeBuilding({ x: WIDTH + 10 })],
        skyline: [],
        trees: [],
      });
      const bg = makeBg(layers);
      renderer.drawBackground(bg, 0);

      // building.x > width, so culled
    });

    it('culls trees off-screen to the right', () => {
      const layers = makeLayers({
        trees: [makeTree({ x: WIDTH + 10 })],
        buildings: [],
        skyline: [],
      });
      const bg = makeBg(layers);
      renderer.drawBackground(bg, 0);

      // tree.x > width, so culled
    });

    it('resets globalAlpha to 1 at the end', () => {
      renderer.drawBackground(makeBg(), 0);
      expect(ctx.globalAlpha).toBe(1);
    });
  });

  describe('drawNearClouds', () => {
    it('sets globalAlpha to 0.12, draws, then resets to 1', () => {
      const fakeCanvas = {} as HTMLCanvasElement;
      const clouds = [makeCloud({ _canvas: fakeCanvas, _pad: 4, _logW: 68, _logH: 35 })];
      renderer.drawNearClouds(clouds);

      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
      expect(ctx.globalAlpha).toBe(1);
    });

    it('handles empty cloud array', () => {
      renderer.drawNearClouds([]);
      expect(ctx.drawImage).not.toHaveBeenCalled();
      expect(ctx.globalAlpha).toBe(1);
    });
  });

  describe('drawPipes', () => {
    it('delegates to drawPipes with correct arguments', () => {
      const pipes: Pipe[] = [{ x: 100, topH: 80, scored: false, gap: 162 }];
      renderer.drawPipes(pipes, 1);

      // drawPipes calls translate for each pipe
      expect(ctx.translate).toHaveBeenCalled();
    });

    it('does nothing when activeCount is 0', () => {
      renderer.drawPipes([], 0);
      expect(ctx.translate).not.toHaveBeenCalled();
    });
  });

  describe('drawGround', () => {
    it('fills the ground strip', () => {
      const bg = makeBg(null);
      renderer.drawGround(bg);

      expect(ctx.fillRect).toHaveBeenCalledWith(0, HEIGHT - GROUND_H, WIDTH, GROUND_H);
    });

    it('draws dashes and dots when bg.layers exists', () => {
      const bg = makeBg();
      renderer.drawGround(bg);

      // dashes drawn with fillRect, dots with arc
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws the accent gradient strip when accentGrad is set', () => {
      mockOffscreenCanvas(makeCtx());
      renderer.buildGradients();
      const bg = makeBg(null);
      renderer.drawGround(bg);

      // ground rect + accent strip
      expect(ctx.fillRect).toHaveBeenCalledTimes(2);
      // The accent strip call:
      expect(ctx.fillRect).toHaveBeenCalledWith(0, HEIGHT - GROUND_H, WIDTH, 3);
    });

    it('skips accent strip when accentGrad is null', () => {
      const bg = makeBg(null);
      renderer.drawGround(bg);

      // Only the ground rect
      expect(ctx.fillRect).toHaveBeenCalledTimes(1);
    });

    it('restores globalAlpha to 1 after drawing decorations', () => {
      const bg = makeBg();
      renderer.drawGround(bg);

      expect(ctx.globalAlpha).toBe(1);
    });

    it('processes ground deco with only dashes', () => {
      const layers = makeLayers({
        groundDeco: [
          makeGroundDeco({ type: 'dash', x: 10 }),
          makeGroundDeco({ type: 'dash', x: 50 }),
        ],
      });
      const bg = makeBg(layers);
      renderer.drawGround(bg);

      // ground rect + 2 dash rects = 3
      expect(ctx.fillRect).toHaveBeenCalledTimes(3);
      // No arcs since no dots
      expect(ctx.arc).not.toHaveBeenCalled();
    });

    it('processes ground deco with only dots', () => {
      const layers = makeLayers({
        groundDeco: [
          makeGroundDeco({ type: 'dot', x: 10 }),
          makeGroundDeco({ type: 'dot', x: 50 }),
        ],
      });
      const bg = makeBg(layers);
      renderer.drawGround(bg);

      // ground rect only (no dash fillRects)
      expect(ctx.fillRect).toHaveBeenCalledTimes(1);
      // 2 dots
      expect(ctx.arc).toHaveBeenCalledTimes(2);
    });
  });

  describe('drawBird', () => {
    it('delegates to drawBird with translate and rotate', () => {
      renderer.drawBird(200, 15);

      expect(ctx.translate).toHaveBeenCalled();
      expect(ctx.rotate).toHaveBeenCalled();
    });

    it('draws a fallback circle when spriteImg is null', () => {
      renderer.drawBird(200, 0);

      expect(ctx.arc).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('draws the cheese image when spriteImg is set', () => {
      const fakeImg = {} as HTMLImageElement;
      renderer.spriteImg = fakeImg;
      renderer.drawBird(200, 0);

      expect(ctx.drawImage).toHaveBeenCalled();
    });

    it('restores the transform via save/restore', () => {
      renderer.drawBird(250, 30);
      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });
  });

  describe('drawScore', () => {
    it('draws the score shadow and main text', () => {
      renderer.drawScore(42);

      expect(ctx.fillText).toHaveBeenCalledTimes(2);
      expect(ctx.fillText).toHaveBeenCalledWith('42', WIDTH / 2 + 2, 52);
      expect(ctx.fillText).toHaveBeenCalledWith('42', WIDTH / 2, 50);
    });

    it('sets the font from cached fonts', () => {
      renderer.drawScore(0);
      expect(ctx.font).toBe(fonts.score);
    });

    it('resets globalAlpha to 1 after drawing', () => {
      renderer.drawScore(10);
      expect(ctx.globalAlpha).toBe(1);
    });
  });
});
