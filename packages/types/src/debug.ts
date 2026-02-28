/** Raw per-frame timing snapshot captured by the debug collector. */
export interface DebugFrameSnapshot {
  /** Absolute timestamp from performance.now(). */
  timestamp: number;
  /** Wall-clock time between this frame and the previous one (ms). */
  deltaMs: number;
  /** Time spent in the update phase (ms). */
  updateMs: number;
  /** Time spent in the draw phase (ms). */
  drawMs: number;
  /** Number of fixed-timestep ticks consumed this frame. */
  tickCount: number;
}

/** Aggregated frame timing statistics over the current window. */
export interface DebugFrameStats {
  currentFps: number;
  avgFrameMs: number;
  minFrameMs: number;
  maxFrameMs: number;
  avgUpdateMs: number;
  avgDrawMs: number;
  jankCount: number;
  jankCountWindow: number;
}

/** Live entity counts from the engine. */
export interface DebugEntityCounts {
  pipes: number;
  clouds: number;
  farClouds: number;
  midClouds: number;
  skylineSegments: number;
  buildings: number;
  trees: number;
  groundDeco: number;
}

/** Static system info captured once at init. */
export interface DebugSystemInfo {
  userAgent: string;
  devicePixelRatio: number;
  canvasWidth: number;
  canvasHeight: number;
  hardwareConcurrency: number;
  jsHeapSizeUsed: number | null;
  jsHeapSizeTotal: number | null;
}

/** A single timestamped debug log entry. */
export interface DebugLogEntry {
  timestamp: number;
  type:
    | 'state'
    | 'score'
    | 'difficulty'
    | 'jank'
    | 'recording'
    | 'info'
    | 'director'
    | 'phase'
    | 'pattern'
    | 'feel';
  message: string;
  data?: Record<string, unknown>;
}

/** The full snapshot emitted by the debug collector on each update cycle. */
export interface DebugMetricsSnapshot {
  frameStats: DebugFrameStats;
  entityCounts: DebugEntityCounts;
  systemInfo: DebugSystemInfo;
  sparkline: readonly number[];
  log: readonly DebugLogEntry[];
  isRecording: boolean;
}

/** A single recording session delimited by game state transitions. */
export interface DebugRecordingSession {
  startTime: number;
  endTime: number;
  frames: DebugFrameSnapshot[];
  events: DebugLogEntry[];
}

/** Exportable recording containing one or more sessions. */
export interface DebugRecording {
  version: 1;
  startTime: number;
  endTime: number;
  systemInfo: DebugSystemInfo;
  sessions: DebugRecordingSession[];
}

/** Imperative debug recording controls exposed to consumers. */
export interface DebugControls {
  startRecording: () => void;
  stopRecording: () => DebugRecording | null;
}
