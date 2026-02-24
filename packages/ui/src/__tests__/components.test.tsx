import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FpsCounter } from '../atoms/FpsCounter';
import { GameCanvas } from '../atoms/GameCanvas';
import { GameFooter } from '../atoms/GameFooter';
import { ScoreDisplay } from '../atoms/ScoreDisplay';
import { DifficultyBadge } from '../molecules/DifficultyBadge';
import { DifficultyPicker } from '../molecules/DifficultyPicker';
import { ErrorFallback } from '../organisms/ErrorFallback';
import { GameContainer } from '../organisms/GameContainer';
import { GameHeader } from '../organisms/GameHeader';
import { GameOverScreen } from '../organisms/GameOverScreen';
import { TitleScreen } from '../organisms/TitleScreen';
import { GamePage } from '../pages/GamePage';
import { GameLayout } from '../templates/GameLayout';

describe('TitleScreen', () => {
  it('renders when visible is true', () => {
    render(<TitleScreen visible bestScore={0} onPlay={vi.fn()} />);
    expect(screen.getByText('Flappy Nature')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Play' })).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const { container } = render(<TitleScreen visible={false} bestScore={0} onPlay={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows best score when bestScore is greater than 0', () => {
    render(<TitleScreen visible bestScore={42} onPlay={vi.fn()} />);
    expect(screen.getByText('Best: 42')).toBeDefined();
  });

  it('does not show best score when bestScore is 0', () => {
    render(<TitleScreen visible bestScore={0} onPlay={vi.fn()} />);
    expect(screen.queryByText(/Best:/)).toBeNull();
  });

  it('calls onPlay when Play button is clicked', () => {
    const onPlay = vi.fn();
    render(<TitleScreen visible bestScore={0} onPlay={onPlay} />);
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(onPlay).toHaveBeenCalledOnce();
  });
});

describe('GameOverScreen', () => {
  it('renders score and best score when visible', () => {
    render(<GameOverScreen visible score={7} bestScore={15} />);
    expect(screen.getByText('Game Over')).toBeDefined();
    expect(screen.getByText('Score: 7')).toBeDefined();
    expect(screen.getByText('Best: 15')).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const { container } = render(<GameOverScreen visible={false} score={7} bestScore={15} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a score of 0', () => {
    render(<GameOverScreen visible score={0} bestScore={0} />);
    expect(screen.getByText('Score: 0')).toBeDefined();
    expect(screen.getByText('Best: 0')).toBeDefined();
  });
});

describe('DifficultyBadge', () => {
  it('renders "Easy" for easy difficulty', () => {
    render(<DifficultyBadge difficulty="easy" visible onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Difficulty: Easy' })).toBeDefined();
  });

  it('renders "Normal" for normal difficulty', () => {
    render(<DifficultyBadge difficulty="normal" visible onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Difficulty: Normal' })).toBeDefined();
  });

  it('renders "Hard" for hard difficulty', () => {
    render(<DifficultyBadge difficulty="hard" visible onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Difficulty: Hard' })).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const { container } = render(
      <DifficultyBadge difficulty="normal" visible={false} onClick={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('calls onClick when the badge is clicked', () => {
    const onClick = vi.fn();
    render(<DifficultyBadge difficulty="easy" visible onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Difficulty: Easy' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('FpsCounter', () => {
  it('renders fps value when visible and fps > 0', () => {
    render(<FpsCounter fps={60} visible />);
    expect(screen.getByText('60 FPS')).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const { container } = render(<FpsCounter fps={60} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when fps is 0 even if visible', () => {
    const { container } = render(<FpsCounter fps={0} visible />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correct fps value', () => {
    render(<FpsCounter fps={144} visible />);
    expect(screen.getByText('144 FPS')).toBeDefined();
  });
});

describe('ScoreDisplay', () => {
  it('renders score value when visible', () => {
    render(<ScoreDisplay score={5} visible />);
    expect(screen.getByText('5')).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const { container } = render(<ScoreDisplay score={5} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('has aria-live="polite" attribute', () => {
    render(<ScoreDisplay score={5} visible />);
    const output = screen.getByText('5');
    expect(output.getAttribute('aria-live')).toBe('polite');
  });

  it('has aria-label with score value', () => {
    render(<ScoreDisplay score={12} visible />);
    const output = screen.getByText('12');
    expect(output.getAttribute('aria-label')).toBe('Score: 12');
  });
});

describe('GameCanvas', () => {
  it('renders canvas element', () => {
    const { container } = render(<GameCanvas />);
    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('has aria-label="Flappy Nature game"', () => {
    render(<GameCanvas />);
    expect(screen.getByLabelText('Flappy Nature game')).toBeDefined();
  });

  it('has role="img"', () => {
    render(<GameCanvas />);
    expect(screen.getByRole('img', { name: 'Flappy Nature game' })).toBeDefined();
  });
});

describe('DifficultyPicker', () => {
  const defaultProps = {
    currentDifficulty: 'normal' as const,
    bestScores: { easy: 0, normal: 0, hard: 0 },
    onSelect: vi.fn(),
    onClose: vi.fn(),
  };

  it('renders all 3 difficulty options when visible', () => {
    render(<DifficultyPicker {...defaultProps} visible />);
    expect(screen.getByText('Easy')).toBeDefined();
    expect(screen.getByText('Normal')).toBeDefined();
    expect(screen.getByText('Hard')).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const { container } = render(<DifficultyPicker {...defaultProps} visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onSelect with correct key when option clicked', () => {
    const onSelect = vi.fn();
    render(<DifficultyPicker {...defaultProps} onSelect={onSelect} visible />);
    fireEvent.click(screen.getByText('Easy'));
    expect(onSelect).toHaveBeenCalledWith('easy');
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(<DifficultyPicker {...defaultProps} onClose={onClose} visible />);
    fireEvent.click(screen.getByLabelText('Select difficulty'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows best scores when greater than 0', () => {
    render(
      <DifficultyPicker {...defaultProps} bestScores={{ easy: 5, normal: 12, hard: 0 }} visible />,
    );
    expect(screen.getByText('Best: 5')).toBeDefined();
    expect(screen.getByText('Best: 12')).toBeDefined();
    expect(screen.queryByText('Best: 0')).toBeNull();
  });

  it('calls onClose on Escape key in backdrop', () => {
    const onClose = vi.fn();
    render(<DifficultyPicker {...defaultProps} onClose={onClose} visible />);
    fireEvent.keyDown(screen.getByLabelText('Select difficulty'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close on non-Escape key', () => {
    const onClose = vi.fn();
    render(<DifficultyPicker {...defaultProps} onClose={onClose} visible />);
    fireEvent.keyDown(screen.getByLabelText('Select difficulty'), { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('stops propagation of keyDown in inner panel', () => {
    const onClose = vi.fn();
    render(<DifficultyPicker {...defaultProps} onClose={onClose} visible />);
    const panel = screen.getByRole('radiogroup');
    fireEvent.keyDown(panel, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('GameContainer', () => {
  it('renders children', () => {
    render(
      <GameContainer>
        <span>child content</span>
      </GameContainer>,
    );
    expect(screen.getByText('child content')).toBeDefined();
  });

  it('uses main element (semantic)', () => {
    render(
      <GameContainer>
        <span>test</span>
      </GameContainer>,
    );
    expect(screen.getByRole('main')).toBeDefined();
  });
});

describe('ErrorFallback', () => {
  it('renders error message', () => {
    render(<ErrorFallback message="Oops something broke" onReset={vi.fn()} />);
    expect(screen.getByText('Oops something broke')).toBeDefined();
  });

  it('renders "Try Again" button', () => {
    render(<ErrorFallback message="error" onReset={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeDefined();
  });

  it('has role="alert"', () => {
    render(<ErrorFallback message="error" onReset={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('calls onReset when button clicked', () => {
    const onReset = vi.fn();
    render(<ErrorFallback message="error" onReset={onReset} />);
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});

describe('GameFooter', () => {
  it('renders footer text', () => {
    render(<GameFooter text="Made with love" />);
    expect(screen.getByText('Made with love')).toBeDefined();
  });

  it('renders empty text without crashing', () => {
    const { container } = render(<GameFooter text="" />);
    expect(container.firstChild).not.toBeNull();
  });
});

describe('GameHeader', () => {
  const defaultProps = {
    brandName: 'Flappy Nature',
    difficulty: 'normal' as const,
    bestScore: 10,
    difficultyVisible: true,
    onDifficultyClick: vi.fn(),
  };

  it('renders brand name', () => {
    render(<GameHeader {...defaultProps} />);
    expect(screen.getByText('Flappy Nature')).toBeDefined();
  });

  it('renders heart icon', () => {
    render(<GameHeader {...defaultProps} />);
    expect(screen.getByRole('img', { name: 'Heart icon' })).toBeDefined();
  });

  it('renders difficulty badge when visible', () => {
    render(<GameHeader {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Difficulty: Normal' })).toBeDefined();
  });

  it('hides difficulty badge when difficultyVisible is false', () => {
    render(<GameHeader {...defaultProps} difficultyVisible={false} />);
    expect(screen.queryByRole('button', { name: /Difficulty/ })).toBeNull();
  });

  it('shows best score when greater than 0', () => {
    render(<GameHeader {...defaultProps} bestScore={42} />);
    expect(screen.getByText('Best: 42')).toBeDefined();
  });

  it('hides best score text when bestScore is 0', () => {
    render(<GameHeader {...defaultProps} bestScore={0} />);
    expect(screen.queryByText(/Best:/)).toBeNull();
  });

  it('calls onDifficultyClick when badge is clicked', () => {
    const onDifficultyClick = vi.fn();
    render(<GameHeader {...defaultProps} onDifficultyClick={onDifficultyClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Difficulty: Normal' }));
    expect(onDifficultyClick).toHaveBeenCalledOnce();
  });
});

describe('GameLayout', () => {
  it('renders header, children, and footer', () => {
    render(
      <GameLayout header={<span>header content</span>} footer={<span>footer content</span>}>
        <span>game content</span>
      </GameLayout>,
    );
    expect(screen.getByText('header content')).toBeDefined();
    expect(screen.getByText('game content')).toBeDefined();
    expect(screen.getByText('footer content')).toBeDefined();
  });

  it('wraps content in a GameContainer with main role', () => {
    render(
      <GameLayout header={<span>h</span>} footer={<span>f</span>}>
        <span>c</span>
      </GameLayout>,
    );
    expect(screen.getByRole('main')).toBeDefined();
  });
});

describe('GamePage', () => {
  it('renders title as h1', () => {
    render(
      <GamePage title="My Game">
        <span>content</span>
      </GamePage>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    expect(screen.getByText('My Game')).toBeDefined();
  });

  it('renders children', () => {
    render(
      <GamePage title="Test">
        <span>child content</span>
      </GamePage>,
    );
    expect(screen.getByText('child content')).toBeDefined();
  });
});
