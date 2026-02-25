import type { Meta, StoryObj } from '@storybook/react';
import { DebugTab } from './DebugTab';

const meta: Meta<typeof DebugTab> = {
  title: 'atoms/DebugTab',
  component: DebugTab,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '200px' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DebugTab>;

export const Default: Story = {
  args: { visible: true, expanded: false, isRecording: false, onClick: () => {} },
};
export const Expanded: Story = {
  args: { visible: true, expanded: true, isRecording: false, onClick: () => {} },
};
export const Recording: Story = {
  args: { visible: true, expanded: false, isRecording: true, onClick: () => {} },
};
export const Hidden: Story = {
  args: { visible: false, expanded: false, isRecording: false, onClick: () => {} },
};
