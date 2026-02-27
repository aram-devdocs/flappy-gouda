import type { BestScores, DifficultyKey } from '@repo/types';
import {
  DIFF_KEYS,
  DIFF_LABELS,
  FONT_SIZE,
  FONT_WEIGHT,
  OPACITY,
  RADIUS,
  RGBA_TOKENS,
  SHADOW,
  SPACING,
  Z_INDEX,
  cssVar,
} from '@repo/types';

/** Crimson accent used exclusively for the Souls difficulty option. */
const SOULS_ACCENT = '#C0392B';
const SOULS_BG_SUBTLE = 'rgba(192, 57, 43, 0.08)';

/** Props for {@link DifficultyPicker}. */
interface DifficultyPickerProps {
  /** The currently selected difficulty level. */
  currentDifficulty: DifficultyKey;
  /** Per-difficulty best scores shown alongside each option. */
  bestScores: BestScores;
  /** Whether the picker dialog is shown. */
  visible: boolean;
  /** Called when the player selects a difficulty option. */
  onSelect: (key: DifficultyKey) => void;
  /** Called when the picker is dismissed (backdrop click or Escape). */
  onClose: () => void;
  /** Which difficulty options to show. Defaults to DIFF_KEYS. */
  availableDifficulties?: DifficultyKey[];
}

/** Modal dialog listing all difficulty levels with best-score annotations. */
export function DifficultyPicker({
  currentDifficulty,
  bestScores,
  visible,
  onSelect,
  onClose,
  availableDifficulties = DIFF_KEYS,
}: DifficultyPickerProps) {
  if (!visible) return null;

  return (
    <dialog
      open
      aria-label="Select difficulty"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: RGBA_TOKENS.scrimLight,
        zIndex: Z_INDEX.picker,
        border: 'none',
        padding: 0,
        margin: 0,
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        height: '100%',
      }}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="radiogroup"
        aria-label="Difficulty options"
        style={{
          background: cssVar('white'),
          borderRadius: RADIUS.xl,
          padding: SPACING[4],
          minWidth: '150px',
          boxShadow: SHADOW.dropdown,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.extrabold,
            textAlign: 'center',
            marginBottom: SPACING[3],
            color: cssVar('navy'),
          }}
        >
          Difficulty
        </div>
        {availableDifficulties.map((key) => {
          const isActive = key === currentDifficulty;
          const isSouls = key === 'souls';
          const best = bestScores[key];
          const activeColor = isSouls ? SOULS_ACCENT : cssVar('violet');
          const inactiveColor = isSouls ? SOULS_BG_SUBTLE : cssVar('light');
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: `${SPACING[1.5]} ${SPACING[2.5]}`,
                marginBottom: SPACING[1.5],
                fontSize: FONT_SIZE.sm,
                fontWeight: FONT_WEIGHT.bold,
                color: isActive ? cssVar('white') : isSouls ? SOULS_ACCENT : cssVar('navy'),
                background: isActive ? activeColor : inactiveColor,
                border: 'none',
                borderRadius: RADIUS.md,
                cursor: 'pointer',
              }}
            >
              <span>{DIFF_LABELS[key]}</span>
              {best > 0 && (
                <span
                  style={{
                    fontSize: FONT_SIZE['2xs'],
                    fontWeight: FONT_WEIGHT.semibold,
                    opacity: isActive ? OPACITY.strong : OPACITY.dimmed,
                  }}
                >
                  Best: {best}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </dialog>
  );
}
