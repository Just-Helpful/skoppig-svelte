/** Coordinate and bezier path calculations */
import { center_of } from "./elem_rects.js";
import type { Side } from "./side.js";

/** Config for coordinate and path resolution */
export let config = {
  /** How much edges are biased towards their initial direction */
  EDGE_BIAS: 25,
};

/** An anchor for an edge to be dragged from or into */
export type ElemAnchor = {
  /** The element to connect the edge to */
  elem: HTMLElement;
  /** The side from which the edge should connect */
  side: Side;
};

/** Calculates a bezier edge between the sides of two elements
 * @param anchor1 the element to emit an edge from
 * @param anchor2 the element to emit an edge into
 * @returns a string representing a bezier path between the elements
 */
export function edge_from_elems(
  { elem: elem0, side: side0 }: ElemAnchor,
  { elem: elem1, side: side1 }: ElemAnchor
): string {
  return edge_from_poss(
    { pos: center_of(elem0), side: side0 },
    { pos: center_of(elem1), side: side1 }
  );
}

/** Calculates the coordinates of an outgoing edge from a element
 * @param anchor the element and side to emit an edge from
 * @param pos the second position the edge will be connected to
 * @returns [[x0, y0], [x1, y1]] coordinates for the edge
 */
export function half_edge_from_elem(
  { elem, side }: ElemAnchor,
  pos: [number, number]
): [[number, number], [number, number]] {
  return half_edge_from_pos({ pos: center_of(elem), side }, pos);
}

/** An anchor for an edge to be dragged from or into */
export type PosAnchor = {
  /** The position to connect the edge to */
  pos: [number, number];
  /** The side from which the edge should connect */
  side: Side;
};

/** Calculates a bezier edge between the sides of two positions
 * @param anchor1 the position to emit an edge from
 * @param anchor2 the position to emit an edge into
 * @returns a string representing a bezier path between the positions
 */
export function edge_from_poss(
  { pos: pos0, side: side0 }: PosAnchor,
  { pos: pos1, side: side1 }: PosAnchor
): string {
  const pos2 = half_edge_from_pos({ pos: pos0, side: side0 }, pos1)[1];
  const pos3 = half_edge_from_pos({ pos: pos1, side: side1 }, pos0)[1];
  return `M ${pos0} C ${pos2} ${pos3} ${pos1}`;
}

/** Calculates the coordinates of an outgoing edge from a position
 * @param anchor the position and side to emit an edge from
 * @param pos the second position the edge will be connected to
 * @returns [[x0, y0], [x1, y1]] coordinates for the edge
 */
export function half_edge_from_pos(
  { pos: [x0, y0], side }: PosAnchor,
  [x1, y1]: [number, number]
): [[number, number], [number, number]] {
  const diff = [x1 - x0, y1 - y0];
  let dist = diff[side & 1] * ((side & 2) - 1);

  let pos = [x0, y0];
  pos[side & 1] += ((side & 2) - 1) * edge_bias(dist);
  const [x2, y2] = pos;

  return [
    [x0, y0],
    [x2, y2],
  ];
}

/** How much to bias an edge's immediate direction by
 * @note this is stolen almost directly from xyflow
 * [here](https://github.com/xyflow/xyflow/blob/411115f05b4a5b9c15f366e5537baeceab7899ec/packages/system/src/utils/edges/bezier-edge.ts#L69).\
 * I've made some slight changes here because\
 * I'm not fully satisfied with their way of doing things.
 *
 * @param dist the cartesian distance from the other point
 * @returns the bias to apply to initial edge direction
 */
function edge_bias(dist: number): number {
  const res =
    0 <= dist ? 0.5 * dist : 0.5 * config.EDGE_BIAS * Math.sqrt(-dist);
  return Math.max(config.EDGE_BIAS, res);
}
