import { FONT_SIZE, FONT_WEIGHT, OPACITY, RADIUS, SPACING, Z_INDEX, cssVar } from '@repo/types';

/** Props for {@link LiveRankOverlay}. */
export interface LiveRankOverlayProps {
  visible: boolean;
  rank: number | null;
  improving: boolean;
}

/** Pointer-events-none overlay showing live leaderboard rank during gameplay. */
export function LiveRankOverlay({ visible, rank, improving }: LiveRankOverlayProps) {
  if (!visible || rank === null) return null;

  return (
    <div
      aria-label={`Current rank: ${rank}`}
      style={{
        position: 'absolute',
        top: SPACING[8],
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: Z_INDEX.overlay,
        display: 'flex',
        alignItems: 'center',
        gap: SPACING[1],
        padding: `${SPACING[0.5]} ${SPACING[2]}`,
        borderRadius: RADIUS.pill,
        background: improving ? cssVar('cyan') : cssVar('navy'),
        opacity: OPACITY.strong,
        transition: 'background 0.3s ease, opacity 0.3s ease',
      }}
    >
      <span
        style={{
          fontSize: FONT_SIZE.xs,
          fontWeight: FONT_WEIGHT.bold,
          color: cssVar('white'),
          letterSpacing: '0.02em',
        }}
      >
        #{rank}
      </span>
      {improving && (
        <span
          style={{
            fontSize: FONT_SIZE.xs,
            color: cssVar('white'),
            fontWeight: FONT_WEIGHT.bold,
          }}
        >
          ↑
        </span>
      )}
    </div>
  );
}
