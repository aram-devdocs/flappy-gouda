import type { DebugMetricsSnapshot } from '@repo/types';
import type { Meta, StoryObj } from '@storybook/react';
import { DebugPanel } from './DebugPanel';

const MOCK_METRICS: DebugMetricsSnapshot = {
  frameStats: {
    currentFps: 60,
    avgFrameMs: 16.5,
    minFrameMs: 15.8,
    maxFrameMs: 18.2,
    avgUpdateMs: 1.2,
    avgDrawMs: 3.4,
    jankCount: 2,
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
    jsHeapSizeUsed: 52428800,
    jsHeapSizeTotal: 134217728,
  },
  sparkline: Array.from({ length: 60 }, () => 16 + Math.random() * 2),
  log: [
    { timestamp: 1000, type: 'state', message: 'State changed to play' },
    { timestamp: 2000, type: 'score', message: 'Score: 1' },
    { timestamp: 3000, type: 'jank', message: 'Frame spike: 45.2ms (2.7x budget)' },
  ],
  isRecording: false,
};

const noop = () => {};

const meta: Meta<typeof DebugPanel> = {
  title: 'organisms/DebugPanel',
  component: DebugPanel,
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: '600px', background: '#eee' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof DebugPanel>;

export const Default: Story = {
  args: {
    visible: true,
    metrics: MOCK_METRICS,
    isRecording: false,
    hasRecording: false,
    onStartRecording: noop,
    onStopRecording: noop,
    onExportRecording: noop,
  },
};
export const Recording: Story = {
  args: {
    visible: true,
    metrics: MOCK_METRICS,
    isRecording: true,
    hasRecording: false,
    onStartRecording: noop,
    onStopRecording: noop,
    onExportRecording: noop,
  },
};
export const WithRecording: Story = {
  args: {
    visible: true,
    metrics: MOCK_METRICS,
    isRecording: false,
    hasRecording: true,
    onStartRecording: noop,
    onStopRecording: noop,
    onExportRecording: noop,
  },
};
export const Hidden: Story = {
  args: {
    visible: false,
    metrics: MOCK_METRICS,
    isRecording: false,
    hasRecording: false,
    onStartRecording: noop,
    onStopRecording: noop,
    onExportRecording: noop,
  },
};
