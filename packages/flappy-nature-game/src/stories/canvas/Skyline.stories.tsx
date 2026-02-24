import { DEFAULT_COLORS, drawSkylineSegment, generateSkylineSegment } from '@repo/engine';
import type { SkylineCity } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useMemo } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 380;
const H = 150;
const GROUND_Y = 130;
const PREVIEW_ALPHA = 0.55;

function SkylinePreview({ city }: { city: SkylineCity }) {
  const segment = useMemo(() => generateSkylineSegment(city, 10, GROUND_Y), [city]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.globalAlpha = PREVIEW_ALPHA;
      ctx.fillStyle = DEFAULT_COLORS.navy;
      drawSkylineSegment(ctx, segment);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = '#ccc';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    [segment],
  );

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof SkylinePreview> = {
  title: 'Canvas Assets/Skyline',
  component: SkylinePreview,
  argTypes: {
    city: {
      control: 'select',
      options: ['phoenix', 'neworleans', 'montreal', 'dallas', 'nashville'],
    },
  },
};

export default meta;

export const Phoenix: StoryObj<typeof SkylinePreview> = {
  args: { city: 'phoenix' },
};

export const NewOrleans: StoryObj<typeof SkylinePreview> = {
  args: { city: 'neworleans' },
};

export const Montreal: StoryObj<typeof SkylinePreview> = {
  args: { city: 'montreal' },
};

export const Dallas: StoryObj<typeof SkylinePreview> = {
  args: { city: 'dallas' },
};

export const Nashville: StoryObj<typeof SkylinePreview> = {
  args: { city: 'nashville' },
};
