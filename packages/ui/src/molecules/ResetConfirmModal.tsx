import {
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

/** Props for {@link ResetConfirmModal}. */
export interface ResetConfirmModalProps {
  /** Whether the modal is shown. */
  visible: boolean;
  /** Called when the user confirms the reset. */
  onConfirm: () => void;
  /** Called when the user cancels the reset. */
  onCancel: () => void;
}

/** Confirmation dialog shown before resetting nickname and clearing all session data. */
export function ResetConfirmModal({ visible, onConfirm, onCancel }: ResetConfirmModalProps) {
  if (!visible) return null;

  return (
    <dialog
      open
      aria-label="Confirm reset"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: RGBA_TOKENS.scrimDense,
        zIndex: Z_INDEX.picker,
        border: 'none',
        padding: 0,
        margin: 0,
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          background: cssVar('white'),
          borderRadius: RADIUS['2xl'],
          padding: `${SPACING[6]} ${SPACING[7]}`,
          textAlign: 'center',
          boxShadow: SHADOW.cardHeavy,
          maxWidth: '320px',
          width: '100%',
        }}
      >
        <h2
          style={{
            fontSize: FONT_SIZE['2xl'],
            fontWeight: FONT_WEIGHT.extrabold,
            color: cssVar('navy'),
            margin: `0 0 ${SPACING[1]}`,
          }}
        >
          Reset Everything?
        </h2>
        <p
          style={{
            fontSize: FONT_SIZE.sm,
            color: cssVar('navy'),
            opacity: OPACITY.visible,
            margin: `0 0 ${SPACING[4]}`,
            lineHeight: 1.4,
          }}
        >
          This will clear your nickname, best scores, and all saved data. You'll start fresh.
        </p>

        <div style={{ display: 'flex', gap: SPACING[2], justifyContent: 'center' }}>
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} style={confirmBtnStyle}>
            Reset
          </button>
        </div>
      </div>
    </dialog>
  );
}

const confirmBtnStyle: React.CSSProperties = {
  padding: `${SPACING[2]} ${SPACING[5]}`,
  borderRadius: RADIUS.lg,
  border: 'none',
  background: '#d9534f',
  color: cssVar('white'),
  fontWeight: FONT_WEIGHT.bold,
  fontSize: FONT_SIZE.xl,
  cursor: 'pointer',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: `${SPACING[2]} ${SPACING[5]}`,
  borderRadius: RADIUS.lg,
  border: `1px solid ${cssVar('navy')}`,
  background: 'transparent',
  color: cssVar('navy'),
  fontWeight: FONT_WEIGHT.semibold,
  fontSize: FONT_SIZE.xl,
  cursor: 'pointer',
  opacity: OPACITY.prominent,
};
