import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlappyGoudaGame } from '../FlappyGoudaGame';
import { GameErrorBoundary } from '../GameErrorBoundary';

const mockFlap = vi.fn();
const mockSetDifficulty = vi.fn();
const mockPause = vi.fn();
const mockResume = vi.fn();
const mockReset = vi.fn();

vi.mock('@repo/hooks', () => ({
  useGameEngine: vi.fn(() => ({
    canvasRef: { current: null },
    state: 'play',
    score: 5,
    bestScores: { easy: 3, normal: 10, hard: 0 },
    difficulty: 'normal',
    fps: 60,
    flap: mockFlap,
    setDifficulty: mockSetDifficulty,
    reset: mockReset,
    pause: mockPause,
    resume: mockResume,
  })),
  useGameInput: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FlappyGoudaGame', () => {
  it('renders without crashing', () => {
    const { container } = render(<FlappyGoudaGame />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the cheese icon in the header', () => {
    render(<FlappyGoudaGame />);
    expect(screen.getByRole('img', { name: 'Cheese icon' })).toBeDefined();
  });

  it('renders the canvas element', () => {
    const { container } = render(<FlappyGoudaGame />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders within a semantic main element', () => {
    render(<FlappyGoudaGame />);
    expect(screen.getByRole('main')).toBeDefined();
  });

  it('renders without a footer', () => {
    render(<FlappyGoudaGame />);
    expect(screen.queryByText(/Made with/)).toBeNull();
  });

  it('shows best score when > 0', () => {
    render(<FlappyGoudaGame />);
    expect(screen.getByText('Best: 10')).toBeDefined();
  });

  it('opens settings menu when badge is clicked', () => {
    render(<FlappyGoudaGame />);
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    expect(mockPause).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Settings')).toBeDefined();
  });

  it('closes settings menu and resumes when badge clicked again', () => {
    render(<FlappyGoudaGame />);
    // Open settings menu
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    // Click badge again to close
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    expect(mockResume).toHaveBeenCalled();
  });

  it('opens difficulty picker from settings menu', () => {
    render(<FlappyGoudaGame />);
    // Open settings menu
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    // Click "Difficulty" in settings menu
    fireEvent.click(screen.getByText('Difficulty'));
    expect(screen.getByLabelText('Select difficulty')).toBeDefined();
  });

  it('selects difficulty and closes picker', () => {
    render(<FlappyGoudaGame />);
    // Open settings menu then difficulty picker
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    fireEvent.click(screen.getByText('Difficulty'));
    // Select "Easy"
    fireEvent.click(screen.getByText('Easy'));
    expect(mockSetDifficulty).toHaveBeenCalledWith('easy');
  });

  it('closes settings menu on backdrop click and resumes', () => {
    render(<FlappyGoudaGame />);
    // Open settings menu
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    // Click backdrop
    fireEvent.click(screen.getByLabelText('Settings'));
    expect(mockResume).toHaveBeenCalled();
  });

  it('calls onStateChange with current state', () => {
    const onStateChange = vi.fn();
    render(<FlappyGoudaGame onStateChange={onStateChange} />);
    expect(onStateChange).toHaveBeenCalledWith('play');
  });

  it('calls onScoreChange with current score', () => {
    const onScoreChange = vi.fn();
    render(<FlappyGoudaGame onScoreChange={onScoreChange} />);
    expect(onScoreChange).toHaveBeenCalledWith(5);
  });

  it('calls onBestScoreChange with current bestScores', () => {
    const onBestScoreChange = vi.fn();
    render(<FlappyGoudaGame onBestScoreChange={onBestScoreChange} />);
    expect(onBestScoreChange).toHaveBeenCalledWith({ easy: 3, normal: 10, hard: 0 });
  });

  it('shows confirmation modal when Reset Nickname is clicked', () => {
    const onNicknameClear = vi.fn();
    render(
      <FlappyGoudaGame
        nickname="ABC"
        leaderboardCallbacks={{
          onScoreSubmit: vi.fn(),
          onNicknameSet: vi.fn(),
          onNicknameCheck: vi.fn(),
          onNicknameClear,
        }}
      />,
    );
    // Open settings menu
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    // Click "Reset Nickname"
    fireEvent.click(screen.getByText('Reset Nickname'));
    // Should show confirmation modal, not immediately clear
    expect(onNicknameClear).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Confirm reset')).toBeDefined();
    expect(screen.getByText('Reset Everything?')).toBeDefined();
  });

  it('clears nickname when reset is confirmed', () => {
    const onNicknameClear = vi.fn();
    render(
      <FlappyGoudaGame
        nickname="ABC"
        leaderboardCallbacks={{
          onScoreSubmit: vi.fn(),
          onNicknameSet: vi.fn(),
          onNicknameCheck: vi.fn(),
          onNicknameClear,
        }}
      />,
    );
    // Open settings -> Reset Nickname -> Confirm
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    fireEvent.click(screen.getByText('Reset Nickname'));
    fireEvent.click(screen.getByText('Reset'));
    expect(onNicknameClear).toHaveBeenCalledOnce();
    expect(mockResume).toHaveBeenCalled();
  });

  it('returns to settings menu when reset is cancelled', () => {
    const onNicknameClear = vi.fn();
    render(
      <FlappyGoudaGame
        nickname="ABC"
        leaderboardCallbacks={{
          onScoreSubmit: vi.fn(),
          onNicknameSet: vi.fn(),
          onNicknameCheck: vi.fn(),
          onNicknameClear,
        }}
      />,
    );
    // Open settings -> Reset Nickname -> Cancel
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    fireEvent.click(screen.getByText('Reset Nickname'));
    fireEvent.click(screen.getByText('Cancel'));
    expect(onNicknameClear).not.toHaveBeenCalled();
    // Should be back at settings menu
    expect(screen.getByLabelText('Settings')).toBeDefined();
  });
});

describe('GameErrorBoundary', () => {
  // Suppress React error boundary console.error noise during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('Error Boundary') || msg.includes('The above error')) return;
      originalConsoleError(...args);
    };
  });

  it('renders children when no error', () => {
    render(
      <GameErrorBoundary>
        <span>game content</span>
      </GameErrorBoundary>,
    );
    expect(screen.getByText('game content')).toBeDefined();
  });

  it('catches render errors and shows fallback', () => {
    function BrokenChild(): React.ReactNode {
      throw new Error('test explosion');
    }

    render(
      <GameErrorBoundary>
        <BrokenChild />
      </GameErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText('test explosion')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeDefined();
  });

  it('resets error state when Try Again is clicked', () => {
    let shouldThrow = true;
    function MaybeBreak(): React.ReactNode {
      if (shouldThrow) throw new Error('boom');
      return <span>recovered</span>;
    }

    const onReset = vi.fn();
    render(
      <GameErrorBoundary onReset={onReset}>
        <MaybeBreak />
      </GameErrorBoundary>,
    );

    expect(screen.getByText('boom')).toBeDefined();

    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    expect(onReset).toHaveBeenCalledOnce();
    expect(screen.getByText('recovered')).toBeDefined();
  });
});
