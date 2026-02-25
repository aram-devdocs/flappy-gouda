import { COLOR_TOKENS, FONT_SIZE, FONT_WEIGHT, OPACITY, SPACING } from '@repo/flappy-nature-game';

export function DemoFooter() {
  return (
    <footer
      style={{
        background: COLOR_TOKENS.navy,
        padding: `0 ${SPACING[6]} ${SPACING[5]}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING[1.5],
      }}
    >
      <div
        style={{
          height: '1px',
          width: '64px',
          background: `linear-gradient(90deg, ${COLOR_TOKENS.magenta}, ${COLOR_TOKENS.cyan})`,
          opacity: OPACITY.visible,
          marginBottom: SPACING[4],
          marginTop: SPACING[5],
        }}
      />
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
          style={{ opacity: OPACITY.strong }}
        />
        <span
          style={{
            fontSize: FONT_SIZE.xs,
            fontWeight: FONT_WEIGHT.semibold,
            color: COLOR_TOKENS.light,
            opacity: OPACITY.visible,
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
          color: COLOR_TOKENS.light,
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
            color: COLOR_TOKENS.cyan,
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
