import type { Meta, StoryObj } from '@storybook/react';
import { GameHeader } from './GameHeader';

const meta: Meta<typeof GameHeader> = {
  title: 'organisms/GameHeader',
  component: GameHeader,
};
export default meta;
type Story = StoryObj<typeof GameHeader>;

export const Default: Story = {
  args: {
    brandName: 'Flappy Nature',
    difficulty: 'normal',
    bestScore: 10,
    difficultyVisible: true,
    onDifficultyClick: () => {},
  },
};

export const NoBestScore: Story = {
  args: {
    brandName: 'Flappy Nature',
    difficulty: 'easy',
    bestScore: 0,
    difficultyVisible: true,
    onDifficultyClick: () => {},
  },
};

export const DifficultyHidden: Story = {
  args: {
    brandName: 'Flappy Nature',
    difficulty: 'normal',
    bestScore: 42,
    difficultyVisible: false,
    onDifficultyClick: () => {},
  },
};

export const HardDifficulty: Story = {
  args: {
    brandName: 'Flappy Nature',
    difficulty: 'hard',
    bestScore: 99,
    difficultyVisible: true,
    onDifficultyClick: () => {},
  },
};
