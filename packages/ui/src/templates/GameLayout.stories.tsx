import type { Meta, StoryObj } from '@storybook/react';
import { GameLayout } from './GameLayout';

const meta: Meta<typeof GameLayout> = {
  title: 'templates/GameLayout',
  component: GameLayout,
};
export default meta;
type Story = StoryObj<typeof GameLayout>;

export const Default: Story = {
  args: {
    header: <div style={{ padding: '8px 12px', fontWeight: 600 }}>Header</div>,
    children: (
      <div style={{ height: 200, background: '#f0f0f0', display: 'grid', placeItems: 'center' }}>
        Game Area
      </div>
    ),
    footer: <div style={{ padding: '6px 12px', textAlign: 'center', fontSize: 10 }}>Footer</div>,
  },
};

export const CustomColors: Story = {
  args: {
    header: <div style={{ padding: '8px 12px', fontWeight: 600 }}>Themed Header</div>,
    children: (
      <div style={{ height: 200, background: '#e8e0f0', display: 'grid', placeItems: 'center' }}>
        Themed Game Area
      </div>
    ),
    footer: <div style={{ padding: '6px 12px', textAlign: 'center', fontSize: 10 }}>Footer</div>,
    colors: { navy: '#1a1a2e', violet: '#e94560' },
  },
};
