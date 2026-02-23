import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FpsCounter } from '../atoms/FpsCounter';
import { DifficultyBadge } from '../molecules/DifficultyBadge';
import { GameOverScreen } from '../organisms/GameOverScreen';
import { TitleScreen } from '../organisms/TitleScreen';

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
    expect(screen.getByRole('button', { name: 'Easy' })).toBeDefined();
  });

  it('renders "Normal" for normal difficulty', () => {
    render(<DifficultyBadge difficulty="normal" visible onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Normal' })).toBeDefined();
  });

  it('renders "Hard" for hard difficulty', () => {
    render(<DifficultyBadge difficulty="hard" visible onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Hard' })).toBeDefined();
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
    fireEvent.click(screen.getByRole('button', { name: 'Easy' }));
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
