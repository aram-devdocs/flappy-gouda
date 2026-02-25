import type { Meta, StoryObj } from '@storybook/react';
import { Stat } from './DebugStat';

const meta: Meta<typeof Stat> = {
  title: 'atoms/DebugStat',
  component: Stat,
};
export default meta;
type Story = StoryObj<typeof Stat>;

export const Default: Story = { args: { label: 'FPS', value: 60 } };
export const StringValue: Story = { args: { label: 'avg', value: '16.7ms' } };
export const Warning: Story = { args: { label: 'jank', value: 12, warn: true } };
export const Zero: Story = { args: { label: 'score', value: 0 } };
