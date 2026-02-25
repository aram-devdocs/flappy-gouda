import type { Meta, StoryObj } from '@storybook/react';
import { DebugSparkline } from './DebugSparkline';

const meta: Meta<typeof DebugSparkline> = {
  title: 'atoms/DebugSparkline',
  component: DebugSparkline,
};
export default meta;
type Story = StoryObj<typeof DebugSparkline>;

const smooth = Array.from({ length: 60 }, () => 16 + Math.random() * 2);
const janky = Array.from({ length: 60 }, (_, i) =>
  i % 15 === 0 ? 50 + Math.random() * 30 : 16 + Math.random() * 2,
);

export const Default: Story = {
  args: { values: smooth, maxValue: 80, width: 240, height: 40, jankThreshold: 33.3 },
};
export const WithJank: Story = {
  args: { values: janky, maxValue: 80, width: 240, height: 40, jankThreshold: 33.3 },
};
export const Empty: Story = {
  args: { values: [], maxValue: 80, width: 240, height: 40, jankThreshold: 33.3 },
};
