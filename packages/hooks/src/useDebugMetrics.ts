import type { FlappyEngine } from '@repo/engine';
import type { DebugMetricsSnapshot, DebugRecording } from '@repo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Shape returned by {@link useDebugMetrics}. */
export interface UseDebugMetricsReturn {
  /** Current metrics snapshot, null when debug is disabled. */
  metrics: DebugMetricsSnapshot | null;
  /** Whether the engine is currently recording frames. */
  isRecording: boolean;
  /** Begin a recording session. */
  startRecording: () => void;
  /** End the recording session and store the result. */
  stopRecording: () => DebugRecording | null;
  /** Create a blob URL for downloading the last recording as JSON. */
  exportRecording: () => string | null;
}

/**
 * Bridge the engine's debug metrics collector into React state.
 * Subscribes to `debugUpdate` events and exposes recording controls.
 */
export function useDebugMetrics(
  engineRef: React.RefObject<FlappyEngine | null>,
): UseDebugMetricsReturn {
  const [metrics, setMetrics] = useState<DebugMetricsSnapshot | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const lastRecordingRef = useRef<DebugRecording | null>(null);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const handler = (snapshot: DebugMetricsSnapshot) => {
      setMetrics(snapshot);
      setIsRecording(snapshot.isRecording);
    };

    engine.on('debugUpdate', handler);
    return () => {
      engine.off('debugUpdate', handler);
    };
  }, [engineRef]);

  const startRecording = useCallback(() => {
    engineRef.current?.startDebugRecording();
  }, [engineRef]);

  const stopRecording = useCallback((): DebugRecording | null => {
    const recording = engineRef.current?.stopDebugRecording() ?? null;
    lastRecordingRef.current = recording;
    return recording;
  }, [engineRef]);

  const exportRecording = useCallback((): string | null => {
    const rec = lastRecordingRef.current;
    if (!rec) return null;
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }, []);

  return { metrics, isRecording, startRecording, stopRecording, exportRecording };
}
