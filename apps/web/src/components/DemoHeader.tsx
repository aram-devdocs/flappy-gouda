import {
  COLOR_TOKENS,
  FONT_FAMILY,
  FONT_SIZE,
  FONT_WEIGHT,
  OPACITY,
  SHADOW,
  SPACING,
} from '@repo/flappy-gouda-game';

export function DemoHeader() {
  return (
    <header
      style={{
        background: COLOR_TOKENS.navy,
        padding: `${SPACING[5]} ${SPACING[6]}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: SHADOW.dropdown,
      }}
    >
      <div
        style={{
          height: '80px',
          width: '200px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/assets/logos/vegan-gouda-games.png"
          alt="Vegan Gouda Games"
          style={{
            height: '280px',
            filter: 'brightness(0) invert(1)',
            marginTop: SPACING[6],
          }}
        />
      </div>
      <div
        aria-hidden="true"
        style={{
          height: '1px',
          width: '64px',
          background: `linear-gradient(90deg, ${COLOR_TOKENS.magenta}, ${COLOR_TOKENS.cyan})`,
          opacity: OPACITY.visible,
          margin: `${SPACING[2]} 0`,
        }}
      />
      <h1
        style={{
          color: COLOR_TOKENS.cyan,
          fontFamily: FONT_FAMILY.heading,
          fontSize: FONT_SIZE.sm,
          fontWeight: FONT_WEIGHT.bold,
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          margin: 0,
        }}
      >
        Flappy Gouda
      </h1>
    </header>
  );
}
