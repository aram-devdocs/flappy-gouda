import type { DifficultyKey } from '@repo/types';
import { useCallback } from 'react';

/** Which settings panel is currently shown. */
export type SettingsView = 'closed' | 'menu' | 'difficulty';

interface GameCallbackDeps {
  flap: () => void;
  pause: () => void;
  resume: () => void;
  setDifficulty: (key: DifficultyKey) => void;
  handleCanvasClick: (x: number, y: number) => boolean;
  handleCanvasHover: (x: number, y: number) => boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  settingsView: SettingsView;
  setSettingsView: (view: SettingsView) => void;
  onNicknameClear?: () => void;
}

export function useGameCallbacks(deps: GameCallbackDeps) {
  const {
    flap,
    pause,
    resume,
    setDifficulty,
    handleCanvasClick,
    handleCanvasHover,
    canvasRef,
    settingsView,
    setSettingsView,
    onNicknameClear,
  } = deps;

  const handleFlap = useCallback(() => {
    if (settingsView !== 'closed') return;
    flap();
  }, [flap, settingsView]);

  const handleEscape = useCallback(() => {
    if (settingsView === 'difficulty') {
      setSettingsView('menu');
    } else if (settingsView === 'menu') {
      setSettingsView('closed');
      resume();
    }
  }, [settingsView, resume, setSettingsView]);

  const toggleSettings = useCallback(() => {
    if (settingsView !== 'closed') {
      setSettingsView('closed');
      resume();
    } else {
      pause();
      setSettingsView('menu');
    }
  }, [settingsView, pause, resume, setSettingsView]);

  const onCanvasInteract = useCallback(
    (x: number, y: number): boolean => {
      if (handleCanvasClick(x, y)) {
        toggleSettings();
        return true;
      }
      return false;
    },
    [handleCanvasClick, toggleSettings],
  );

  const onCanvasHover = useCallback(
    (x: number, y: number) => {
      const hit = handleCanvasHover(x, y);
      const canvas = canvasRef.current;
      if (canvas) canvas.style.cursor = hit ? 'pointer' : '';
    },
    [handleCanvasHover, canvasRef],
  );

  const handleDifficultySelect = useCallback(
    (key: DifficultyKey) => {
      setDifficulty(key);
      setSettingsView('closed');
    },
    [setDifficulty, setSettingsView],
  );

  const handleSettingsClose = useCallback(() => {
    setSettingsView('closed');
    resume();
  }, [resume, setSettingsView]);

  const openDifficultyFromMenu = useCallback(() => {
    setSettingsView('difficulty');
  }, [setSettingsView]);

  const handleNicknameClear = useCallback(() => {
    onNicknameClear?.();
    setSettingsView('closed');
    resume();
  }, [onNicknameClear, setSettingsView, resume]);

  const handlePlay = useCallback(() => {
    flap();
  }, [flap]);

  return {
    handleFlap,
    handleEscape,
    toggleSettings,
    onCanvasInteract,
    onCanvasHover,
    handleDifficultySelect,
    handleSettingsClose,
    openDifficultyFromMenu,
    handleNicknameClear,
    handlePlay,
  };
}
