import type { DebugMetricsSnapshot } from '@repo/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DebugSparkline } from '../atoms/DebugSparkline';
import { DebugTab } from '../atoms/DebugTab';
import { DebugPanel } from '../organisms/DebugPanel';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function makeMetrics(overrides: Partial<DebugMetricsSnapshot> = {}): DebugMetricsSnapshot {
  return {
    frameStats: {
      currentFps: 60,
      avgFrameMs: 16.67,
      minFrameMs: 15,
      maxFrameMs: 18,
      avgUpdateMs: 0.3,
      avgDrawMs: 1.2,
      jankCount: 0,
      jankCountWindow: 0,
    },
    entityCounts: {
      pipes: 2,
      clouds: 5,
      farClouds: 3,
      midClouds: 2,
      skylineSegments: 4,
      buildings: 6,
      trees: 8,
      groundDeco: 10,
      planes: 1,
    },
    systemInfo: {
      userAgent: 'test',
      devicePixelRatio: 2,
      canvasWidth: 760,
      canvasHeight: 1040,
      hardwareConcurrency: 8,
      jsHeapSizeUsed: 15000000,
      jsHeapSizeTotal: 30000000,
    },
    sparkline: [16, 16, 17, 50],
    log: [
      { timestamp: 1000, type: 'state', message: 'State changed to play' },
      { timestamp: 2000, type: 'jank', message: 'Frame spike: 50ms' },
    ],
    isRecording: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// DebugTab
// ---------------------------------------------------------------------------

describe('DebugTab', () => {
  it('renders when visible', () => {
    render(<DebugTab visible expanded={false} isRecording={false} onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Toggle debug panel' })).toBeDefined();
    expect(screen.getByText('DEBUG')).toBeDefined();
  });

  it('returns null when not visible', () => {
    const { container } = render(
      <DebugTab visible={false} expanded={false} isRecording={false} onClick={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows REC when recording', () => {
    render(<DebugTab visible expanded={false} isRecording onClick={vi.fn()} />);
    expect(screen.getByText('REC')).toBeDefined();
  });

  it('fires onClick', () => {
    const onClick = vi.fn();
    render(<DebugTab visible expanded={false} isRecording={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

// ---------------------------------------------------------------------------
// DebugSparkline
// ---------------------------------------------------------------------------

describe('DebugSparkline', () => {
  it('renders correct number of bars', () => {
    const { container } = render(
      <DebugSparkline
        values={[16, 17, 50]}
        maxValue={80}
        width={240}
        height={40}
        jankThreshold={33.3}
      />,
    );
    const rects = container.querySelectorAll('rect');
    expect(rects.length).toBe(3);
  });

  it('returns null for empty values', () => {
    const { container } = render(
      <DebugSparkline values={[]} maxValue={80} width={240} height={40} jankThreshold={33.3} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a threshold line', () => {
    const { container } = render(
      <DebugSparkline values={[16]} maxValue={80} width={240} height={40} jankThreshold={33.3} />,
    );
    const line = container.querySelector('line');
    expect(line).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// DebugPanel
// ---------------------------------------------------------------------------

describe('DebugPanel', () => {
  const defaultProps = {
    visible: true,
    metrics: makeMetrics(),
    isRecording: false,
    hasRecording: false,
    onStartRecording: vi.fn(),
    onStopRecording: vi.fn(),
    onExportRecording: vi.fn(),
  };

  it('renders all main sections', () => {
    render(<DebugPanel {...defaultProps} />);
    expect(screen.getByText('Debug')).toBeDefined();
    expect(screen.getByText('Entities')).toBeDefined();
    expect(screen.getByText('System')).toBeDefined();
  });

  it('displays FPS and frame stats', () => {
    render(<DebugPanel {...defaultProps} />);
    expect(screen.getByText('60')).toBeDefined();
  });

  it('shows Rec button when not recording', () => {
    render(<DebugPanel {...defaultProps} />);
    expect(screen.getByText('Rec')).toBeDefined();
  });

  it('shows Stop button when recording', () => {
    render(<DebugPanel {...defaultProps} isRecording />);
    expect(screen.getByText('Stop')).toBeDefined();
  });

  it('shows Save button when recording is available', () => {
    render(<DebugPanel {...defaultProps} hasRecording />);
    expect(screen.getByText('Save')).toBeDefined();
  });

  it('fires recording callbacks', () => {
    const onStart = vi.fn();
    const onStop = vi.fn();
    const onExport = vi.fn();

    const { rerender } = render(<DebugPanel {...defaultProps} onStartRecording={onStart} />);
    fireEvent.click(screen.getByText('Rec'));
    expect(onStart).toHaveBeenCalledOnce();

    rerender(<DebugPanel {...defaultProps} isRecording onStopRecording={onStop} />);
    fireEvent.click(screen.getByText('Stop'));
    expect(onStop).toHaveBeenCalledOnce();

    rerender(<DebugPanel {...defaultProps} hasRecording onExportRecording={onExport} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it('displays log entries', () => {
    render(<DebugPanel {...defaultProps} />);
    expect(screen.getByText('State changed to play')).toBeDefined();
  });

  it('displays entity counts', () => {
    render(<DebugPanel {...defaultProps} />);
    // pipes count appears in the entities grid
    expect(screen.getByText('pipes')).toBeDefined();
    expect(screen.getByText('clouds')).toBeDefined();
  });
});
