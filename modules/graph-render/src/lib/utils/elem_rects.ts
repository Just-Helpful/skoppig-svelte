/** A bounding rectangle based on the center of the element */
export type CenteredRect = {
  /** The center of the HTML element */
  center: [number, number];
  /** The width and height of the HTML element */
  dims: [number, number];
};

/** Finds the centered bounding rectangle for the given element */
export function center_rect(elem: HTMLElement): CenteredRect {
  const { x, y, width, height } = elem.getBoundingClientRect();
  return { center: [x + width / 2, y + height / 2], dims: [width, height] };
}

/** Counteracts a common offset seen in centers\
 * @todo this is a magic number, try to find out why/if it's needed
 */
const OFFSET = 9;
/** Calculates the center of a given html element */

export function center_of(elem: HTMLElement): [number, number] {
  const { x, y, width, height } = elem.getBoundingClientRect();
  return [x + width / 2 - OFFSET, y + height / 2 - OFFSET];
}
