import type { LeaderboardWindowItem } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardPanel } from './LeaderboardPanel';

const meta: Meta<typeof LeaderboardPanel> = {
  title: 'Organisms/LeaderboardPanel',
  component: LeaderboardPanel,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 380, height: 500 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LeaderboardPanel>;

const NICKNAMES = ['ACE', 'BOB', 'CAT', 'DAN', 'EVE', 'FAY', 'GUS', 'HAL', 'IVY', 'JAX'];

const items: LeaderboardWindowItem[] = NICKNAMES.map((nickname, i) => ({
  type: 'entry',
  entry: {
    id: `${i + 1}`,
    nickname,
    score: 100 - i * 8,
    difficulty: 'normal' as const,
    createdAt: '2024-01-01T00:00:00Z',
    rank: i + 1,
  },
}));

export const Default: Story = {
  args: {
    visible: true,
    items,
    playerEntryId: '5',
    isLoading: false,
    onClose: () => console.log('close'),
    difficulty: 'normal',
  },
};

export const Loading: Story = {
  args: { ...Default.args, items: [], isLoading: true },
};

export const Empty: Story = {
  args: { ...Default.args, items: [], playerEntryId: null, isLoading: false },
};

export const Hidden: Story = {
  args: { ...Default.args, visible: false },
};

export const HardDifficulty: Story = {
  args: { ...Default.args, difficulty: 'hard' },
};

export const WithSeparator: Story = {
  args: {
    ...Default.args,
    items: [
      ...items.slice(0, 3),
      { type: 'separator', rankAbove: 3, rankBelow: 8 },
      ...items.slice(7, 10),
    ],
  },
};
