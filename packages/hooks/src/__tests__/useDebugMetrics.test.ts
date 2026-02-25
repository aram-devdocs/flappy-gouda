import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDebugMetrics } from '../useDebugMetrics';

import type { DebugMetricsSnapshot } from '@repo/types';

// ---------------------------------------------------------------------------
// Mock engine
// ---------------------------------------------------------------------------

interface MockEngine {
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  startDebugRecording: ReturnType<typeof vi.fn>;
  stopDebugRecording: ReturnType<typeof vi.fn>;
}

function makeMockEngine(): MockEngine {
  return {
    on: vi.fn(),
    off: vi.fn(),
    startDebugRecording: vi.fn(),
    stopDebugRecording: vi.fn(() => ({
      version: 1,
      startTime: 0,
      endTime: 100,
      systemInfo: {} as DebugMetricsSnapshot['systemInfo'],
      sessions: [],
    })),
  };
}

function makeSnapshot(overrides: Partial<DebugMetricsSnapshot> = {}): DebugMetricsSnapshot {
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
      jsHeapSizeUsed: null,
      jsHeapSizeTotal: null,
    },
    sparkline: [16, 16, 17],
    log: [],
    isRecording: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useDebugMetrics', () => {
  it('returns null metrics initially', () => {
    const engine = makeMockEngine();
    const engineRef = { current: engine as unknown as import('@repo/engine').FlappyEngine };
    const { result } = renderHook(() => useDebugMetrics(engineRef));
    expect(result.current.metrics).toBeNull();
    expect(result.current.isRecording).toBe(false);
  });

  it('subscribes to debugUpdate and updates state', () => {
    const engine = makeMockEngine();
    const engineRef = { current: engine as unknown as import('@repo/engine').FlappyEngine };
    const { result } = renderHook(() => useDebugMetrics(engineRef));

    // Extract the handler that was registered
    const [eventName, handler] = engine.on.mock.calls[0] as [
      string,
      (s: DebugMetricsSnapshot) => void,
    ];
    expect(eventName).toBe('debugUpdate');

    const snap = makeSnapshot({ isRecording: true });
    act(() => handler(snap));

    expect(result.current.metrics).toEqual(snap);
    expect(result.current.isRecording).toBe(true);
  });

  it('unsubscribes on unmount', () => {
    const engine = makeMockEngine();
    const engineRef = { current: engine as unknown as import('@repo/engine').FlappyEngine };
    const { unmount } = renderHook(() => useDebugMetrics(engineRef));

    unmount();
    expect(engine.off).toHaveBeenCalledWith('debugUpdate', expect.anything());
  });

  it('startRecording calls engine method', () => {
    const engine = makeMockEngine();
    const engineRef = { current: engine as unknown as import('@repo/engine').FlappyEngine };
    const { result } = renderHook(() => useDebugMetrics(engineRef));

    act(() => result.current.startRecording());
    expect(engine.startDebugRecording).toHaveBeenCalledOnce();
  });

  it('stopRecording calls engine and stores result', () => {
    const engine = makeMockEngine();
    const engineRef = { current: engine as unknown as import('@repo/engine').FlappyEngine };
    const { result } = renderHook(() => useDebugMetrics(engineRef));

    const recordings: Array<ReturnType<typeof result.current.stopRecording>> = [];
    act(() => {
      recordings.push(result.current.stopRecording());
    });
    expect(engine.stopDebugRecording).toHaveBeenCalledOnce();
    const recording = recordings[0];
    expect(recording).not.toBeNull();
    expect(recording?.version).toBe(1);
  });

  it('exportRecording returns null without a recording', () => {
    const engine = makeMockEngine();
    const engineRef = { current: engine as unknown as import('@repo/engine').FlappyEngine };
    const { result } = renderHook(() => useDebugMetrics(engineRef));

    expect(result.current.exportRecording()).toBeNull();
  });

  it('returns null metrics when engine ref is null', () => {
    const engineRef = { current: null };
    const { result } = renderHook(() => useDebugMetrics(engineRef));
    expect(result.current.metrics).toBeNull();
  });
});
