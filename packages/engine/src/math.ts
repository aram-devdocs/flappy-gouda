/** Full circle in radians (2 * PI). */
export const TAU = Math.PI * 2;
/** Multiplier to convert degrees to radians. */
export const DEG_TO_RAD = Math.PI / 180;

/** Return max of fn(item) across arr without allocating a temporary array. */
export function maxOf<T>(arr: T[], fn: (item: T) => number): number {
  let m = Number.NEGATIVE_INFINITY;
  for (let i = 0, len = arr.length; i < len; i++) {
    const v = fn(arr[i] as T);
    if (v > m) m = v;
  }
  return m;
}

/** Trace a rounded rectangle path on the canvas context. */
export function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
