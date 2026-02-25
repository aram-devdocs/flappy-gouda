import { FONT_FAMILY, FONT_SIZE, FONT_WEIGHT, RADIUS, RGBA_TOKENS, cssVar } from '@repo/types';

/** Props for {@link NicknameCharCell}. */
export interface NicknameCharCellProps {
  /** Character to display in this cell. Empty string shows an underscore. */
  char: string;
  /** Whether this cell is the currently active input position. */
  active: boolean;
  /** Zero-based index of this cell in the nickname. */
  index: number;
}

/** Single character display cell for the arcade-style nickname input. */
export function NicknameCharCell({ char, active, index }: NicknameCharCellProps) {
  return (
    <div
      data-index={index}
      style={{
        width: '36px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: cssVar('white'),
        border: `2px solid ${active ? cssVar('cyan') : RGBA_TOKENS.shadowSm}`,
        borderRadius: RADIUS.md,
        fontSize: FONT_SIZE['3xl'],
        fontWeight: FONT_WEIGHT.extrabold,
        fontFamily: FONT_FAMILY.mono,
        color: cssVar('navy'),
        boxShadow: active ? `0 0 6px ${cssVar('cyan')}` : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {char || '_'}
    </div>
  );
}
