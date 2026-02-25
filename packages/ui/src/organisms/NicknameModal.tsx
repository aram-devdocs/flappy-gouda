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
import { NicknameInput } from '../molecules/NicknameInput';

/** Props for {@link NicknameModal}. */
export interface NicknameModalProps {
  /** Whether the modal is shown. */
  visible: boolean;
  /** Current nickname value (up to 3 characters). */
  value: string;
  /** Called with the new value when the user types. */
  onChange: (value: string) => void;
  /** Called when the user submits their nickname. */
  onSubmit: () => void;
  /** Called when the user closes the modal without submitting. */
  onClose: () => void;
  /** Validation error message. */
  error?: string;
  /** Whether a nickname availability check is in progress. */
  checking?: boolean;
}

/** First-visit modal for choosing a 3-letter player tag. */
export function NicknameModal({
  visible,
  value,
  onChange,
  onSubmit,
  onClose,
  error,
  checking,
}: NicknameModalProps) {
  if (!visible) return null;

  const canSubmit = value.length === 3 && !checking;

  return (
    <dialog
      open
      aria-label="Choose your tag"
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
          Choose Your Tag
        </h2>
        <p
          style={{
            fontSize: FONT_SIZE.md,
            color: cssVar('navy'),
            opacity: OPACITY.visible,
            margin: `0 0 ${SPACING[4]}`,
          }}
        >
          3 letters. Make it count.
        </p>

        <div style={{ marginBottom: SPACING[4] }}>
          <NicknameInput value={value} onChange={onChange} error={error} checking={checking} />
        </div>

        <div style={{ display: 'flex', gap: SPACING[2], justifyContent: 'center' }}>
          <button type="button" onClick={onClose} style={closeBtnStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            style={{
              ...submitBtnStyle,
              opacity: canSubmit ? 1 : OPACITY.soft,
              cursor: canSubmit ? 'pointer' : 'default',
            }}
          >
            Go
          </button>
        </div>
      </div>
    </dialog>
  );
}

const submitBtnStyle: React.CSSProperties = {
  padding: `${SPACING[2]} ${SPACING[5]}`,
  borderRadius: RADIUS.lg,
  border: 'none',
  background: cssVar('violet'),
  color: cssVar('white'),
  fontWeight: FONT_WEIGHT.bold,
  fontSize: FONT_SIZE.xl,
  cursor: 'pointer',
};

const closeBtnStyle: React.CSSProperties = {
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
