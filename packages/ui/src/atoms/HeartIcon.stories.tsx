import type { Meta, StoryObj } from '@storybook/react';
import { HeartIcon } from './HeartIcon';

const meta: Meta<typeof HeartIcon> = {
  title: 'atoms/HeartIcon',
  component: HeartIcon,
};
export default meta;
type Story = StoryObj<typeof HeartIcon>;

export const Default: Story = {};
export const Small: Story = { args: { size: 24 } };
export const Large: Story = { args: { size: 96 } };
export const CustomColor: Story = { args: { color: '#FF4081' } };
