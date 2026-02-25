import type { Meta, StoryObj } from '@storybook/react';
import { SettingsMenu } from './SettingsMenu';

const meta: Meta<typeof SettingsMenu> = {
  title: 'molecules/SettingsMenu',
  component: SettingsMenu,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 400, height: 300 }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof SettingsMenu>;

export const WithNickname: Story = {
  args: {
    visible: true,
    nickname: 'ABC',
    onDifficultyClick: () => {},
    onNicknameClear: () => {},
    onClose: () => {},
  },
};
export const WithoutNickname: Story = {
  args: {
    visible: true,
    nickname: null,
    onDifficultyClick: () => {},
    onNicknameClear: () => {},
    onClose: () => {},
  },
};
export const Hidden: Story = {
  args: {
    visible: false,
    nickname: 'ABC',
    onDifficultyClick: () => {},
    onNicknameClear: () => {},
    onClose: () => {},
  },
};
