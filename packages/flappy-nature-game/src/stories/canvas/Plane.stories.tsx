import { DEFAULT_COLORS, DEFAULT_FONT, buildFontCache, drawPlane } from '@repo/engine';
import type { Plane } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 320;
const H = 100;
const fonts = buildFontCache(DEFAULT_FONT);

function makePlane(dir: number, text: string, x?: number): Plane {
  return {
    x: x ?? (dir > 0 ? 80 : 240),
    y: 50,
    dir,
    bannerText: text,
    bannerW: text.length * 6 + 12,
    wobble: 0,
    speed: 0.6,
  };
}

function PlanePreview({ direction, bannerText }: { direction: number; bannerText: string }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.globalAlpha = 1;
      const plane = makePlane(direction, bannerText);
      drawPlane(ctx, plane, 0, DEFAULT_COLORS, fonts);
      ctx.globalAlpha = 1;
    },
    [direction, bannerText],
  );

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof PlanePreview> = {
  title: 'Canvas Assets/Plane',
  component: PlanePreview,
  argTypes: {
    direction: { control: 'select', options: [1, -1] },
    bannerText: { control: 'text' },
  },
};

export default meta;

export const GoingRight: StoryObj<typeof PlanePreview> = {
  args: { direction: 1, bannerText: 'FLAP!' },
};

export const GoingLeft: StoryObj<typeof PlanePreview> = {
  args: { direction: -1, bannerText: 'NATURE' },
};

export const WithCustomText: StoryObj<typeof PlanePreview> = {
  args: { direction: 1, bannerText: 'HELLO WORLD' },
};
