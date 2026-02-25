import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardSidebar } from './LeaderboardSidebar';

const meta: Meta<typeof LeaderboardSidebar> = {
  title: 'Organisms/LeaderboardSidebar',
  component: LeaderboardSidebar,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 240, height: 500 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LeaderboardSidebar>;

const NICKNAMES = ['ACE', 'BOB', 'CAT', 'DAN', 'EVE', 'FAY', 'GUS', 'HAL', 'IVY', 'JAX'];

const entries = NICKNAMES.map((nickname, i) => ({
  id: `${i + 1}`,
  nickname,
  score: 100 - i * 8,
  difficulty: 'normal' as const,
  createdAt: '2024-01-01T00:00:00Z',
  rank: i + 1,
}));

const playerEntry = {
  id: '5',
  nickname: 'EVE',
  score: 68,
  difficulty: 'normal' as const,
  createdAt: '2024-01-01T00:00:00Z',
  rank: 5,
};

export const Default: Story = {
  args: {
    visible: true,
    entries,
    playerEntry,
    isLoading: false,
    difficulty: 'normal',
    connectionStatus: 'connected',
  },
};

export const Loading: Story = {
  args: { ...Default.args, entries: [], isLoading: true },
};

export const Empty: Story = {
  args: { ...Default.args, entries: [], playerEntry: null, isLoading: false },
};

export const Hidden: Story = {
  args: { ...Default.args, visible: false },
};

export const HardDifficulty: Story = {
  args: { ...Default.args, difficulty: 'hard' },
};
