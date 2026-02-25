import type { FlappyEngine } from '@repo/engine';
import type { DebugControls, DebugMetricsSnapshot } from '@repo/types';
import { useEffect, useRef } from 'react';

/**
 * Bridge debug metrics from the engine to the consumer via callbacks.
 * Subscribes to `debugUpdate` events and populates a controls ref.
 */
export function useDebugBridge(
  engineRef: React.RefObject<FlappyEngine | null>,
  engineReady: boolean,
  showDebug: boolean,
  onDebugMetrics?: (metrics: DebugMetricsSnapshot) => void,
  debugControlsRef?: { current: DebugControls | null },
): void {
  const callbackRef = useRef(onDebugMetrics);
  callbackRef.current = onDebugMetrics;

  // biome-ignore lint/correctness/useExhaustiveDependencies: callbackRef is a stable ref, debugControlsRef is consumer-provided ref
  useEffect(() => {
    if (!showDebug || !engineReady) return;
    const engine = engineRef.current;
    if (!engine) return;

    const handler = (snapshot: DebugMetricsSnapshot) => {
      callbackRef.current?.(snapshot);
    };
    engine.on('debugUpdate', handler);

    if (debugControlsRef) {
      debugControlsRef.current = {
        startRecording: () => engine.startDebugRecording(),
        stopRecording: () => engine.stopDebugRecording(),
      };
    }

    return () => {
      engine.off('debugUpdate', handler);
      if (debugControlsRef) debugControlsRef.current = null;
    };
  }, [engineRef, engineReady, showDebug]);
}
