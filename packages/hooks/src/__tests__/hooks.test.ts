import { act, renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameEngine } from '../useGameEngine';
import { useGameInput } from '../useGameInput';
import { useLocalStorage } from '../useLocalStorage';

// Typed mock for @repo/engine so we can access __mockEngine without `as any`
interface MockEngine {
  on: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  destroy: ReturnType<typeof vi.fn>;
  flap: ReturnType<typeof vi.fn>;
  setDifficulty: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  resume: ReturnType<typeof vi.fn>;
  handleClick: ReturnType<typeof vi.fn>;
  getDifficulty: ReturnType<typeof vi.fn>;
  getBestScores: ReturnType<typeof vi.fn>;
}

interface MockedEngineModule {
  FlappyEngine: ReturnType<typeof vi.fn>;
  __mockEngine: MockEngine;
}

vi.mock('@repo/engine', () => {
  const mockEngine: MockEngine = {
    on: vi.fn(),
    start: vi.fn(),
    destroy: vi.fn(),
    flap: vi.fn(),
    setDifficulty: vi.fn(),
    reset: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    handleClick: vi.fn(() => false),
    getDifficulty: vi.fn(() => 'normal'),
    getBestScores: vi.fn(() => ({ easy: 0, normal: 0, hard: 0, souls: 0 })),
  };
  return {
    FlappyEngine: vi.fn(() => mockEngine),
    __mockEngine: mockEngine,
  };
});

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

  it('handles setItem failure gracefully', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded');
    });
    const { result } = renderHook(() => useLocalStorage('key6', 'init'));

    act(() => {
      result.current[1]('new');
    });

    expect(result.current[0]).toBe('new');
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

  it('registers keydown listener on document', () => {
    const addSpy = vi.spyOn(document, 'addEventListener');
    const onFlap = vi.fn();
    renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement | null>(null);
      useGameInput({ onFlap, canvasRef });
    });

    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
  });

  it('calls onFlap on canvas click when canvasRef is set', () => {
    const onFlap = vi.fn();
    const canvas = document.createElement('canvas');
    const ref = { current: canvas };
    renderHook(() => useGameInput({ onFlap, canvasRef: ref }));

    act(() => {
      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onFlap).toHaveBeenCalledTimes(1);
  });

  it('calls onFlap on canvas touchstart when canvasRef is set', () => {
    const onFlap = vi.fn();
    const canvas = document.createElement('canvas');
    const ref = { current: canvas };
    renderHook(() => useGameInput({ onFlap, canvasRef: ref }));

    act(() => {
      canvas.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    });

    expect(onFlap).toHaveBeenCalledTimes(1);
  });

  it('does not call onFlap on click when disabled', () => {
    const onFlap = vi.fn();
    const canvas = document.createElement('canvas');
    const ref = { current: canvas };
    renderHook(() => useGameInput({ onFlap, canvasRef: ref, enabled: false }));

    act(() => {
      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onFlap).not.toHaveBeenCalled();
  });

  it('does not call onFlap on touch when disabled', () => {
    const onFlap = vi.fn();
    const canvas = document.createElement('canvas');
    const ref = { current: canvas };
    renderHook(() => useGameInput({ onFlap, canvasRef: ref, enabled: false }));

    act(() => {
      canvas.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    });

    expect(onFlap).not.toHaveBeenCalled();
  });

  it('removes canvas listeners on unmount', () => {
    const onFlap = vi.fn();
    const canvas = document.createElement('canvas');
    const ref = { current: canvas };
    const { unmount } = renderHook(() => useGameInput({ onFlap, canvasRef: ref }));

    unmount();

    act(() => {
      canvas.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      canvas.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    });

    expect(onFlap).not.toHaveBeenCalled();
  });

  it('ignores repeated key events', () => {
    const onFlap = vi.fn();
    const canvas = document.createElement('canvas');
    const ref = { current: canvas };
    renderHook(() => useGameInput({ onFlap, canvasRef: ref }));

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true }),
      );
    });

    expect(onFlap).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// useGameEngine
// ---------------------------------------------------------------------------

describe('useGameEngine', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => useGameEngine());

    expect(result.current).toHaveProperty('canvasRef');
    expect(result.current).toHaveProperty('state');
    expect(result.current).toHaveProperty('score');
    expect(result.current).toHaveProperty('bestScores');
    expect(result.current).toHaveProperty('difficulty');
    expect(result.current).toHaveProperty('fps');
    expect(result.current).toHaveProperty('flap');
    expect(result.current).toHaveProperty('setDifficulty');
    expect(result.current).toHaveProperty('reset');
    expect(result.current).toHaveProperty('pause');
    expect(result.current).toHaveProperty('resume');
    expect(result.current).toHaveProperty('handleCanvasClick');
    expect(result.current).toHaveProperty('handleCanvasHover');
  });

  it('returns initial state values', () => {
    const { result } = renderHook(() => useGameEngine());

    expect(result.current.state).toBe('idle');
    expect(result.current.score).toBe(0);
    expect(result.current.bestScores).toEqual({ easy: 0, normal: 0, hard: 0, souls: 0 });
    expect(result.current.difficulty).toBe('normal');
    expect(result.current.fps).toBe(0);
  });

  it('returns stable callback references', () => {
    const { result } = renderHook(() => useGameEngine());

    expect(typeof result.current.flap).toBe('function');
    expect(typeof result.current.setDifficulty).toBe('function');
    expect(typeof result.current.reset).toBe('function');
    expect(typeof result.current.pause).toBe('function');
    expect(typeof result.current.resume).toBe('function');
  });

  it('creates engine when containerRef has an element with canvas layers', async () => {
    const engineMod = (await import('@repo/engine')) as unknown as MockedEngineModule;
    const mockEngine = engineMod.__mockEngine;
    vi.clearAllMocks();

    const container = document.createElement('div');
    const bgCanvas = document.createElement('canvas');
    const mgCanvas = document.createElement('canvas');
    const fgCanvas = document.createElement('canvas');
    bgCanvas.setAttribute('data-layer', 'bg');
    mgCanvas.setAttribute('data-layer', 'mg');
    fgCanvas.setAttribute('data-layer', 'fg');
    container.appendChild(bgCanvas);
    container.appendChild(mgCanvas);
    container.appendChild(fgCanvas);

    renderHook(() => {
      const eng = useGameEngine();
      (eng.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = container;
      return eng;
    });

    await act(async () => {});

    expect(engineMod.FlappyEngine).toHaveBeenCalledWith(
      { bg: bgCanvas, mg: mgCanvas, fg: fgCanvas },
      undefined,
    );
    expect(mockEngine.on).toHaveBeenCalledWith('stateChange', expect.any(Function));
    expect(mockEngine.on).toHaveBeenCalledWith('scoreChange', expect.any(Function));
    expect(mockEngine.on).toHaveBeenCalledWith('bestScoreChange', expect.any(Function));
    expect(mockEngine.on).toHaveBeenCalledWith('fpsUpdate', expect.any(Function));
    expect(mockEngine.on).toHaveBeenCalledWith('difficultyChange', expect.any(Function));
    expect(mockEngine.start).toHaveBeenCalled();
  });

  it('calls engine methods through returned callbacks', async () => {
    const engineMod = (await import('@repo/engine')) as unknown as MockedEngineModule;
    const mockEngine = engineMod.__mockEngine;
    vi.clearAllMocks();

    const container = document.createElement('div');
    for (const layer of ['bg', 'mg', 'fg']) {
      const c = document.createElement('canvas');
      c.setAttribute('data-layer', layer);
      container.appendChild(c);
    }
    const { result } = renderHook(() => {
      const eng = useGameEngine();
      (eng.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = container;
      return eng;
    });

    await act(async () => {});

    act(() => result.current.flap());
    expect(mockEngine.flap).toHaveBeenCalled();

    act(() => result.current.setDifficulty('hard'));
    expect(mockEngine.setDifficulty).toHaveBeenCalledWith('hard');

    act(() => result.current.reset());
    expect(mockEngine.reset).toHaveBeenCalled();

    act(() => result.current.pause());
    expect(mockEngine.pause).toHaveBeenCalled();

    act(() => result.current.resume());
    expect(mockEngine.resume).toHaveBeenCalled();
  });

  it('destroys engine on unmount', async () => {
    const engineMod = (await import('@repo/engine')) as unknown as MockedEngineModule;
    const mockEngine = engineMod.__mockEngine;
    vi.clearAllMocks();

    const container = document.createElement('div');
    for (const layer of ['bg', 'mg', 'fg']) {
      const c = document.createElement('canvas');
      c.setAttribute('data-layer', layer);
      container.appendChild(c);
    }
    const { unmount } = renderHook(() => {
      const eng = useGameEngine();
      (eng.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = container;
      return eng;
    });

    await act(async () => {});

    unmount();
    expect(mockEngine.destroy).toHaveBeenCalled();
  });

  // Helper: create a container with 3 canvas layers and render the hook
  async function setupWithEngine() {
    const engineMod = (await import('@repo/engine')) as unknown as MockedEngineModule;
    const mockEng = engineMod.__mockEngine;
    vi.clearAllMocks();

    const container = document.createElement('div');
    for (const layer of ['bg', 'mg', 'fg']) {
      const c = document.createElement('canvas');
      c.setAttribute('data-layer', layer);
      container.appendChild(c);
    }

    const { result } = renderHook(() => {
      const eng = useGameEngine();
      (eng.containerRef as React.MutableRefObject<HTMLDivElement | null>).current = container;
      return eng;
    });
    await act(async () => {});

    const handler = (event: string) =>
      mockEng.on.mock.calls.find((c: unknown[]) => c[0] === event)?.[1] as (
        ...args: unknown[]
      ) => void;

    return { result, fire: handler };
  }

  it('does not update score state on scoreChange during gameplay', async () => {
    const { result, fire } = await setupWithEngine();

    act(() => fire('stateChange')('play'));
    expect(result.current.state).toBe('play');
    expect(result.current.score).toBe(0);

    act(() => fire('scoreChange')(5));
    expect(result.current.score).toBe(0);

    act(() => fire('scoreChange')(12));
    expect(result.current.score).toBe(0);

    act(() => fire('stateChange')('dead'));
    expect(result.current.state).toBe('dead');
    expect(result.current.score).toBe(12);
  });

  it('flushes score to React state on pause transition', async () => {
    const { result, fire } = await setupWithEngine();

    act(() => fire('stateChange')('play'));
    act(() => fire('scoreChange')(7));
    expect(result.current.score).toBe(0);

    act(() => fire('stateChange')('paused'));
    expect(result.current.state).toBe('paused');
    expect(result.current.score).toBe(7);
  });

  it('throttles fps state updates', async () => {
    const { result, fire } = await setupWithEngine();

    act(() => fire('fpsUpdate')(60));
    expect(result.current.fps).toBe(60);

    act(() => fire('fpsUpdate')(55));
    expect(result.current.fps).toBe(60);
  });

  it('flushes latest fps on state transition regardless of throttle', async () => {
    const { result, fire } = await setupWithEngine();

    act(() => fire('fpsUpdate')(60));
    act(() => fire('fpsUpdate')(42));
    expect(result.current.fps).toBe(60);

    act(() => fire('stateChange')('play'));
    expect(result.current.fps).toBe(42);
  });
});
