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

/** Props for {@link GameOverScreen}. */
export interface GameOverScreenProps {
  visible: boolean;
  score: number;
  bestScore: number;
  isNewBest?: boolean;
  rank?: number | null;
}

/** Full-screen overlay shown after death with score, rank, and retry hint. */
export function GameOverScreen({
  visible,
  score,
  bestScore,
  isNewBest,
  rank,
}: GameOverScreenProps) {
  if (!visible) return null;

  return (
    <dialog
      open
      aria-label="Game over"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: RGBA_TOKENS.scrimHeavy,
        zIndex: Z_INDEX.modal,
        pointerEvents: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        maxWidth: 'none',
        maxHeight: 'none',
        width: '100%',
        height: '100%',
      }}
    >
      <div style={cardStyle}>
        <h2 style={titleStyle}>Game Over</h2>

        {isNewBest && <p style={newBestStyle}>New Best!</p>}

        <p style={scoreStyle}>{score}</p>

        {!isNewBest && <p style={bestLabelStyle}>Best: {bestScore}</p>}

        {rank != null && rank > 0 && <p style={rankStyle}>Rank #{rank}</p>}

        <p style={retryStyle}>Tap or Space to retry</p>
      </div>
    </dialog>
  );
}

const cardStyle: React.CSSProperties = {
  background: cssVar('white'),
  borderRadius: RADIUS['2xl'],
  padding: `${SPACING[5]} ${SPACING[7]}`,
  textAlign: 'center',
  boxShadow: SHADOW.card,
  maxWidth: '280px',
  width: '100%',
};

const titleStyle: React.CSSProperties = {
  fontSize: FONT_SIZE['2xl'],
  fontWeight: FONT_WEIGHT.extrabold,
  color: cssVar('navy'),
  margin: `0 0 ${SPACING[1]}`,
};

const newBestStyle: React.CSSProperties = {
  fontSize: FONT_SIZE.lg,
  fontWeight: FONT_WEIGHT.extrabold,
  color: cssVar('magenta'),
  margin: `0 0 ${SPACING[1]}`,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const scoreStyle: React.CSSProperties = {
  fontSize: FONT_SIZE['5xl'],
  fontWeight: FONT_WEIGHT.extrabold,
  color: cssVar('violet'),
  margin: `0 0 ${SPACING[1]}`,
  lineHeight: 1,
};

const bestLabelStyle: React.CSSProperties = {
  fontSize: FONT_SIZE.md,
  fontWeight: FONT_WEIGHT.semibold,
  color: cssVar('magenta'),
  margin: `0 0 ${SPACING[2]}`,
};

const rankStyle: React.CSSProperties = {
  fontSize: FONT_SIZE.md,
  fontWeight: FONT_WEIGHT.bold,
  color: cssVar('cyan'),
  margin: `0 0 ${SPACING[1]}`,
};

const retryStyle: React.CSSProperties = {
  fontSize: FONT_SIZE.md,
  fontWeight: FONT_WEIGHT.semibold,
  color: cssVar('navy'),
  opacity: OPACITY.soft,
  margin: 0,
};
