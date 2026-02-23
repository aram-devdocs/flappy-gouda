export const TAU = Math.PI * 2;
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
