import type { Meta, StoryObj } from '@storybook/react';
import { ScoreMigrationModal } from './ScoreMigrationModal';

const meta: Meta<typeof ScoreMigrationModal> = {
  title: 'organisms/ScoreMigrationModal',
  component: ScoreMigrationModal,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 400, height: 500 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ScoreMigrationModal>;

const comparisons = [
  { difficulty: 'easy' as const, label: 'Easy', oldScore: 5, newScore: 3, isImprovement: true },
  {
    difficulty: 'normal' as const,
    label: 'Normal',
    oldScore: 10,
    newScore: 12,
    isImprovement: false,
  },
  { difficulty: 'hard' as const, label: 'Hard', oldScore: 8, newScore: 0, isImprovement: true },
];

export const Default: Story = {
  args: { visible: true, comparisons, onAccept: () => {}, onDecline: () => {} },
};

export const AllImprovements: Story = {
  args: {
    visible: true,
    comparisons: comparisons.map((c) => ({ ...c, newScore: 0, isImprovement: true })),
    onAccept: () => {},
    onDecline: () => {},
  },
};

export const NoImprovements: Story = {
  args: {
    visible: true,
    comparisons: comparisons.map((c) => ({ ...c, oldScore: 0, isImprovement: false })),
    onAccept: () => {},
    onDecline: () => {},
  },
};

export const Hidden: Story = {
  args: { visible: false, comparisons, onAccept: () => {}, onDecline: () => {} },
};
