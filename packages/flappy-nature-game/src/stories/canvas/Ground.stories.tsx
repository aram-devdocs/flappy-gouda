import { DEFAULT_COLORS, buildGradients, drawGround } from '@repo/engine';
import type { GroundDeco } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 380;
const H = 80;
const GROUND_H = 50;

function makeStoryGroundDeco(width: number): GroundDeco[] {
  const deco: GroundDeco[] = [];
  for (let x = 20; x < width; x += 40) {
    deco.push({ x, type: 'dash', speed: 0 });
  }
  for (let x = 35; x < width; x += 50) {
    deco.push({ x, type: 'dot', speed: 0 });
  }
  return deco;
}

function GroundPreview({ showDecorations }: { showDecorations: boolean }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const grads = buildGradients(ctx, W, H, GROUND_H, 52, DEFAULT_COLORS);
      const deco = showDecorations ? makeStoryGroundDeco(W) : null;
      drawGround(ctx, W, H, GROUND_H, DEFAULT_COLORS, deco, grads.accentGrad);
    },
    [showDecorations],
  );

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof GroundPreview> = {
  title: 'Canvas Assets/Ground',
  component: GroundPreview,
  argTypes: {
    showDecorations: { control: 'boolean' },
  },
};

export default meta;

export const GroundStrip: StoryObj<typeof GroundPreview> = {
  args: { showDecorations: false },
};

export const WithDecorations: StoryObj<typeof GroundPreview> = {
  args: { showDecorations: true },
};
