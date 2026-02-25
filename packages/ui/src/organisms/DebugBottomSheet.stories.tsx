import type { DebugMetricsSnapshot } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { DebugBottomSheet } from './DebugBottomSheet';

const MOCK_METRICS: DebugMetricsSnapshot = {
  frameStats: {
    currentFps: 60,
    avgFrameMs: 16.5,
    minFrameMs: 15.8,
    maxFrameMs: 18.2,
    avgUpdateMs: 1.2,
    avgDrawMs: 3.4,
    jankCount: 0,
    jankCountWindow: 0,
  },
  entityCounts: {
    pipes: 4,
    clouds: 6,
    farClouds: 3,
    midClouds: 2,
    skylineSegments: 5,
    buildings: 8,
    trees: 12,
    groundDeco: 4,
    planes: 1,
  },
  systemInfo: {
    userAgent: 'Storybook',
    devicePixelRatio: 2,
    canvasWidth: 800,
    canvasHeight: 600,
    hardwareConcurrency: 8,
    jsHeapSizeUsed: null,
    jsHeapSizeTotal: null,
  },
  sparkline: Array.from({ length: 60 }, () => 16 + Math.random() * 2),
  log: [],
  isRecording: false,
};

const meta: Meta<typeof DebugBottomSheet> = {
  title: 'organisms/DebugBottomSheet',
  component: DebugBottomSheet,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '400px', background: '#eee' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DebugBottomSheet>;

export const Default: Story = {
  args: { visible: true, metrics: MOCK_METRICS, isRecording: false },
};
export const Recording: Story = {
  args: { visible: true, metrics: MOCK_METRICS, isRecording: true },
};
export const Hidden: Story = {
  args: { visible: false, metrics: MOCK_METRICS, isRecording: false },
};
