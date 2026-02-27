import type { Meta, StoryObj } from '@storybook/react';
import { DifficultyPicker } from './DifficultyPicker';

const meta: Meta<typeof DifficultyPicker> = {
  title: 'molecules/DifficultyPicker',
  component: DifficultyPicker,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 400, height: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DifficultyPicker>;

const bestScores = { easy: 10, normal: 5, hard: 0, souls: 0 };

export const EasyActive: Story = {
  args: {
    currentDifficulty: 'easy',
    bestScores,
    visible: true,
    onSelect: () => {},
    onClose: () => {},
  },
};
export const NormalActive: Story = {
  args: {
    currentDifficulty: 'normal',
    bestScores,
    visible: true,
    onSelect: () => {},
    onClose: () => {},
  },
};
export const HardActive: Story = {
  args: {
    currentDifficulty: 'hard',
    bestScores,
    visible: true,
    onSelect: () => {},
    onClose: () => {},
  },
};
export const Hidden: Story = {
  args: {
    currentDifficulty: 'easy',
    bestScores,
    visible: false,
    onSelect: () => {},
    onClose: () => {},
  },
};
