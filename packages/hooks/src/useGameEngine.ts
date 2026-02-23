import { FlappyEngine } from '@repo/engine';
import type { BestScores, DifficultyKey, EngineConfig, GameState } from '@repo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseGameEngineReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  state: GameState;
  score: number;
  bestScores: BestScores;
  difficulty: DifficultyKey;
  fps: number;
  flap: () => void;
  setDifficulty: (key: DifficultyKey) => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
}

export function useGameEngine(config?: EngineConfig): UseGameEngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlappyEngine | null>(null);

  const [state, setState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState<BestScores>({ easy: 0, normal: 0, hard: 0 });
  const [difficulty, setDifficultyState] = useState<DifficultyKey>(config?.difficulty ?? 'normal');
  const [fps, setFps] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: engine should only be created once on mount, config is an object ref
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new FlappyEngine(canvas, config);
    engineRef.current = engine;

    engine.on('stateChange', setState);
    engine.on('scoreChange', setScore);
    engine.on('bestScoreChange', setBestScores);
    engine.on('fpsUpdate', setFps);
    engine.on('difficultyChange', setDifficultyState);

    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  const flap = useCallback(() => {
    engineRef.current?.flap();
  }, []);

  const setDifficulty = useCallback((key: DifficultyKey) => {
    engineRef.current?.setDifficulty(key);
  }, []);

  const reset = useCallback(() => {
    engineRef.current?.reset();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    engineRef.current?.resume();
  }, []);

  return {
    canvasRef,
    state,
    score,
    bestScores,
    difficulty,
    fps,
    flap,
    setDifficulty,
    reset,
    pause,
    resume,
  };
}
