import { useCallback, useEffect, useState } from 'react';

const NICKNAME_KEY = 'sn-flappy-nickname';

/** Return value of the useNickname hook. */
export interface UseNicknameReturn {
  /** Current nickname, or null if unset. */
  nickname: string | null;
  /** Persist a new nickname to localStorage. */
  setNickname: (nickname: string) => void;
  /** Remove the stored nickname. */
  clearNickname: () => void;
}

/** Manages a player nickname persisted in localStorage and synced across tabs. */
export function useNickname(): UseNicknameReturn {
  // Read from localStorage on init, return null if not set
  const [nickname, setNicknameState] = useState<string | null>(() => {
    try {
      const item = localStorage.getItem(NICKNAME_KEY);
      return item ? (JSON.parse(item) as string) : null;
    } catch {
      return null;
    }
  });

  // Sync nickname across tabs via storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== NICKNAME_KEY) return;
      try {
        setNicknameState(e.newValue ? (JSON.parse(e.newValue) as string) : null);
      } catch {
        setNicknameState(null);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const setNickname = useCallback((value: string) => {
    setNicknameState(value);
    try {
      localStorage.setItem(NICKNAME_KEY, JSON.stringify(value));
    } catch {
      /* storage full or unavailable */
    }
  }, []);

  const clearNickname = useCallback(() => {
    setNicknameState(null);
    try {
      localStorage.removeItem(NICKNAME_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { nickname, setNickname, clearNickname };
}
