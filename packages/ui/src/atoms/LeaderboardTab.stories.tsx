import type { Meta, StoryObj } from '@storybook/react';
import { LeaderboardTab } from './LeaderboardTab';

const meta: Meta<typeof LeaderboardTab> = {
  title: 'Atoms/LeaderboardTab',
  component: LeaderboardTab,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 380, height: 500, background: '#f0f0f0' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof LeaderboardTab>;

export const Connected: Story = {
  args: {
    visible: true,
    expanded: false,
    onClick: () => console.log('click'),
    connectionStatus: 'connected',
  },
};

export const Connecting: Story = {
  args: { ...Connected.args, connectionStatus: 'connecting' },
};

export const Disconnected: Story = {
  args: { ...Connected.args, connectionStatus: 'disconnected' },
};

export const ErrorStatus: Story = {
  args: { ...Connected.args, connectionStatus: 'error' },
};

export const Expanded: Story = {
  args: { ...Connected.args, expanded: true },
};

export const NewScore: Story = {
  args: { ...Connected.args, hasNewScore: true },
};

export const Hidden: Story = {
  args: { ...Connected.args, visible: false },
};
