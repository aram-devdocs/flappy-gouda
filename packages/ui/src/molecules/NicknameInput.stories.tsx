import type { Meta, StoryObj } from '@storybook/react';
import { NicknameInput } from './NicknameInput';

const meta: Meta<typeof NicknameInput> = {
  title: 'Molecules/NicknameInput',
  component: NicknameInput,
};
export default meta;
type Story = StoryObj<typeof NicknameInput>;

export const Empty: Story = {
  args: {
    value: '',
    onChange: (v) => console.log('change', v),
  },
};

export const Partial: Story = {
  args: { ...Empty.args, value: 'AB' },
};

export const Complete: Story = {
  args: { ...Empty.args, value: 'ACE' },
};

export const WithError: Story = {
  args: { ...Empty.args, value: 'BAD', error: 'Nickname not allowed' },
};

export const Checking: Story = {
  args: { ...Empty.args, value: 'ACE', checking: true },
};
