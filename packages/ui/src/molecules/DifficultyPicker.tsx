import type { BestScores, DifficultyKey } from '@repo/types';
import { DIFF_KEYS, DIFF_LABELS } from '@repo/types';

interface DifficultyPickerProps {
  currentDifficulty: DifficultyKey;
  bestScores: BestScores;
  visible: boolean;
  onSelect: (key: DifficultyKey) => void;
  onClose: () => void;
}

export function DifficultyPicker({
  currentDifficulty,
  bestScores,
  visible,
  onSelect,
  onClose,
}: DifficultyPickerProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(9, 9, 73, 0.3)',
        zIndex: 10,
      }}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '150px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '12px',
            color: 'var(--fn-navy, #090949)',
          }}
        >
          Difficulty
        </div>
        {DIFF_KEYS.map((key) => {
          const isActive = key === currentDifficulty;
          const best = bestScores[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '6px 10px',
                marginBottom: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: isActive ? '#fff' : 'var(--fn-navy, #090949)',
                background: isActive ? 'var(--fn-violet, #6500D9)' : 'var(--fn-light, #FBF6F6)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <span>{DIFF_LABELS[key]}</span>
              {best > 0 && (
                <span style={{ fontSize: '9px', fontWeight: 600, opacity: isActive ? 0.75 : 0.45 }}>
                  Best: {best}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
