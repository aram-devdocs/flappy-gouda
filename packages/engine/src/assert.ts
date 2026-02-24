/** Access an array element with bounds checking. Throws if index is out of range. */
export function atIndex<T>(arr: T[], i: number): T {
  if (i < 0 || i >= arr.length) {
    throw new RangeError(`Array index ${i} out of bounds (length ${arr.length})`);
  }
  return arr[i] as T;
}
