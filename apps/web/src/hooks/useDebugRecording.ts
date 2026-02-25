import type { DebugControls, DebugRecording } from '@repo/flappy-nature-game';
import { useCallback, useRef, useState } from 'react';

/** Manages debug recording lifecycle (start / stop / export). */
export function useDebugRecording(controlsRef: { current: DebugControls | null }) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const lastRef = useRef<DebugRecording | null>(null);

  const start = useCallback(() => {
    controlsRef.current?.startRecording();
    setIsRecording(true);
  }, [controlsRef]);

  const stop = useCallback(() => {
    const r = controlsRef.current?.stopRecording() ?? null;
    setIsRecording(false);
    if (r) {
      setHasRecording(true);
      lastRef.current = r;
    }
  }, [controlsRef]);

  const exportRecording = useCallback(() => {
    const rec = lastRef.current;
    if (!rec) return;
    const blob = new Blob([JSON.stringify(rec, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return { isRecording, hasRecording, start, stop, exportRecording };
}
