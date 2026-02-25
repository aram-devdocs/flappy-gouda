/** Z-index levels. */
export const Z_INDEX = {
  base: 0,
  miniOverlay: 1,
  overlay: 2,
  tab: 3,
  modal: 5,
  picker: 10,
} as const;

/** Opacity levels with semantic names. */
export const OPACITY = {
  hidden: 0,
  muted: 0.18,
  subtle: 0.4,
  dimmed: 0.45,
  soft: 0.5,
  medium: 0.55,
  visible: 0.6,
  prominent: 0.7,
  strong: 0.75,
} as const;
