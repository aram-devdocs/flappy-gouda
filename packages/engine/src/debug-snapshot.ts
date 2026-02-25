import type {
  DebugEntityCounts,
  DebugFrameSnapshot,
  DebugFrameStats,
  DebugLogEntry,
  DebugMetricsSnapshot,
  DebugSystemInfo,
} from '@repo/types';

const JANK_THRESHOLD_MS = 33.3;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function buildDebugSnapshot(
  buffer: DebugFrameSnapshot[],
  bufferSize: number,
  writeIndex: number,
  frameCount: number,
  jankCount: number,
  entityCounts: DebugEntityCounts,
  systemInfo: DebugSystemInfo,
  logEntries: DebugLogEntry[],
  recording: boolean,
): DebugMetricsSnapshot {
  const filled = Math.min(frameCount, bufferSize);
  const sparkline: number[] = new Array(filled);
  let sumD = 0;
  let sumU = 0;
  let sumDr = 0;
  let minD = Number.POSITIVE_INFINITY;
  let maxD = 0;
  let wJank = 0;
  for (let i = 0; i < filled; i++) {
    const idx = (writeIndex - filled + i + bufferSize) % bufferSize;
    const f = buffer[idx] as DebugFrameSnapshot;
    sparkline[i] = f.deltaMs;
    sumD += f.deltaMs;
    sumU += f.updateMs;
    sumDr += f.drawMs;
    if (f.deltaMs < minD) minD = f.deltaMs;
    if (f.deltaMs > maxD) maxD = f.deltaMs;
    if (f.deltaMs >= JANK_THRESHOLD_MS) wJank++;
  }
  const avg = filled > 0 ? sumD / filled : 0;
  const frameStats: DebugFrameStats = {
    currentFps: avg > 0 ? Math.round(1000 / avg) : 0,
    avgFrameMs: round2(avg),
    minFrameMs: filled > 0 ? round2(minD) : 0,
    maxFrameMs: round2(maxD),
    avgUpdateMs: filled > 0 ? round2(sumU / filled) : 0,
    avgDrawMs: filled > 0 ? round2(sumDr / filled) : 0,
    jankCount,
    jankCountWindow: wJank,
  };
  return {
    frameStats,
    entityCounts: { ...entityCounts },
    systemInfo,
    sparkline,
    log: logEntries.slice(),
    isRecording: recording,
  };
}
