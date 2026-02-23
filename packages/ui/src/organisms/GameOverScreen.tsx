interface GameOverScreenProps {
  visible: boolean;
  score: number;
  bestScore: number;
}

export function GameOverScreen({ visible, score, bestScore }: GameOverScreenProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(9, 9, 73, 0.45)',
        zIndex: 5,
        pointerEvents: 'none',
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
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: 'var(--fn-navy, #090949)',
            margin: '0 0 8px',
          }}
        >
          Game Over
        </h2>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--fn-violet, #6500D9)',
            margin: '0 0 4px',
          }}
        >
          Score: {score}
        </p>
        <p
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--fn-magenta, #D76EFF)',
            margin: '0 0 16px',
          }}
        >
          Best: {bestScore}
        </p>
        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--fn-navy, #090949)',
            opacity: 0.5,
            margin: 0,
          }}
        >
          Space / Click to retry
        </p>
      </div>
    </div>
  );
}
