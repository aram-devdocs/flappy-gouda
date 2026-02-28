import { FlappyEngine } from '@repo/engine';
import type { BestScores, DifficultyKey, EngineConfig, GameState } from '@repo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Minimum interval between fpsUpdate React state flushes (ms). */
const FPS_THROTTLE_MS = 3000;

/** Shape returned by {@link useGameEngine}. */
export interface UseGameEngineReturn {
  /** Ref to attach to the game canvas container element. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref pointing to the foreground canvas (for input event binding). */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** Ref to the engine instance (for debug hooks). */
  engineRef: React.RefObject<FlappyEngine | null>;
  /** Whether the engine has been created and started. */
  engineReady: boolean;
  /** Current game lifecycle state. */
  state: GameState;
  /** Current score (flushed to React state on state transitions, not per-point during play). */
  score: number;
  /** Per-difficulty best scores. */
  bestScores: BestScores;
  /** Currently active difficulty key. */
  difficulty: DifficultyKey;
  /** Smoothed frames-per-second value (throttled during gameplay). */
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
 * @returns Reactive game state, a container ref, a canvas ref, and stable action callbacks.
 */
export function useGameEngine(config?: EngineConfig): UseGameEngineReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlappyEngine | null>(null);

  const [state, setState] = useState<GameState>('idle');
  const [score, setScore] = useState(0);
  const [bestScores, setBestScores] = useState<BestScores>({
    easy: 0,
    normal: 0,
    hard: 0,
    souls: 0,
  });
  const [difficulty, setDifficultyState] = useState<DifficultyKey>(config?.difficulty ?? 'normal');
  const [fps, setFps] = useState(0);
  const [engineReady, setEngineReady] = useState(false);

  // Hot-path refs — avoid React re-renders during active gameplay.
  // Score/fps update the ref on every engine event but only flush to
  // React state on game-state transitions (or throttled for fps).
  const scoreRef = useRef(0);
  const fpsRef = useRef(0);
  const lastFpsFlushRef = useRef(-FPS_THROTTLE_MS);

  // biome-ignore lint/correctness/useExhaustiveDependencies: engine should only be created once on mount, config is an object ref
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bg = container.querySelector<HTMLCanvasElement>('[data-layer="bg"]');
    const mg = container.querySelector<HTMLCanvasElement>('[data-layer="mg"]');
    const fg = container.querySelector<HTMLCanvasElement>('[data-layer="fg"]');
    if (!bg || !mg || !fg) return;

    canvasRef.current = fg;

    const engine = new FlappyEngine({ bg, mg, fg }, config);
    engineRef.current = engine;

    engine.on('stateChange', (newState: GameState) => {
      setState(newState);
      setScore(scoreRef.current);
      setFps(fpsRef.current);
    });

    engine.on('scoreChange', (newScore: number) => {
      scoreRef.current = newScore;
    });

    engine.on('bestScoreChange', setBestScores);

    engine.on('fpsUpdate', (newFps: number) => {
      fpsRef.current = newFps;
      const now = performance.now();
      if (now - lastFpsFlushRef.current >= FPS_THROTTLE_MS) {
        lastFpsFlushRef.current = now;
        setFps(newFps);
      }
    });

    engine.on('difficultyChange', setDifficultyState);

    setDifficultyState(engine.getDifficulty());
    setBestScores(engine.getBestScores());

    engine.start();
    setEngineReady(true);

    return () => {
      engine.destroy();
      engineRef.current = null;
      canvasRef.current = null;
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
    containerRef,
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
