import type { Meta, StoryObj } from '@storybook/react';
import { LiveRankOverlay } from './LiveRankOverlay';

const meta: Meta<typeof LiveRankOverlay> = {
  title: 'atoms/LiveRankOverlay',
  component: LiveRankOverlay,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 380, height: 120, background: '#1a1a2e' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LiveRankOverlay>;

export const Default: Story = { args: { visible: true, rank: 47, improving: false } };
export const Improving: Story = { args: { visible: true, rank: 12, improving: true } };
export const TopRank: Story = { args: { visible: true, rank: 1, improving: true } };
export const Hidden: Story = { args: { visible: false, rank: 47, improving: false } };
export const NullRank: Story = { args: { visible: true, rank: null, improving: false } };
