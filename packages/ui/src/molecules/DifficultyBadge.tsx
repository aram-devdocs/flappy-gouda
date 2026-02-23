import type { DifficultyKey } from '@repo/types';
import { DIFF_LABELS } from '@repo/types';

interface DifficultyBadgeProps {
  difficulty: DifficultyKey;
  visible: boolean;
  onClick: () => void;
}

export function DifficultyBadge({ difficulty, visible, onClick }: DifficultyBadgeProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '2px 10px',
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--fn-violet, #6500D9)',
        background: 'rgba(101, 0, 217, 0.08)',
        border: '1px solid rgba(101, 0, 217, 0.15)',
        borderRadius: '12px',
        cursor: 'pointer',
        lineHeight: '18px',
      }}
    >
      {DIFF_LABELS[difficulty]}
    </button>
  );
}
