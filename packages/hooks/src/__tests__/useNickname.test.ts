import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNickname } from '../useNickname';

const NICKNAME_KEY = 'sn-flappy-nickname';

describe('useNickname', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no nickname is stored', () => {
    const { result } = renderHook(() => useNickname());
    expect(result.current.nickname).toBeNull();
  });

  it('returns stored nickname from localStorage', () => {
    localStorage.setItem(NICKNAME_KEY, JSON.stringify('ABC'));
    const { result } = renderHook(() => useNickname());
    expect(result.current.nickname).toBe('ABC');
  });

  it('sets nickname in state and localStorage', () => {
    const { result } = renderHook(() => useNickname());

    act(() => {
      result.current.setNickname('XYZ');
    });

    expect(result.current.nickname).toBe('XYZ');
    const stored = localStorage.getItem(NICKNAME_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string)).toBe('XYZ');
  });

  it('clears nickname from state and localStorage', () => {
    localStorage.setItem(NICKNAME_KEY, JSON.stringify('ABC'));
    const { result } = renderHook(() => useNickname());

    act(() => {
      result.current.clearNickname();
    });

    expect(result.current.nickname).toBeNull();
    expect(localStorage.getItem(NICKNAME_KEY)).toBeNull();
  });

  it('handles corrupted localStorage gracefully', () => {
    localStorage.setItem(NICKNAME_KEY, 'not-valid-json{{{');
    const { result } = renderHook(() => useNickname());
    expect(result.current.nickname).toBeNull();
  });

  it('handles localStorage write failure gracefully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useNickname());

    // Should not throw
    act(() => {
      result.current.setNickname('ABC');
    });

    // State still updates even if storage fails
    expect(result.current.nickname).toBe('ABC');

    setItemSpy.mockRestore();
  });
});
