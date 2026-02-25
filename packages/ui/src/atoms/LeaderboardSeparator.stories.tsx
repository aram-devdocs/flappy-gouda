import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardSeparator } from './LeaderboardSeparator';

const meta: Meta<typeof LeaderboardSeparator> = {
  title: 'Atoms/LeaderboardSeparator',
  component: LeaderboardSeparator,
  decorators: [
    (Story) => (
      <div style={{ width: 220, background: '#fff', padding: 8 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LeaderboardSeparator>;

export const Default: Story = {
  args: { rankAbove: 3, rankBelow: 47 },
};

export const SmallGap: Story = {
  args: { rankAbove: 10, rankBelow: 13 },
};
