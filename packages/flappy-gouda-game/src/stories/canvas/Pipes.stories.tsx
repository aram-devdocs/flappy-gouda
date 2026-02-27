import { DEFAULT_COLORS, buildGradients, buildPipeLipCache, drawPipes } from '@repo/engine';
import type { Pipe } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useMemo } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 200;
const H = 400;
const PIPE_W = 52;

function PipesPreview({ gapSize, topH }: { gapSize: number; topH: number }) {
  const pipes: Pipe[] = useMemo(
    () => [{ x: 74, topH, scored: false, gap: gapSize }],
    [topH, gapSize],
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const grads = buildGradients(ctx, W, H, 50, PIPE_W, DEFAULT_COLORS);
      const lip = buildPipeLipCache(PIPE_W, 1, DEFAULT_COLORS);
      drawPipes(ctx, pipes, 1, PIPE_W, gapSize, H, grads.pipeGrad, lip);
    },
    [pipes, gapSize],
  );

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof PipesPreview> = {
  title: 'Canvas Assets/Pipes',
  component: PipesPreview,
  argTypes: {
    gapSize: { control: { type: 'range', min: 80, max: 250, step: 5 } },
    topH: { control: { type: 'range', min: 40, max: 280, step: 5 } },
  },
};

export default meta;

export const SinglePair: StoryObj<typeof PipesPreview> = {
  args: { gapSize: 162, topH: 120 },
};

export const NarrowGap: StoryObj<typeof PipesPreview> = {
  args: { gapSize: 100, topH: 150 },
};

export const WideGap: StoryObj<typeof PipesPreview> = {
  args: { gapSize: 220, topH: 100 },
};
