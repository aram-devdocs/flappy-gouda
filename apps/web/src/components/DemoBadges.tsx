import { SPACING } from '@repo/flappy-gouda-game';
import { BADGES } from '../badge-data';

export function DemoBadges() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING[2],
        padding: `${SPACING[3]} 0`,
        flexWrap: 'wrap',
      }}
    >
      {BADGES.map((badge) => (
        <a
          key={badge.alt}
          href={badge.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={badge.label}
        >
          <img src={badge.imgSrc} alt={badge.alt} height={20} />
        </a>
      ))}
    </div>
  );
}
