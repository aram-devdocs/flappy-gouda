import {
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  RGBA_TOKENS,
  SHADOW,
  SPACING,
  Z_INDEX,
  cssVar,
} from '@repo/types';

/** Props for {@link SettingsMenu}. */
export interface SettingsMenuProps {
  /** Whether the menu is shown. */
  visible: boolean;
  /** Current player nickname, or null if unset. */
  nickname: string | null;
  /** Called when the player selects "Difficulty". */
  onDifficultyClick: () => void;
  /** Called when the player selects "Reset Nickname". */
  onNicknameClear: () => void;
  /** Called when the menu is dismissed (backdrop click or Escape). */
  onClose: () => void;
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: `${SPACING[1.5]} ${SPACING[2.5]}`,
  marginBottom: SPACING[1.5],
  fontSize: FONT_SIZE.sm,
  fontWeight: FONT_WEIGHT.bold,
  color: cssVar('navy'),
  background: cssVar('light'),
  border: 'none',
  borderRadius: RADIUS.md,
  cursor: 'pointer',
  textAlign: 'left' as const,
};

/** Modal menu offering Difficulty and Reset Nickname options. */
export function SettingsMenu({
  visible,
  nickname,
  onDifficultyClick,
  onNicknameClear,
  onClose,
}: SettingsMenuProps) {
  if (!visible) return null;

  return (
    <dialog
      open
      aria-label="Settings"
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
        role="menu"
        aria-label="Settings options"
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
          Settings
        </div>
        <button type="button" role="menuitem" onClick={onDifficultyClick} style={menuItemStyle}>
          Difficulty
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={onNicknameClear}
          disabled={nickname === null}
          style={{
            ...menuItemStyle,
            opacity: nickname === null ? 0.5 : 1,
            cursor: nickname === null ? 'default' : 'pointer',
          }}
        >
          Reset Nickname
        </button>
      </div>
    </dialog>
  );
}
