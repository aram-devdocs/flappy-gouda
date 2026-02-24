import {
  DEFAULT_COLORS,
  DEFAULT_FONT,
  buildFontCache,
  drawScore,
  drawSettingsIcon,
} from '@repo/engine';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';
import { CanvasStage } from '../../CanvasStage';

const fonts = buildFontCache(DEFAULT_FONT);

function ScorePreview({ score }: { score: number }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawScore(ctx, score, 200, fonts, DEFAULT_COLORS);
    },
    [score],
  );

  return <CanvasStage width={200} height={80} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

function SettingsPreview({ hovered }: { hovered: boolean }) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      drawSettingsIcon(ctx, 200, DEFAULT_COLORS, hovered);
    },
    [hovered],
  );

  return <CanvasStage width={200} height={50} backgroundColor={DEFAULT_COLORS.light} draw={draw} />;
}

const meta: Meta<typeof ScorePreview> = {
  title: 'Canvas Assets/Score & UI',
  component: ScorePreview,
  argTypes: {
    score: { control: { type: 'range', min: 0, max: 999, step: 1 } },
  },
};

export default meta;

export const ScoreDigits: StoryObj<typeof ScorePreview> = {
  args: { score: 42 },
};

export const ScoreZero: StoryObj<typeof ScorePreview> = {
  args: { score: 0 },
};

export const ScoreHigh: StoryObj<typeof ScorePreview> = {
  args: { score: 999 },
};

export const SettingsDefault: StoryObj<typeof SettingsPreview> = {
  render: (args: { hovered: boolean }) => <SettingsPreview {...args} />,
  args: { hovered: false },
  argTypes: { hovered: { control: 'boolean' } },
};

export const SettingsHovered: StoryObj<typeof SettingsPreview> = {
  render: (args: { hovered: boolean }) => <SettingsPreview {...args} />,
  args: { hovered: true },
  argTypes: { hovered: { control: 'boolean' } },
};
