import {
  BG,
  DEFAULT_COLORS,
  DEFAULT_FONT,
  buildFontCache,
  buildGradients,
  buildPipeLipCache,
  drawBird,
  drawBuilding,
  drawCloudsPrerendered,
  drawGround,
  drawPipes,
  drawScore,
  drawSky,
  drawSkylineSegment,
  drawTree,
  generateSkylineSegment,
  prerenderCloud,
} from '@repo/engine';
import type { Building, Cloud, Pipe, Tree } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useMemo } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 380;
const H = 520;
const GROUND_H = 50;
const GROUND_Y = H - GROUND_H;

function makePrerenderedCloud(x: number, y: number, w: number): Cloud {
  const c: Cloud = { x, y, w, speed: 0.2, _canvas: null, _pad: 0, _logW: 0, _logH: 0 };
  prerenderCloud(c, 1, DEFAULT_COLORS);
  return c;
}

function FullScenePreview({ score, birdY }: { score: number; birdY: number }) {
  const clouds = useMemo(
    () => [
      makePrerenderedCloud(30, 40, 70),
      makePrerenderedCloud(150, 20, 90),
      makePrerenderedCloud(280, 55, 60),
    ],
    [],
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const fonts = buildFontCache(DEFAULT_FONT);
      const grads = buildGradients(ctx, W, H, GROUND_H, 52, DEFAULT_COLORS);
      const lip = buildPipeLipCache(52, 1, DEFAULT_COLORS);

      // Sky
      drawSky(ctx, W, H, grads.skyGrad);

      // Far clouds
      ctx.globalAlpha = BG.cloudFarAlpha;
      drawCloudsPrerendered(ctx, clouds);

      // Skyline
      ctx.globalAlpha = BG.skylineAlpha;
      ctx.fillStyle = DEFAULT_COLORS.navy;
      const seg = generateSkylineSegment('dallas', 20, GROUND_Y);
      drawSkylineSegment(ctx, seg);
      const seg2 = generateSkylineSegment('montreal', 180, GROUND_Y);
      drawSkylineSegment(ctx, seg2);

      // Buildings
      ctx.globalAlpha = BG.buildingAlpha;
      const houses: Building[] = [
        {
          x: 30,
          y: GROUND_Y - 40,
          w: 35,
          h: 40,
          type: 'house',
          windows: 2,
          speed: 0.18,
          _cacheOffX: 0,
          _cacheOffY: 0,
          _cacheW: 35,
          _cacheH: 40,
        },
        {
          x: 140,
          y: GROUND_Y - 55,
          w: 30,
          h: 55,
          type: 'apartment',
          windows: 3,
          speed: 0.18,
          _cacheOffX: 0,
          _cacheOffY: 0,
          _cacheW: 30,
          _cacheH: 55,
        },
        {
          x: 250,
          y: GROUND_Y - 60,
          w: 28,
          h: 60,
          type: 'office',
          windows: 4,
          speed: 0.18,
          _cacheOffX: 0,
          _cacheOffY: 0,
          _cacheW: 28,
          _cacheH: 60,
        },
      ];
      for (const b of houses) drawBuilding(ctx, b, GROUND_Y, DEFAULT_COLORS);

      // Trees
      ctx.globalAlpha = BG.treeAlpha;
      const trees: Tree[] = [
        { x: 80, y: GROUND_Y, w: 12, h: 30, type: 'pine', speed: 0.35 },
        { x: 200, y: GROUND_Y, w: 16, h: 28, type: 'round', speed: 0.35 },
        { x: 320, y: GROUND_Y, w: 10, h: 32, type: 'pine', speed: 0.35 },
      ];
      for (const t of trees) drawTree(ctx, t, DEFAULT_COLORS);
      ctx.globalAlpha = 1;

      // Near clouds
      ctx.globalAlpha = 0.12;
      drawCloudsPrerendered(ctx, clouds);
      ctx.globalAlpha = 1;

      // Pipes
      const pipes: Pipe[] = [
        { x: 200, topH: 140, scored: false, gap: 162 },
        { x: 330, topH: 200, scored: false, gap: 162 },
      ];
      drawPipes(ctx, pipes, 2, 52, 162, H, grads.pipeGrad, lip);

      // Ground
      drawGround(ctx, W, H, GROUND_H, DEFAULT_COLORS, null, grads.accentGrad);

      // Bird
      drawBird(ctx, birdY, 0, 70, 28, null, DEFAULT_COLORS);

      // Score
      drawScore(ctx, score, W, fonts, DEFAULT_COLORS);
    },
    [score, birdY, clouds],
  );

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof FullScenePreview> = {
  title: 'Canvas Assets/Full Scene',
  component: FullScenePreview,
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 99, step: 1 } },
    birdY: { control: { type: 'range', min: 50, max: 420, step: 5 } },
  },
};

export default meta;

export const CompleteScene: StoryObj<typeof FullScenePreview> = {
  args: { score: 7, birdY: 220 },
};
