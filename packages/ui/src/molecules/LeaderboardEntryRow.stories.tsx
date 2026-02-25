import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardEntryRow } from './LeaderboardEntryRow';

const meta: Meta<typeof LeaderboardEntryRow> = {
  title: 'Molecules/LeaderboardEntryRow',
  component: LeaderboardEntryRow,
};
export default meta;
type Story = StoryObj<typeof LeaderboardEntryRow>;

const baseEntry = {
  id: '1',
  nickname: 'ACE',
  score: 42,
  difficulty: 'normal' as const,
  createdAt: '2024-01-01T00:00:00Z',
  rank: 1,
};

export const FirstPlace: Story = {
  args: { entry: baseEntry, isPlayer: false },
};

export const SecondPlace: Story = {
  args: { entry: { ...baseEntry, id: '2', nickname: 'BOB', rank: 2, score: 38 }, isPlayer: false },
};

export const ThirdPlace: Story = {
  args: { entry: { ...baseEntry, id: '3', nickname: 'CAT', rank: 3, score: 35 }, isPlayer: false },
};

export const RegularRank: Story = {
  args: { entry: { ...baseEntry, id: '4', nickname: 'DAN', rank: 7, score: 20 }, isPlayer: false },
};

export const PlayerHighlight: Story = {
  args: { entry: baseEntry, isPlayer: true },
};

export const NewScore: Story = {
  args: { entry: baseEntry, isPlayer: true, isNew: true },
};
