import { COLOR_TOKENS, FONT_SIZE, FONT_WEIGHT, OPACITY, SPACING } from '@repo/flappy-nature-game';

export function DemoFooter() {
  return (
    <footer
      style={{
        padding: `${SPACING[5]} ${SPACING[6]}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING[1.5],
      }}
    >
      <a
        href="https://www.secondnature.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: SPACING[1],
          textDecoration: 'none',
        }}
      >
        <img
          src="/favicon.svg"
          alt="Second Nature"
          width={20}
          height={20}
          style={{ opacity: OPACITY.visible }}
        />
        <span
          style={{
            fontSize: FONT_SIZE.xs,
            fontWeight: FONT_WEIGHT.semibold,
            color: COLOR_TOKENS.navy,
            opacity: OPACITY.subtle,
            letterSpacing: '0.025em',
          }}
        >
          All logos, trademarks &amp; likeness &copy; Second Nature
        </span>
      </a>
      <span
        style={{
          fontSize: FONT_SIZE['2xs'],
          fontWeight: FONT_WEIGHT.normal,
          color: COLOR_TOKENS.navy,
          opacity: OPACITY.subtle,
          letterSpacing: '0.025em',
        }}
      >
        A tribute by{' '}
        <a
          href="https://github.com/aram-devdocs"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'inherit',
            textDecoration: 'underline',
            fontWeight: FONT_WEIGHT.semibold,
          }}
        >
          aramhammoudeh
        </a>
      </span>
    </footer>
  );
}
