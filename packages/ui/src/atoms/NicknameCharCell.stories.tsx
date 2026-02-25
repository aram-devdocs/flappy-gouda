import type { Meta, StoryObj } from '@storybook/react';
import { NicknameCharCell } from './NicknameCharCell';

const meta: Meta<typeof NicknameCharCell> = {
  title: 'Atoms/NicknameCharCell',
  component: NicknameCharCell,
};
export default meta;
type Story = StoryObj<typeof NicknameCharCell>;

export const Empty: Story = {
  args: { char: '', active: false, index: 0 },
};

export const Active: Story = {
  args: { char: '', active: true, index: 0 },
};

export const Filled: Story = {
  args: { char: 'A', active: false, index: 0 },
};

export const FilledActive: Story = {
  args: { char: 'A', active: true, index: 1 },
};
