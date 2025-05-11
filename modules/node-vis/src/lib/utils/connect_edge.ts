// Generates a draggable edge from a source to multiple possible targets
// This edge should visually snap to the nearest possible target when close enough

import {
  half_edge_from_pos,
  half_edge_from_elem,
  type ElemAnchor,
  type PosAnchor,
} from "./bezier_edge.js";
import { center_of } from "./elem_rects.js";
import { add_drag } from "./drag.js";
import { min_by } from "./arrays.js";
import { type ConnectDetails } from "../actions/connectable.svelte.js";

/** Config for draggable edge creation */
export let config = {
  /** The distance, in pixels, to snap to a target */
  SNAP_DISANCE: 50,
  /** The css colour used for edges */
  EDGE_COLOUR: "black",
  /** The width (in pixels) of edges */
  EDGE_WIDTH: 2.5,
};

/** Creates a new svg `path` element using styling from `config` */
export const create_path_elem = () => {
  let path_elem = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  path_elem.style.fill = "none";
  path_elem.style.stroke = config.EDGE_COLOUR;
  path_elem.style.strokeWidth = `${config.EDGE_WIDTH}px`;
  return path_elem;
};

/** An anchor for an edge to be dragged from or into, with attached data */
export type PosDataAnchor<Data = any> = PosAnchor & { data: Data };
/** An anchor for an edge to be dragged from or into, with attached data */
export type ElemDataAnchor<Data = any> = ElemAnchor & { data: Data };

/** Enables draggable edge creation from `source` to one of many `targets`.\
 * @param svg
 *   the svg element on which to draw the edge.
 * @param source
 *   The source from which to start dragging the edge.
 * @param targets
 *   Possible targets for the other end of the edge.\
 *   When within [`config.SNAP_DISTANCE`](./draggable_edge.ts) of any target,\
 *   the svg path will visually snap to that target\
 *   and releasing drag will persist the edge.
 * @param onconnect
 *   A handler for when the edge connects successfully
 * @returns a cleanup function that removes handlers
 */
export function connectable_edge<Data = any>(
  svg: SVGSVGElement,
  source: ElemDataAnchor<Data>,
  targets: ElemDataAnchor<Data>[] | (() => ElemDataAnchor<Data>[]),
  onconnect: (e: CustomEvent<ConnectDetails<Data>>) => void = () => {}
): () => void {
  let elem = create_path_elem();
  let target_data: PosDataAnchor<Data>[];

  /** Calculates the bezier path source to a mouse position.\
   * This will snap to any target within range.
   */
  const path_data = ({
    clientX: x,
    clientY: y,
  }: MouseEvent): [string, PosDataAnchor<Data> | undefined] => {
    const [closest, dist] = min_by(
      target_data,
      ({ pos: [tx, ty] }) => (tx - x) * (tx - x) + (ty - y) * (ty - y)
    );

    if (dist <= config.SNAP_DISANCE * config.SNAP_DISANCE) {
      // sufficiently close target, use that target's side
      const pos0 = center_of(source.elem);
      const { pos: pos1 } = closest!;

      const pos_source = { pos: pos0, ...source };
      const [p0, p1] = half_edge_from_pos(pos_source, pos1);
      const [p2, p3] = half_edge_from_pos(closest!, pos0);
      return [`M ${p0} C ${p1}, ${p3}, ${p2}`, closest!];
    } else {
      // no targets sufficiently close, use mouse coords
      const [p0, p1] = half_edge_from_elem(source, [x, y]);
      return [`M ${p0} C ${p1}, ${x}, ${y}, ${x}, ${y}`, undefined];
    }
  };

  /** When dragging is started, initialise target data and insert the edge */
  const onstart = (e: MouseEvent) => {
    // initialise data for drawing an edge
    // @note this assumes the target elements **don't** change
    // whilst we're dragging the edge, which might be faulty?
    const target_items = typeof targets === "function" ? targets() : targets;
    target_data = target_items.map(({ elem, side, data }) => {
      return { pos: center_of(elem), side, data };
    });

    // display the SVG edge in the DOM
    elem.setAttribute("d", path_data(e)[0]);
    svg.appendChild(elem);
  };

  /** When dragging is continued, simply update the path the edge uses */
  const onmove = (e: MouseEvent) => {
    elem.setAttribute("d", path_data(e)[0]);
  };

  /** When dragging finishes, decide whether the edge should be connected */
  const onend = (e: MouseEvent) => {
    const [path, target] = path_data(e);
    elem.setAttribute("d", path);

    // no targets snap, delete the path
    if (target === undefined) {
      svg.removeChild(elem);
      return;
    }

    // any targets snap, replace the variable
    const evt = new CustomEvent<ConnectDetails>("connect", {
      detail: { elem, from: source.data, into: target.data },
    });
    onconnect(evt);
    elem = create_path_elem();
  };

  return add_drag(source.elem, { onstart, onmove, onend });
}
