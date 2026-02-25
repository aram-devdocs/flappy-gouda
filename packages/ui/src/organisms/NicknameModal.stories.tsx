import type { Meta, StoryObj } from '@storybook/react';
import { NicknameModal } from './NicknameModal';

const meta: Meta<typeof NicknameModal> = {
  title: 'Organisms/NicknameModal',
  component: NicknameModal,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 380, height: 500 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof NicknameModal>;

export const Default: Story = {
  args: {
    visible: true,
    value: '',
    onChange: (v) => console.log('change', v),
    onSubmit: () => console.log('submit'),
    onClose: () => console.log('close'),
  },
};

export const PartialInput: Story = {
  args: { ...Default.args, value: 'AB' },
};

export const Complete: Story = {
  args: { ...Default.args, value: 'ACE' },
};

export const WithError: Story = {
  args: { ...Default.args, value: 'BAD', error: 'Nickname not allowed' },
};

export const Checking: Story = {
  args: { ...Default.args, value: 'ACE', checking: true },
};

export const Hidden: Story = {
  args: { ...Default.args, visible: false },
};
