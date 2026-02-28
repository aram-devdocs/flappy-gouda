import { DEFAULT_COLORS, drawBuilding } from '@repo/engine';
import type { Building, BuildingType } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 200;
const H = 150;
const GROUND_Y = 120;
const PREVIEW_ALPHA = 0.6;

function makeBuilding(type: BuildingType, x: number, w: number, h: number): Building {
  return {
    x,
    y: GROUND_Y - h,
    w,
    h,
    type,
    windows: 2,
    speed: 0.18,
    _canvas: null,
    _cacheOffX: 0,
    _cacheOffY: 0,
    _cacheW: w,
    _cacheH: h,
  };
}

function BuildingPreview({ buildingType }: { buildingType: BuildingType }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.globalAlpha = PREVIEW_ALPHA;
      const b = makeBuilding(buildingType, 70, 40, 60);
      drawBuilding(ctx, b, GROUND_Y, DEFAULT_COLORS);
      ctx.globalAlpha = 1;

      ctx.fillStyle = DEFAULT_COLORS.navy;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.globalAlpha = 1;
    },
    [buildingType],
  );

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

function MixedRowPreview() {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.globalAlpha = PREVIEW_ALPHA;
    drawBuilding(ctx, makeBuilding('house', 10, 35, 40), GROUND_Y, DEFAULT_COLORS);
    drawBuilding(ctx, makeBuilding('apartment', 60, 30, 55), GROUND_Y, DEFAULT_COLORS);
    drawBuilding(ctx, makeBuilding('office', 110, 28, 65), GROUND_Y, DEFAULT_COLORS);
    drawBuilding(ctx, makeBuilding('house', 155, 38, 35), GROUND_Y, DEFAULT_COLORS);
    ctx.globalAlpha = 1;

    ctx.fillStyle = DEFAULT_COLORS.navy;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.globalAlpha = 1;
  }, []);

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof BuildingPreview> = {
  title: 'Canvas Assets/Buildings',
  component: BuildingPreview,
  argTypes: {
    buildingType: {
      control: 'select',
      options: ['house', 'apartment', 'office'],
    },
  },
};

export default meta;

export const House: StoryObj<typeof BuildingPreview> = {
  args: { buildingType: 'house' },
};

export const Apartment: StoryObj<typeof BuildingPreview> = {
  args: { buildingType: 'apartment' },
};

export const Office: StoryObj<typeof BuildingPreview> = {
  args: { buildingType: 'office' },
};

export const MixedRow: StoryObj<typeof MixedRowPreview> = {
  render: () => <MixedRowPreview />,
};
