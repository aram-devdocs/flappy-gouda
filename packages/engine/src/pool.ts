import { atIndex } from './assert';

/** Swap-and-pop removal from an object pool. Returns the new active count. */
export function poolRemove<T>(pool: T[], i: number, activeCount: number): number {
  const last = activeCount - 1;
  if (i !== last) {
    const tmp = atIndex(pool, i);
    pool[i] = atIndex(pool, last);
    pool[last] = tmp;
  }
  return activeCount - 1;
}
