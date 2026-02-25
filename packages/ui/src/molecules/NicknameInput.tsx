import { FONT_SIZE, OPACITY, SPACING, cssVar } from '@repo/types';
import { NicknameCharCell } from '../atoms/NicknameCharCell';

/** Props for {@link NicknameInput}. */
export interface NicknameInputProps {
  /** Current nickname value (up to 3 uppercase alphanumeric characters). */
  value: string;
  /** Called with the new value when the user types. */
  onChange: (value: string) => void;
  /** Validation error message to display. */
  error?: string;
  /** Whether a nickname availability check is in progress. */
  checking?: boolean;
}

/** Cell position labels used as stable React keys. */
const CELL_KEYS = ['char-0', 'char-1', 'char-2'] as const;

/** Three NicknameCharCell atoms in a row with a hidden input and validation feedback. */
export function NicknameInput({ value, onChange, error, checking }: NicknameInputProps) {
  const activeIndex = Math.min(value.length, 2);
  const chars = [value[0] ?? '', value[1] ?? '', value[2] ?? ''];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: SPACING[2],
      }}
    >
      <div style={{ position: 'relative', display: 'flex', gap: SPACING[1.5] }}>
        {chars.map((char, i) => (
          <NicknameCharCell key={CELL_KEYS[i]} char={char} active={i === activeIndex} index={i} />
        ))}
        <input
          type="text"
          maxLength={3}
          value={value}
          onChange={(e) => {
            const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            onChange(cleaned);
          }}
          aria-label="Nickname input"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0,
            width: '100%',
            height: '100%',
            cursor: 'text',
            fontSize: FONT_SIZE['2xl'],
          }}
        />
      </div>
      {error && (
        <span style={{ fontSize: FONT_SIZE.sm, color: cssVar('magenta') }} role="alert">
          {error}
        </span>
      )}
      {!error && checking && (
        <span style={{ fontSize: FONT_SIZE.sm, color: cssVar('navy'), opacity: OPACITY.soft }}>
          Checking...
        </span>
      )}
    </div>
  );
}
