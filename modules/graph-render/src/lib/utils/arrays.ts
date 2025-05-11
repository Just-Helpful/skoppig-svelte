/** Calculates the minimum of an array of `items` by a `key` function */
export function min_by<T>(
  items: T[],
  key: (item: T) => number
): [T | undefined, number] {
  let min = undefined;
  let min_val = Infinity;

  for (const item of items) {
    const item_val = key(item);

    if (item_val < min_val) {
      min = item;
      min_val = item_val;
    }
  }

  return [min, min_val];
}
