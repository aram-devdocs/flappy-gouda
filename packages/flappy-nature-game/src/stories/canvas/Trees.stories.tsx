import { DEFAULT_COLORS, drawTree } from '@repo/engine';
import type { Tree, TreeType } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';
import { CanvasStage } from '../../CanvasStage';

const W = 200;
const H = 120;
const GROUND_Y = 100;
const PREVIEW_ALPHA = 0.6;

function makeTree(type: TreeType, x: number, w: number, h: number): Tree {
  return { x, y: GROUND_Y, w, h, type, speed: 0.35 };
}

function TreePreview({ treeType }: { treeType: TreeType }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.globalAlpha = PREVIEW_ALPHA;
      drawTree(ctx, makeTree(treeType, 85, 14, 35), DEFAULT_COLORS);
      ctx.globalAlpha = 1;

      ctx.fillStyle = DEFAULT_COLORS.navy;
      ctx.globalAlpha = 0.12;
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.globalAlpha = 1;
    },
    [treeType],
  );

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

function TreeLinePreview() {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.globalAlpha = PREVIEW_ALPHA;
    drawTree(ctx, makeTree('pine', 15, 12, 30), DEFAULT_COLORS);
    drawTree(ctx, makeTree('round', 40, 16, 28), DEFAULT_COLORS);
    drawTree(ctx, makeTree('pine', 70, 10, 35), DEFAULT_COLORS);
    drawTree(ctx, makeTree('round', 95, 14, 25), DEFAULT_COLORS);
    drawTree(ctx, makeTree('pine', 120, 13, 32), DEFAULT_COLORS);
    drawTree(ctx, makeTree('round', 150, 15, 30), DEFAULT_COLORS);
    ctx.globalAlpha = 1;

    ctx.fillStyle = DEFAULT_COLORS.navy;
    ctx.globalAlpha = 0.12;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
    ctx.globalAlpha = 1;
  }, []);

  return <CanvasStage width={W} height={H} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof TreePreview> = {
  title: 'Canvas Assets/Trees',
  component: TreePreview,
  argTypes: {
    treeType: { control: 'select', options: ['pine', 'round'] },
  },
};

export default meta;

export const PineTree: StoryObj<typeof TreePreview> = {
  args: { treeType: 'pine' },
};

export const RoundTree: StoryObj<typeof TreePreview> = {
  args: { treeType: 'round' },
};

export const TreeLine: StoryObj<typeof TreeLinePreview> = {
  render: () => <TreeLinePreview />,
};
