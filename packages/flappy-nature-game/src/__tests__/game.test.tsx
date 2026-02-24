import { fireEvent, render, screen } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { FlappyNatureGame } from '../FlappyNatureGame';
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
  useScoreMigration: vi.fn(() => ({
    showModal: false,
    comparisons: [],
    accept: vi.fn(),
    decline: vi.fn(),
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('FlappyNatureGame', () => {
  it('renders without crashing', () => {
    const { container } = render(<FlappyNatureGame />);
    expect(container.firstChild).not.toBeNull();
  });

  it('displays the title "Flappy Nature"', () => {
    render(<FlappyNatureGame />);
    // The title text appears in a <span>; use getAllByText to handle any
    // duplicate matches (e.g. the SVG aria-label) and assert at least one hit.
    const matches = screen.getAllByText('Flappy Nature');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('renders the canvas element', () => {
    const { container } = render(<FlappyNatureGame />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('renders within a semantic main element', () => {
    render(<FlappyNatureGame />);
    expect(screen.getByRole('main')).toBeDefined();
  });

  it('renders footer text', () => {
    render(<FlappyNatureGame />);
    expect(screen.getByText(/Made with/)).toBeDefined();
  });

  it('shows best score when > 0', () => {
    render(<FlappyNatureGame />);
    expect(screen.getByText('Best: 10')).toBeDefined();
  });

  it('opens difficulty picker when badge is clicked', () => {
    render(<FlappyNatureGame />);
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    expect(mockPause).toHaveBeenCalledOnce();
    expect(screen.getByLabelText('Select difficulty')).toBeDefined();
  });

  it('closes picker and resumes when badge clicked again', () => {
    render(<FlappyNatureGame />);
    // Open picker
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    // Click badge again to close
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    expect(mockResume).toHaveBeenCalled();
  });

  it('selects difficulty and closes picker', () => {
    render(<FlappyNatureGame />);
    // Open picker
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    // Select "Easy"
    fireEvent.click(screen.getByText('Easy'));
    expect(mockSetDifficulty).toHaveBeenCalledWith('easy');
  });

  it('closes picker on backdrop click and resumes', () => {
    render(<FlappyNatureGame />);
    // Open picker
    fireEvent.click(screen.getByRole('button', { name: /Difficulty/ }));
    // Click backdrop
    fireEvent.click(screen.getByLabelText('Select difficulty'));
    expect(mockResume).toHaveBeenCalled();
  });

  it('calls onStateChange with current state', () => {
    const onStateChange = vi.fn();
    render(<FlappyNatureGame onStateChange={onStateChange} />);
    expect(onStateChange).toHaveBeenCalledWith('play');
  });

  it('calls onScoreChange with current score', () => {
    const onScoreChange = vi.fn();
    render(<FlappyNatureGame onScoreChange={onScoreChange} />);
    expect(onScoreChange).toHaveBeenCalledWith(5);
  });

  it('calls onBestScoreChange with current bestScores', () => {
    const onBestScoreChange = vi.fn();
    render(<FlappyNatureGame onBestScoreChange={onBestScoreChange} />);
    expect(onBestScoreChange).toHaveBeenCalledWith({ easy: 3, normal: 10, hard: 0 });
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
