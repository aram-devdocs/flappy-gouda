import type {
  DebugEntityCounts,
  DebugFrameSnapshot,
  DebugLogEntry,
  DebugMetricsSnapshot,
  DebugRecording,
  DebugRecordingSession,
  DebugSystemInfo,
  GameState,
} from '@repo/types';
import { buildDebugSnapshot } from './debug-snapshot.js';
import type { EngineEventEmitter } from './engine-events.js';

const BUFFER_SIZE = 120;
const JANK_THRESHOLD_MS = 33.3;
const MAX_LOG_ENTRIES = 200;
const EMIT_INTERVAL_MS = 125;

interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
}

const EMPTY_COUNTS: DebugEntityCounts = {
  pipes: 0,
  clouds: 0,
  farClouds: 0,
  midClouds: 0,
  skylineSegments: 0,
  buildings: 0,
  trees: 0,
  groundDeco: 0,
  planes: 0,
};
const EMPTY_SYS: DebugSystemInfo = {
  userAgent: '',
  devicePixelRatio: 1,
  canvasWidth: 0,
  canvasHeight: 0,
  hardwareConcurrency: 0,
  jsHeapSizeUsed: null,
  jsHeapSizeTotal: null,
};

/** Pure TS debug metrics collector. Zero React dependencies. */
export class DebugMetricsCollector {
  private buffer: DebugFrameSnapshot[] = new Array(BUFFER_SIZE);
  private writeIndex = 0;
  private frameCount = 0;
  private jankCount = 0;
  private logEntries: DebugLogEntry[] = [];
  private entityCounts: DebugEntityCounts = { ...EMPTY_COUNTS };
  private systemInfo: DebugSystemInfo = { ...EMPTY_SYS };
  private lastEmitTime = 0;
  private recording = false;
  private recordingSessions: DebugRecordingSession[] = [];
  private currentSession: DebugRecordingSession | null = null;
  private recordingStartTime = 0;
  private unsubs: (() => void)[] = [];

  constructor(private events: EngineEventEmitter) {
    for (let i = 0; i < BUFFER_SIZE; i++) {
      this.buffer[i] = { timestamp: 0, deltaMs: 0, updateMs: 0, drawMs: 0, tickCount: 0 };
    }
    this.subscribeEngineEvents();
  }

  recordFrame(snapshot: DebugFrameSnapshot): void {
    this.buffer[this.writeIndex] = snapshot;
    this.writeIndex = (this.writeIndex + 1) % BUFFER_SIZE;
    this.frameCount++;
    if (snapshot.deltaMs >= JANK_THRESHOLD_MS) {
      this.jankCount++;
      const mult = (snapshot.deltaMs / 16.67).toFixed(1);
      this.logEvent('jank', `Frame spike: ${snapshot.deltaMs.toFixed(1)}ms (${mult}x budget)`, {
        deltaMs: snapshot.deltaMs,
      });
    }
    if (this.recording && this.currentSession) {
      this.currentSession.frames.push({ ...snapshot });
    }
    if (snapshot.timestamp - this.lastEmitTime >= EMIT_INTERVAL_MS) {
      this.lastEmitTime = snapshot.timestamp;
      this.events.emit('debugUpdate', this.buildSnapshot());
    }
  }

  setEntityCounts(counts: DebugEntityCounts): void {
    this.entityCounts = counts;
  }

  logEvent(type: DebugLogEntry['type'], message: string, data?: Record<string, unknown>): void {
    const entry: DebugLogEntry = { timestamp: performance.now(), type, message, data };
    this.logEntries.push(entry);
    if (this.logEntries.length > MAX_LOG_ENTRIES) {
      this.logEntries.splice(0, this.logEntries.length - MAX_LOG_ENTRIES);
    }
    if (this.recording && this.currentSession) this.currentSession.events.push({ ...entry });
  }

  startRecording(): void {
    if (this.recording) return;
    this.recording = true;
    this.recordingStartTime = performance.now();
    this.recordingSessions = [];
    this.currentSession = {
      startTime: this.recordingStartTime,
      endTime: 0,
      frames: [],
      events: [],
    };
    this.logEvent('recording', 'Recording started');
  }

  stopRecording(): DebugRecording | null {
    if (!this.recording) return null;
    this.recording = false;
    const endTime = performance.now();
    if (this.currentSession) {
      this.currentSession.endTime = endTime;
      this.recordingSessions.push(this.currentSession);
      this.currentSession = null;
    }
    this.logEvent('recording', 'Recording stopped');
    return {
      version: 1,
      startTime: this.recordingStartTime,
      endTime,
      systemInfo: { ...this.systemInfo },
      sessions: this.recordingSessions,
    };
  }

  buildSnapshot(): DebugMetricsSnapshot {
    return buildDebugSnapshot(
      this.buffer,
      BUFFER_SIZE,
      this.writeIndex,
      this.frameCount,
      this.jankCount,
      this.entityCounts,
      this.systemInfo,
      this.logEntries,
      this.recording,
    );
  }

  initSystemInfo(canvas: HTMLCanvasElement, dpr: number): void {
    const mem = (performance as PerformanceWithMemory).memory;
    this.systemInfo = {
      userAgent: navigator.userAgent,
      devicePixelRatio: dpr,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      hardwareConcurrency: navigator.hardwareConcurrency ?? 0,
      jsHeapSizeUsed: mem?.usedJSHeapSize ?? null,
      jsHeapSizeTotal: mem?.totalJSHeapSize ?? null,
    };
  }

  dispose(): void {
    for (const unsub of this.unsubs) unsub();
    this.unsubs = [];
    this.frameCount = 0;
    this.writeIndex = 0;
    this.jankCount = 0;
    this.logEntries = [];
    this.recording = false;
    this.currentSession = null;
    this.recordingSessions = [];
  }

  private subscribeEngineEvents(): void {
    const onState = (state: GameState) => {
      this.logEvent('state', `State changed to ${state}`);
      if (this.recording && this.currentSession && state === 'play') {
        this.currentSession.endTime = performance.now();
        this.recordingSessions.push(this.currentSession);
        this.currentSession = { startTime: performance.now(), endTime: 0, frames: [], events: [] };
      }
    };
    const onScore = (score: number) => this.logEvent('score', `Score: ${score}`);
    const onDiff = (key: string) => this.logEvent('difficulty', `Difficulty: ${key}`);
    this.events.on('stateChange', onState);
    this.events.on('scoreChange', onScore);
    this.events.on('difficultyChange', onDiff);
    this.unsubs.push(
      () => this.events.off('stateChange', onState),
      () => this.events.off('scoreChange', onScore),
      () => this.events.off('difficultyChange', onDiff),
    );
  }
}
