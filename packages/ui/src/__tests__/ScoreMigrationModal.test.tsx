import type { ScoreComparison } from '@repo/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScoreMigrationModal } from '../organisms/ScoreMigrationModal';

const makeComparisons = (): ScoreComparison[] => [
  { difficulty: 'easy', label: 'Easy', oldScore: 5, newScore: 3, isImprovement: true },
  { difficulty: 'normal', label: 'Normal', oldScore: 10, newScore: 12, isImprovement: false },
  { difficulty: 'hard', label: 'Hard', oldScore: 8, newScore: 0, isImprovement: true },
];

describe('ScoreMigrationModal', () => {
  it('renders when visible is true', () => {
    render(
      <ScoreMigrationModal
        visible
        comparisons={makeComparisons()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText('Scores Found')).toBeDefined();
    expect(screen.getByText('Import your best scores from the old site?')).toBeDefined();
  });

  it('returns null when visible is false', () => {
    const { container } = render(
      <ScoreMigrationModal
        visible={false}
        comparisons={makeComparisons()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows difficulty labels and scores', () => {
    render(
      <ScoreMigrationModal
        visible
        comparisons={makeComparisons()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByText('Easy')).toBeDefined();
    expect(screen.getByText('Normal')).toBeDefined();
    expect(screen.getByText('Hard')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('fires onAccept when Import button is clicked', () => {
    const onAccept = vi.fn();
    render(
      <ScoreMigrationModal
        visible
        comparisons={makeComparisons()}
        onAccept={onAccept}
        onDecline={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it('fires onDecline when No Thanks button is clicked', () => {
    const onDecline = vi.fn();
    render(
      <ScoreMigrationModal
        visible
        comparisons={makeComparisons()}
        onAccept={vi.fn()}
        onDecline={onDecline}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'No Thanks' }));
    expect(onDecline).toHaveBeenCalledOnce();
  });

  it('has an accessible dialog label', () => {
    render(
      <ScoreMigrationModal
        visible
        comparisons={makeComparisons()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Import scores from old site')).toBeDefined();
  });

  it('renders a table with column headers', () => {
    render(
      <ScoreMigrationModal
        visible
        comparisons={makeComparisons()}
        onAccept={vi.fn()}
        onDecline={vi.fn()}
      />,
    );
    expect(screen.getByRole('table')).toBeDefined();
    expect(screen.getByText('Difficulty')).toBeDefined();
    expect(screen.getByText('Old')).toBeDefined();
    expect(screen.getByText('Current')).toBeDefined();
  });
});
