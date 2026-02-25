import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardMiniOverlay } from './LeaderboardMiniOverlay';

const meta: Meta<typeof LeaderboardMiniOverlay> = {
  title: 'Atoms/LeaderboardMiniOverlay',
  component: LeaderboardMiniOverlay,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 380, height: 500, background: '#87ceeb' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LeaderboardMiniOverlay>;

const top3 = [
  { id: '1', nickname: 'ACE', score: 42, difficulty: 'normal' as const, createdAt: '', rank: 1 },
  { id: '2', nickname: 'BOB', score: 38, difficulty: 'normal' as const, createdAt: '', rank: 2 },
  { id: '3', nickname: 'CAT', score: 31, difficulty: 'normal' as const, createdAt: '', rank: 3 },
];

export const Default: Story = {
  args: { entries: top3, visible: true, playerEntryId: null },
};

export const PlayerInTop3: Story = {
  args: { entries: top3, visible: true, playerEntryId: '2' },
};

export const SingleEntry: Story = {
  args: { entries: top3.slice(0, 1), visible: true, playerEntryId: null },
};

export const Hidden: Story = {
  args: { entries: top3, visible: false, playerEntryId: null },
};
