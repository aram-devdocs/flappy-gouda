import type { DebugEntityCounts, DebugFrameSnapshot } from '@repo/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DebugMetricsCollector } from '../debug-metrics';
import { EngineEventEmitter } from '../engine-events';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function makeFrameSnapshot(overrides: Partial<DebugFrameSnapshot> = {}): DebugFrameSnapshot {
  return {
    timestamp: 1000,
    deltaMs: 16.67,
    updateMs: 0.3,
    drawMs: 1.2,
    tickCount: 1,
    ...overrides,
  };
}

function makeEntityCounts(overrides: Partial<DebugEntityCounts> = {}): DebugEntityCounts {
  return {
    pipes: 0,
    clouds: 5,
    farClouds: 3,
    midClouds: 2,
    skylineSegments: 4,
    buildings: 6,
    trees: 8,
    groundDeco: 10,
    planes: 1,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DebugMetricsCollector', () => {
  let events: EngineEventEmitter;
  let collector: DebugMetricsCollector;

  beforeEach(() => {
    events = new EngineEventEmitter();
    collector = new DebugMetricsCollector(events);
  });

  afterEach(() => {
    collector.dispose();
  });

  describe('circular buffer', () => {
    it('stores up to 120 frames in the sparkline', () => {
      for (let i = 0; i < 130; i++) {
        collector.recordFrame(makeFrameSnapshot({ timestamp: 1000 + i * 200, deltaMs: 16 }));
      }
      const snap = collector.buildSnapshot();
      expect(snap.sparkline.length).toBe(120);
    });

    it('wraps correctly, preserving most recent frames', () => {
      for (let i = 0; i < 125; i++) {
        collector.recordFrame(makeFrameSnapshot({ timestamp: 1000 + i * 200, deltaMs: i + 1 }));
      }
      const snap = collector.buildSnapshot();
      // The last value should be 125 (most recent)
      expect(snap.sparkline[snap.sparkline.length - 1]).toBe(125);
      // First value should be 6 (oldest still in buffer: 125 - 120 + 1 = 6)
      expect(snap.sparkline[0]).toBe(6);
    });
  });

  describe('frame stats', () => {
    it('computes min/max/avg correctly', () => {
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1000, deltaMs: 10 }));
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1200, deltaMs: 20 }));
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1400, deltaMs: 30 }));

      const snap = collector.buildSnapshot();
      expect(snap.frameStats.minFrameMs).toBe(10);
      expect(snap.frameStats.maxFrameMs).toBe(30);
      expect(snap.frameStats.avgFrameMs).toBe(20);
    });

    it('returns zeroes when no frames recorded', () => {
      const snap = collector.buildSnapshot();
      expect(snap.frameStats.currentFps).toBe(0);
      expect(snap.frameStats.avgFrameMs).toBe(0);
      expect(snap.frameStats.minFrameMs).toBe(0);
      expect(snap.frameStats.maxFrameMs).toBe(0);
    });

    it('computes FPS from average delta', () => {
      for (let i = 0; i < 10; i++) {
        collector.recordFrame(makeFrameSnapshot({ timestamp: 1000 + i * 200, deltaMs: 16.67 }));
      }
      const snap = collector.buildSnapshot();
      expect(snap.frameStats.currentFps).toBe(60);
    });
  });

  describe('jank detection', () => {
    it('detects frames at or above 33.3ms threshold', () => {
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1000, deltaMs: 33.3 }));
      const snap = collector.buildSnapshot();
      expect(snap.frameStats.jankCount).toBe(1);
      expect(snap.frameStats.jankCountWindow).toBe(1);
    });

    it('does not flag frames below threshold', () => {
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1000, deltaMs: 33.29 }));
      const snap = collector.buildSnapshot();
      expect(snap.frameStats.jankCount).toBe(0);
    });

    it('logs jank events with spike info', () => {
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1000, deltaMs: 50 }));
      const snap = collector.buildSnapshot();
      const jankLog = snap.log.find((e) => e.type === 'jank');
      expect(jankLog).toBeDefined();
      expect(jankLog?.message).toContain('50.0ms');
      expect(jankLog?.data?.deltaMs).toBe(50);
    });
  });

  describe('entity counts', () => {
    it('includes entity counts in snapshot', () => {
      const counts = makeEntityCounts({ pipes: 3, planes: 2 });
      collector.setEntityCounts(counts);
      const snap = collector.buildSnapshot();
      expect(snap.entityCounts.pipes).toBe(3);
      expect(snap.entityCounts.planes).toBe(2);
    });
  });

  describe('log buffer', () => {
    it('caps at 200 entries with FIFO eviction', () => {
      for (let i = 0; i < 210; i++) {
        collector.logEvent('info', `Message ${i}`);
      }
      const snap = collector.buildSnapshot();
      expect(snap.log.length).toBe(200);
      expect(snap.log[0]?.message).toBe('Message 10');
      expect(snap.log[199]?.message).toBe('Message 209');
    });
  });

  describe('event emission throttling', () => {
    it('emits debugUpdate at ~125ms intervals', () => {
      const handler = vi.fn();
      events.on('debugUpdate', handler);

      // First frame always emits (lastEmitTime is 0)
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1000 }));
      expect(handler).toHaveBeenCalledTimes(1);

      // Frame 50ms later should not emit
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1050 }));
      expect(handler).toHaveBeenCalledTimes(1);

      // Frame 125ms after first emit should trigger
      collector.recordFrame(makeFrameSnapshot({ timestamp: 1125 }));
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('recording', () => {
    it('start/stop produces a valid recording structure', () => {
      collector.startRecording();
      collector.recordFrame(makeFrameSnapshot({ timestamp: 2000 }));
      collector.recordFrame(makeFrameSnapshot({ timestamp: 2200 }));
      const recording = collector.stopRecording();

      expect(recording).not.toBeNull();
      expect(recording?.version).toBe(1);
      expect(recording?.sessions.length).toBe(1);
      expect(recording?.sessions[0]?.frames.length).toBe(2);
    });

    it('returns null when not recording', () => {
      expect(collector.stopRecording()).toBeNull();
    });

    it('ignores duplicate start calls', () => {
      collector.startRecording();
      collector.startRecording(); // should be no-op
      collector.recordFrame(makeFrameSnapshot({ timestamp: 3000 }));
      const recording = collector.stopRecording();
      expect(recording?.sessions.length).toBe(1);
    });

    it('creates new session on state change to play', () => {
      collector.startRecording();
      collector.recordFrame(makeFrameSnapshot({ timestamp: 4000 }));

      // Simulate state change to play (triggers new session)
      events.emit('stateChange', 'play');
      collector.recordFrame(makeFrameSnapshot({ timestamp: 4200 }));

      const recording = collector.stopRecording();
      expect(recording?.sessions.length).toBe(2);
    });

    it('captures log events during recording', () => {
      collector.startRecording();
      collector.logEvent('info', 'Test event');
      const recording = collector.stopRecording();
      const recEvents = recording?.sessions[0]?.events ?? [];
      expect(recEvents.some((e) => e.message === 'Test event')).toBe(true);
    });
  });

  describe('engine event subscriptions', () => {
    it('logs state changes', () => {
      events.emit('stateChange', 'play');
      const snap = collector.buildSnapshot();
      expect(snap.log.some((e) => e.type === 'state' && e.message.includes('play'))).toBe(true);
    });

    it('logs score changes', () => {
      events.emit('scoreChange', 5);
      const snap = collector.buildSnapshot();
      expect(snap.log.some((e) => e.type === 'score' && e.message.includes('5'))).toBe(true);
    });

    it('logs difficulty changes', () => {
      events.emit('difficultyChange', 'hard');
      const snap = collector.buildSnapshot();
      expect(snap.log.some((e) => e.type === 'difficulty' && e.message.includes('hard'))).toBe(
        true,
      );
    });
  });

  describe('system info', () => {
    it('captures canvas and navigator fields', () => {
      const canvas = { width: 760, height: 1040 } as HTMLCanvasElement;
      collector.initSystemInfo(canvas, 2);
      const snap = collector.buildSnapshot();
      expect(snap.systemInfo.canvasWidth).toBe(760);
      expect(snap.systemInfo.canvasHeight).toBe(1040);
      expect(snap.systemInfo.devicePixelRatio).toBe(2);
      expect(snap.systemInfo.hardwareConcurrency).toBeGreaterThanOrEqual(0);
    });

    it('handles missing memory API gracefully', () => {
      const canvas = { width: 400, height: 600 } as HTMLCanvasElement;
      collector.initSystemInfo(canvas, 1);
      const snap = collector.buildSnapshot();
      // jsHeapSizeUsed may be null or number depending on environment
      expect(
        typeof snap.systemInfo.jsHeapSizeUsed === 'number' ||
          snap.systemInfo.jsHeapSizeUsed === null,
      ).toBe(true);
    });
  });

  describe('dispose', () => {
    it('clears state and stops emission', () => {
      collector.recordFrame(makeFrameSnapshot({ timestamp: 5000 }));
      collector.logEvent('info', 'Before dispose');
      collector.dispose();

      const snap = collector.buildSnapshot();
      expect(snap.sparkline.length).toBe(0);
      expect(snap.log.length).toBe(0);
      expect(snap.frameStats.jankCount).toBe(0);
    });

    it('unsubscribes from engine events', () => {
      collector.dispose();
      events.emit('stateChange', 'dead');
      // After dispose, no log entries should be added
      const snap = collector.buildSnapshot();
      expect(snap.log.length).toBe(0);
    });
  });
});
