import type { Meta, StoryObj } from '@storybook/react';
import { GameFooter } from './GameFooter';

const meta: Meta<typeof GameFooter> = {
  title: 'atoms/GameFooter',
  component: GameFooter,
};
export default meta;
type Story = StoryObj<typeof GameFooter>;

export const Default: Story = { args: { text: 'Made with ♥ by the Finance Team' } };
export const CustomText: Story = { args: { text: 'Built with love' } };
export const Empty: Story = { args: { text: '' } };
