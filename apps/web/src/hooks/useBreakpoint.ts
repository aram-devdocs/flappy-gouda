import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const TABLET_MIN = 640;
const DESKTOP_MIN = 1024;

function getBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < TABLET_MIN) return 'mobile';
  if (w < DESKTOP_MIN) return 'tablet';
  return 'desktop';
}

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    const mqlTablet = window.matchMedia(`(min-width: ${TABLET_MIN}px)`);
    const mqlDesktop = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);

    const update = () => setBreakpoint(getBreakpoint());
    mqlTablet.addEventListener('change', update);
    mqlDesktop.addEventListener('change', update);
    return () => {
      mqlTablet.removeEventListener('change', update);
      mqlDesktop.removeEventListener('change', update);
    };
  }, []);

  return breakpoint;
}
