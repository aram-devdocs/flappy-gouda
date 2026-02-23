import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameInput } from '../useGameInput';
import { useLocalStorage } from '../useLocalStorage';

// ---------------------------------------------------------------------------
// useLocalStorage
// ---------------------------------------------------------------------------

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('key1', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads an existing value from localStorage on mount', () => {
    localStorage.setItem('key2', JSON.stringify('hello'));
    const { result } = renderHook(() => useLocalStorage('key2', 'default'));
    expect(result.current[0]).toBe('hello');
  });

  it('saves a new value to localStorage when the setter is called', () => {
    const { result } = renderHook(() => useLocalStorage('key3', 0));

    act(() => {
      result.current[1](99);
    });

    expect(result.current[0]).toBe(99);
    expect(JSON.parse(localStorage.getItem('key3') ?? 'null')).toBe(99);
  });

  it('returns the initial value when the stored JSON is invalid', () => {
    localStorage.setItem('key4', '{bad json}');
    const { result } = renderHook(() => useLocalStorage('key4', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('works with object values', () => {
    const initial = { score: 0 };
    const { result } = renderHook(() => useLocalStorage('key5', initial));

    act(() => {
      result.current[1]({ score: 10 });
    });

    expect(result.current[0]).toEqual({ score: 10 });
    expect(JSON.parse(localStorage.getItem('key5') ?? '{}')).toEqual({ score: 10 });
  });
});

// ---------------------------------------------------------------------------
// useGameInput
// ---------------------------------------------------------------------------

describe('useGameInput', () => {
  it('mounts and unmounts without throwing when canvasRef.current is null', () => {
    const onFlap = vi.fn();
    expect(() =>
      renderHook(() => {
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        useGameInput({ onFlap, canvasRef });
      }),
    ).not.toThrow();
  });

  it('calls onFlap when Space key is pressed', () => {
    const onFlap = vi.fn();
    renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      useGameInput({ onFlap, canvasRef });
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });

    expect(onFlap).toHaveBeenCalledTimes(1);
  });

  it('calls onFlap when Enter key is pressed', () => {
    const onFlap = vi.fn();
    renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      useGameInput({ onFlap, canvasRef });
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    });

    expect(onFlap).toHaveBeenCalledTimes(1);
  });

  it('calls onEscape when Escape key is pressed', () => {
    const onFlap = vi.fn();
    const onEscape = vi.fn();
    renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      useGameInput({ onFlap, onEscape, canvasRef });
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(onFlap).not.toHaveBeenCalled();
  });

  it('does not call onFlap when disabled', () => {
    const onFlap = vi.fn();
    renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      useGameInput({ onFlap, canvasRef, enabled: false });
    });

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });

    expect(onFlap).not.toHaveBeenCalled();
  });

  it('removes the keydown listener on unmount', () => {
    const onFlap = vi.fn();
    const { unmount } = renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      useGameInput({ onFlap, canvasRef });
    });

    unmount();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    });

    expect(onFlap).not.toHaveBeenCalled();
  });
});
