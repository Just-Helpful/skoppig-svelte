import { center_rect, center_of, type CenteredRect } from "./elem_rects.js";

/** The direction an edge comes out of a port\
 * @note sides are arranged in the given order\
 * to allow for some bit manipulation optimisations.
 */
export type Side =
  | 0 // west  (-x)
  | 1 // north (-y)
  | 2 // east (+x)
  | 3; // south (+y)

export const WEST: Side = 0;
export const NORTH: Side = 1;
export const EAST: Side = 2;
export const SOUTH: Side = 3;

/** An enum for valid side values */
export const SIDE = {
  WEST: 0 as Side,
  NORTH: 1 as Side,
  EAST: 2 as Side,
  SOUTH: 3 as Side,
};

/** Finds which side an element is on from a `root` element.
 * @param root the root element to find the side from
 * @param elem the element to calculate the side of
 * @returns the side of `elem` on `root`
 */
export function side_from_elems(root: HTMLElement, elem: HTMLElement): Side {
  return side_from_pos(center_rect(root), center_of(elem));
}

/** Finds the side of a position relative to a scaled origin
 * @param origin the origin to resolve the position from
 * @param pos the position to resolve the direction of
 * @returns the side that `pos` is from `origin`
 */
export function side_from_pos(
  { center: [cx, cy], dims: [w, h] }: CenteredRect,
  [x, y]: [number, number]
): Side {
  x -= cx;
  y -= cy;
  x /= w;
  y /= h;

  // vertical direction, either north or south
  if (Math.abs(x) < Math.abs(y)) {
    return y > 0 ? SOUTH : NORTH;
  }

  // horizontal direction, either east or west
  return x > 0 ? EAST : WEST;
}
