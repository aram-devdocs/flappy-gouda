import type { DebugRecording } from '@repo/types';
import type { BackgroundSystem } from './background';
import type { DebugMetricsCollector } from './debug-metrics';
import type { EngineLoop } from './engine-loop';

/** Record a debug frame after draw, plus entity counts. Zero cost when collector is null. */
export function recordDebugFrame(
  collector: DebugMetricsCollector,
  loop: EngineLoop,
  updateMs: number,
  drawMs: number,
  now: number,
  pipeActiveCount: number,
  cloudCount: number,
  bg: BackgroundSystem,
): void {
  const layers = bg.layers;
  collector.recordFrame({
    timestamp: now,
    deltaMs: loop.lastDelta,
    updateMs,
    drawMs,
    tickCount: loop.lastTickCount,
  });
  collector.setEntityCounts({
    pipes: pipeActiveCount,
    clouds: cloudCount,
    farClouds: layers?.farClouds.length ?? 0,
    midClouds: layers?.midClouds.length ?? 0,
    skylineSegments: layers?.skyline.length ?? 0,
    buildings: layers?.buildings.length ?? 0,
    trees: layers?.trees.length ?? 0,
    groundDeco: layers?.groundDeco.length ?? 0,
    planes: bg.planeActiveCount,
  });
}

/** Start a debug recording session if the collector exists. */
export function startDebugRecording(collector: DebugMetricsCollector | null): void {
  collector?.startRecording();
}

/** Stop a debug recording session. Returns null if no collector or not recording. */
export function stopDebugRecording(collector: DebugMetricsCollector | null): DebugRecording | null {
  return collector?.stopRecording() ?? null;
}
