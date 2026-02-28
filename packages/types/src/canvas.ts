/** Three stacked canvas elements used for layered rendering. */
export interface CanvasStack {
  /** Bottom layer for slow-moving elements (sky, far clouds, skyline). */
  bg: HTMLCanvasElement;
  /** Middle layer for moderate-speed elements (mid clouds, buildings, trees). */
  mg: HTMLCanvasElement;
  /** Top layer for per-frame elements (pipes, bird, score, ground). */
  fg: HTMLCanvasElement;
}
