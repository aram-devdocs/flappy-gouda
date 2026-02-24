import { DEFAULT_COLORS, TAU, buildGradients } from '@repo/engine';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 380;
const H = 80;
const GROUND_H = 50;

function GroundPreview({ showDecorations }: { showDecorations: boolean }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const grads = buildGradients(ctx, W, H, GROUND_H, 52, DEFAULT_COLORS);

      ctx.fillStyle = DEFAULT_COLORS.navy;
      ctx.fillRect(0, H - GROUND_H, W, GROUND_H);

      if (showDecorations) {
        const dashY = H - GROUND_H + GROUND_H / 2 - 1;
        const dotY = H - GROUND_H + GROUND_H * 0.7;
        ctx.globalAlpha = 0.15;

        ctx.fillStyle = DEFAULT_COLORS.cyan;
        for (let x = 20; x < W; x += 40) {
          ctx.fillRect(x, dashY, 8, 2);
        }

        ctx.fillStyle = DEFAULT_COLORS.magenta;
        ctx.beginPath();
        for (let x = 35; x < W; x += 50) {
          ctx.moveTo(x + 1.5, dotY);
          ctx.arc(x, dotY, 1.5, 0, TAU);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (grads.accentGrad) {
        ctx.fillStyle = grads.accentGrad;
        ctx.fillRect(0, H - GROUND_H, W, 3);
      }
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
