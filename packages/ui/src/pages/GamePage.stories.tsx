import type { Meta, StoryObj } from '@storybook/react';
import { GamePage } from './GamePage';

const meta: Meta<typeof GamePage> = {
  title: 'pages/GamePage',
  component: GamePage,
};
export default meta;
type Story = StoryObj<typeof GamePage>;

export const Default: Story = {
  args: {
    title: 'Flappy Nature',
    children: (
      <div
        style={{
          width: 400,
          height: 300,
          background: '#f0f0f0',
          borderRadius: 12,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        Game placeholder
      </div>
    ),
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'My Custom Game',
    children: <div style={{ padding: 24 }}>Content goes here</div>,
  },
};
