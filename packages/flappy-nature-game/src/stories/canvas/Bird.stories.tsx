import { DEFAULT_COLORS, drawBird, loadHeartImage } from '@repo/engine';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useEffect, useState } from 'react';
import { CanvasStage } from '../../CanvasStage';

const SIZE = 160;
const BIRD = 60;
const POS = (SIZE - BIRD) / 2;

function CircleBirdPreview() {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    drawBird(ctx, POS, 0, POS, BIRD, null, DEFAULT_COLORS);
  }, []);

  return (
    <CanvasStage width={SIZE} height={SIZE} backgroundColor={DEFAULT_COLORS.light} draw={draw} />
  );
}

function HeartBirdPreview({ rotation }: { rotation: number }) {
  const [heartImg, setHeartImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    loadHeartImage(DEFAULT_COLORS.magenta).then(setHeartImg);
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawBird(ctx, POS, rotation, POS, BIRD, heartImg, DEFAULT_COLORS);
    },
    [rotation, heartImg],
  );

  return (
    <CanvasStage width={SIZE} height={SIZE} backgroundColor={DEFAULT_COLORS.light} draw={draw} />
  );
}

const meta: Meta<typeof HeartBirdPreview> = {
  title: 'Canvas Assets/Bird',
  component: HeartBirdPreview,
  argTypes: {
    rotation: { control: { type: 'range', min: -20, max: 55, step: 1 } },
  },
};

export default meta;

export const CircleBird: StoryObj<typeof CircleBirdPreview> = {
  render: () => <CircleBirdPreview />,
};

export const HeartBird: StoryObj<typeof HeartBirdPreview> = {
  args: { rotation: 0 },
};

export const NoseUp: StoryObj<typeof HeartBirdPreview> = {
  args: { rotation: -20 },
};

export const NoseDown: StoryObj<typeof HeartBirdPreview> = {
  args: { rotation: 55 },
};
