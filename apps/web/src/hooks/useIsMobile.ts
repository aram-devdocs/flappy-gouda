import { useBreakpoint } from './useBreakpoint';

/** @deprecated Use `useBreakpoint()` instead for 3-tier responsive support. */
export function useIsMobile(): boolean {
  return useBreakpoint() === 'mobile';
}
