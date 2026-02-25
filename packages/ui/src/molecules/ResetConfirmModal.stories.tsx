import type { Meta, StoryObj } from '@storybook/react';
import { ResetConfirmModal } from './ResetConfirmModal';

const meta: Meta<typeof ResetConfirmModal> = {
  title: 'molecules/ResetConfirmModal',
  component: ResetConfirmModal,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 400, height: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ResetConfirmModal>;

export const Default: Story = {
  args: {
    visible: true,
    onConfirm: () => {},
    onCancel: () => {},
  },
};

export const Hidden: Story = {
  args: {
    visible: false,
    onConfirm: () => {},
    onCancel: () => {},
  },
};
