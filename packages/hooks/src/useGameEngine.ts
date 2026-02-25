import { FlappyEngine } from '@repo/engine';
import type { BestScores, DifficultyKey, EngineConfig, GameState } from '@repo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Shape returned by {@link useGameEngine}. */
export interface UseGameEngineReturn {
  /** Ref to attach to the game canvas element. */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Ref to the engine instance (for debug hooks). */
  engineRef: React.RefObject<FlappyEngine | null>;
  /** Whether the engine has been created and started. */
  engineReady: boolean;
  /** Current game lifecycle state. */
  state: GameState;
  /** Current score for the active run. */
  score: number;
  /** Per-difficulty best scores. */
  bestScores: BestScores;
  /** Currently active difficulty key. */
  difficulty: DifficultyKey;
  /** Smoothed frames-per-second value. */
  fps: number;
  /** Trigger a flap impulse on the bird. */
  flap: () => void;
  /** Switch to a new difficulty level. */
  setDifficulty: (key: DifficultyKey) => void;
  /** Reset the game to idle state. */
  reset: () => void;
  /** Pause gameplay. */
  pause: () => void;
  /** Resume gameplay after a pause. */
  resume: () => void;
  /** Hit-test a canvas click in CSS coordinates. Returns true if the gear icon was hit. */
  handleCanvasClick: (cssX: number, cssY: number) => boolean;
  /** Hit-test a mouse move in CSS coordinates. Returns true if hovering the gear icon. */
  handleCanvasHover: (cssX: number, cssY: number) => boolean;
}

/**
 * Create and manage a FlappyEngine instance, surfacing its state as React state.
 * @param config Optional engine configuration overrides.
 * @returns Reactive game state, a canvas ref, and stable action callbacks.
 */
export function useGameEngine(config?: EngineConfig): UseGameEngineReturn {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlappyEngine | null>(null);

  const [state, setState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState<BestScores>({ easy: 0, normal: 0, hard: 0 });
  const [difficulty, setDifficultyState] = useState<DifficultyKey>(config?.difficulty ?? 'normal');
  const [fps, setFps] = useState(0);
  const [engineReady, setEngineReady] = useState(false);

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

    // Sync initial state loaded from persistence (engine may have loaded from localStorage)
    setDifficultyState(engine.getDifficulty());
    setBestScores(engine.getBestScores());

    engine.start();
    setEngineReady(true);

    return () => {
      engine.destroy();
      engineRef.current = null;
      setEngineReady(false);
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

  const handleCanvasClick = useCallback((cssX: number, cssY: number): boolean => {
    return engineRef.current?.handleClick(cssX, cssY) ?? false;
  }, []);

  const handleCanvasHover = useCallback((cssX: number, cssY: number): boolean => {
    return engineRef.current?.handleClick(cssX, cssY) ?? false;
  }, []);

  return {
    canvasRef,
    engineRef,
    engineReady,
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
    handleCanvasClick,
    handleCanvasHover,
  };
}
