import type { DifficultyKey } from '@repo/types';
import { useCallback } from 'react';

interface GameCallbackDeps {
  flap: () => void;
  pause: () => void;
  resume: () => void;
  setDifficulty: (key: DifficultyKey) => void;
  handleCanvasClick: (x: number, y: number) => boolean;
  handleCanvasHover: (x: number, y: number) => boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  pickerOpen: boolean;
  setPickerOpen: (open: boolean) => void;
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
    pickerOpen,
    setPickerOpen,
  } = deps;

  const handleFlap = useCallback(() => {
    if (pickerOpen) return;
    flap();
  }, [flap, pickerOpen]);

  const handleEscape = useCallback(() => {
    if (pickerOpen) {
      setPickerOpen(false);
      resume();
    }
  }, [pickerOpen, resume, setPickerOpen]);

  const togglePicker = useCallback(() => {
    if (pickerOpen) {
      setPickerOpen(false);
      resume();
    } else {
      pause();
      setPickerOpen(true);
    }
  }, [pickerOpen, pause, resume, setPickerOpen]);

  const onCanvasInteract = useCallback(
    (x: number, y: number): boolean => {
      if (handleCanvasClick(x, y)) {
        togglePicker();
        return true;
      }
      return false;
    },
    [handleCanvasClick, togglePicker],
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
      setPickerOpen(false);
    },
    [setDifficulty, setPickerOpen],
  );

  const handlePickerClose = useCallback(() => {
    setPickerOpen(false);
    resume();
  }, [resume, setPickerOpen]);

  const handlePlay = useCallback(() => {
    flap();
  }, [flap]);

  return {
    handleFlap,
    handleEscape,
    togglePicker,
    onCanvasInteract,
    onCanvasHover,
    handleDifficultySelect,
    handlePickerClose,
    handlePlay,
  };
}
