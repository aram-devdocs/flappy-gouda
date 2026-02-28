import type { FlappyEngine } from '@repo/engine';
import type { BestScores, DifficultyKey, ProgressionState } from '@repo/types';
import { GameState as GS } from '@repo/types';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

export function useDeathStats(
  state: string,
  engineRef: RefObject<FlappyEngine | null>,
  score: number,
  bestScores: BestScores,
  difficulty: DifficultyKey,
) {
  const [deathStats, setDeathStats] = useState<ProgressionState | null>(null);
  const [deathIsNewBest, setDeathIsNewBest] = useState(false);
  const runStartBestRef = useRef(0);

  useEffect(() => {
    if (state === GS.Play) runStartBestRef.current = bestScores[difficulty] ?? 0;
    if (state === GS.Dead && engineRef.current) {
      setDeathStats(engineRef.current.getProgressionState());
      setDeathIsNewBest(score > 0 && score > runStartBestRef.current);
    }
  }, [state, engineRef, score, bestScores, difficulty]);

  return { deathStats, deathIsNewBest };
}
