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
import { HeartIcon } from '../atoms/HeartIcon';

/** Props for {@link TitleScreen}. */
interface TitleScreenProps {
  /** Whether the title overlay is shown. */
  visible: boolean;
  /** Player's best score for the current difficulty (0 hides the label). */
  bestScore: number;
  /** Called when the Play button is clicked. */
  onPlay: () => void;
}

/** Full-screen overlay shown in idle state with branding, controls hint, and Play button. */
export function TitleScreen({ visible, bestScore, onPlay }: TitleScreenProps) {
  if (!visible) return null;

  return (
    <dialog
      open
      aria-label="Start game"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: RGBA_TOKENS.scrimMedium,
        zIndex: Z_INDEX.modal,
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
          padding: `${SPACING[6]} ${SPACING[8]}`,
          textAlign: 'center',
          boxShadow: SHADOW.card,
        }}
      >
        <div style={{ fontSize: FONT_SIZE['6xl'], marginBottom: SPACING[3] }}>
          <HeartIcon />
        </div>
        <p
          style={{
            fontSize: FONT_SIZE.sm,
            color: cssVar('navy'),
            opacity: OPACITY.medium,
            margin: `0 0 ${SPACING[2]}`,
          }}
        >
          <kbd
            style={{
              padding: `${SPACING[0.5]} ${SPACING[1.5]}`,
              background: cssVar('light'),
              borderRadius: RADIUS.sm,
              fontSize: FONT_SIZE.xs,
              fontWeight: FONT_WEIGHT.semibold,
              border: `1px solid ${RGBA_TOKENS.shadowSm}`,
            }}
          >
            Space
          </kbd>{' '}
          <kbd
            style={{
              padding: `${SPACING[0.5]} ${SPACING[1.5]}`,
              background: cssVar('light'),
              borderRadius: RADIUS.sm,
              fontSize: FONT_SIZE.xs,
              fontWeight: FONT_WEIGHT.semibold,
              border: `1px solid ${RGBA_TOKENS.shadowSm}`,
            }}
          >
            Click
          </kbd>{' '}
          <span>to flap</span>
        </p>
        {bestScore > 0 && (
          <p
            style={{
              fontSize: FONT_SIZE.md,
              fontWeight: FONT_WEIGHT.semibold,
              color: cssVar('magenta'),
              margin: `0 0 ${SPACING[3]}`,
            }}
          >
            Best: {bestScore}
          </p>
        )}
        <button
          type="button"
          onClick={onPlay}
          style={{
            padding: `${SPACING[2]} ${SPACING[6]}`,
            fontSize: FONT_SIZE.lg,
            fontWeight: FONT_WEIGHT.bold,
            color: cssVar('white'),
            background: cssVar('violet'),
            border: 'none',
            borderRadius: RADIUS.lg,
            cursor: 'pointer',
          }}
        >
          Play
        </button>
      </div>
    </dialog>
  );
}
