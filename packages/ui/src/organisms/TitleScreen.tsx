interface TitleScreenProps {
  visible: boolean;
  bestScore: number;
  onPlay: () => void;
}

export function TitleScreen({ visible, bestScore, onPlay }: TitleScreenProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(9, 9, 73, 0.35)',
        zIndex: 5,
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px 32px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>
          <svg width="48" height="48" viewBox="0 0 32 32" role="img" aria-label="Heart icon">
            <path
              d="M16 1.88647C8.01418 1.88647 2 7.9574 2 15.9999C2 24.0425 8.01418 30.1134 16 30.1134C23.9858 30.1134 30 24.0425 30 15.9999C30 7.9574 23.9858 1.88647 16 1.88647ZM23.1773 16.851L16.5957 23.4326C16.2553 23.773 15.6879 23.773 15.3475 23.4326L8.9078 16.9929C7.33333 15.4184 7.06383 12.8794 8.42553 11.1205C10.0709 8.99286 13.1489 8.85101 14.9929 10.695L15.9716 11.6737L16.8511 10.7943C18.539 9.09215 21.3333 8.92194 23.078 10.5673C24.8794 12.2695 24.922 15.1063 23.1773 16.851Z"
              fill="var(--fn-violet, #6500D9)"
            />
          </svg>
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
            color: '#fff',
            background: 'var(--fn-violet, #6500D9)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
}
