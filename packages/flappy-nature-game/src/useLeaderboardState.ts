import type { DifficultyKey, LeaderboardCallbacks } from '@repo/types';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Internal state for leaderboard UI within the game component. */
export interface LeaderboardState {
  leaderboardOpen: boolean;
  showNicknameModal: boolean;
  nicknameValue: string;
  nicknameError: string | undefined;
  nicknameChecking: boolean;
  toggleLeaderboard: () => void;
  closeLeaderboard: () => void;
  closeNicknameModal: () => void;
  handleNicknameChange: (value: string) => void;
  handleNicknameSubmit: () => void;
}

/** Manages leaderboard panel visibility, nickname modal, and auto-submit on death. */
export function useLeaderboardState(
  state: string,
  score: number,
  difficulty: DifficultyKey,
  nickname: string | null | undefined,
  callbacks: LeaderboardCallbacks | undefined,
): LeaderboardState {
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameValue, setNicknameValue] = useState('');
  const [nicknameError, setNicknameError] = useState<string | undefined>();
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const submittedRef = useRef(false);

  // Auto-submit score on death
  useEffect(() => {
    if (state === 'dead' && callbacks && nickname && !submittedRef.current) {
      submittedRef.current = true;
      callbacks.onScoreSubmit(score, difficulty);
    }
    if (state === 'play') {
      submittedRef.current = false;
    }
  }, [state, score, difficulty, nickname, callbacks]);

  // Show nickname modal when needed
  useEffect(() => {
    if (callbacks && nickname === null) {
      setShowNicknameModal(true);
    }
  }, [callbacks, nickname]);

  const toggleLeaderboard = useCallback(() => {
    setLeaderboardOpen((prev) => !prev);
  }, []);

  const closeLeaderboard = useCallback(() => {
    setLeaderboardOpen(false);
  }, []);

  const closeNicknameModal = useCallback(() => {
    setShowNicknameModal(false);
  }, []);

  const handleNicknameChange = useCallback((value: string) => {
    setNicknameValue(value);
    setNicknameError(undefined);
  }, []);

  const handleNicknameSubmit = useCallback(async () => {
    if (!callbacks || nicknameValue.length !== 3) return;

    setNicknameChecking(true);
    setNicknameError(undefined);

    try {
      const result = await callbacks.onNicknameCheck(nicknameValue);
      if (result.available) {
        callbacks.onNicknameSet(nicknameValue);
        setShowNicknameModal(false);
        setNicknameValue('');
      } else {
        setNicknameError(result.reason ?? 'Nickname unavailable');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Check failed';
      setNicknameError(`${message}. Try again.`);
    } finally {
      setNicknameChecking(false);
    }
  }, [callbacks, nicknameValue]);

  return {
    leaderboardOpen,
    showNicknameModal,
    nicknameValue,
    nicknameError,
    nicknameChecking,
    toggleLeaderboard,
    closeLeaderboard,
    closeNicknameModal,
    handleNicknameChange,
    handleNicknameSubmit,
  };
}
