import { HeartIcon } from '../atoms/HeartIcon.js';

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
        background: 'rgba(9, 9, 73, 0.35)',
        zIndex: 5,
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
          background: 'var(--fn-white, #FFFFFF)',
          borderRadius: '16px',
          padding: '24px 32px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>
          <HeartIcon />
        </div>
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: 'var(--fn-navy, #090949)',
            margin: '0 0 12px',
          }}
        >
          Flappy Nature
        </h2>
        <p
          style={{
            fontSize: '11px',
            color: 'var(--fn-navy, #090949)',
            opacity: 0.55,
            margin: '0 0 8px',
          }}
        >
          <kbd
            style={{
              padding: '2px 6px',
              background: 'var(--fn-light, #FBF6F6)',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            Space
          </kbd>{' '}
          <kbd
            style={{
              padding: '2px 6px',
              background: 'var(--fn-light, #FBF6F6)',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 600,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            Click
          </kbd>{' '}
          <span>to flap</span>
        </p>
        {bestScore > 0 && (
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--fn-magenta, #D76EFF)',
              margin: '0 0 12px',
            }}
          >
            Best: {bestScore}
          </p>
        )}
        <button
          type="button"
          onClick={onPlay}
          style={{
            padding: '8px 24px',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--fn-white, #FFFFFF)',
            background: 'var(--fn-violet, #6500D9)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Play
        </button>
      </div>
    </dialog>
  );
}
