import { COLOR_TOKENS, FONT_FAMILY, SPACING } from '@repo/flappy-gouda-game';
import type { ReactNode } from 'react';
import { DemoBadges } from './DemoBadges';
import { DemoFooter } from './DemoFooter';
import { DemoHeader } from './DemoHeader';

interface DemoPageProps {
  children: ReactNode;
}

export function DemoPage({ children }: DemoPageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'auto',
        background: `linear-gradient(to bottom, ${COLOR_TOKENS.lavender}, ${COLOR_TOKENS.lavender} 40%, ${COLOR_TOKENS.light})`,
        fontFamily: FONT_FAMILY.body,
      }}
    >
      <DemoHeader />
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${SPACING[4]} ${SPACING[6]}`,
        }}
      >
        {children}
        <DemoBadges />
      </main>
      <DemoFooter />
    </div>
  );
}
