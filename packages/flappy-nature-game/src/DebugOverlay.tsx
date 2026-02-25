import type { FlappyEngine } from '@repo/engine';
import { useDebugMetrics } from '@repo/hooks';
import { DebugPanel, DebugTab } from '@repo/ui';
import { useCallback, useState } from 'react';

interface DebugOverlayProps {
  engineRef: React.RefObject<FlappyEngine | null>;
}

/** Orchestrates the debug tab + panel, gated by showDebug in the parent. */
export function DebugOverlay({ engineRef }: DebugOverlayProps) {
  const { metrics, isRecording, startRecording, stopRecording, exportRecording } =
    useDebugMetrics(engineRef);
  const [panelOpen, setPanelOpen] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);

  const toggle = useCallback(() => setPanelOpen((prev) => !prev), []);

  const handleStop = useCallback(() => {
    stopRecording();
    setHasRecording(true);
  }, [stopRecording]);

  const handleExport = useCallback(() => {
    const url = exportRecording();
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-recording-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportRecording]);

  if (!metrics) return null;

  return (
    <>
      <DebugTab
        visible
        expanded={panelOpen}
        isRecording={isRecording}
        onClick={toggle}
        style={panelOpen ? { left: 'min(280px, 85vw)' } : undefined}
      />
      <DebugPanel
        visible={panelOpen}
        metrics={metrics}
        isRecording={isRecording}
        hasRecording={hasRecording}
        onStartRecording={startRecording}
        onStopRecording={handleStop}
        onExportRecording={handleExport}
      />
    </>
  );
}
