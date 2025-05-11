import type { GraphPort, GraphEdge, GraphNode } from "$lib/types.js";
import { edge_from_poss } from "$lib/utils/bezier_edge.js";
import { type Side } from "./side.js";
import { center_of } from "./elem_rects.js";
import { add_drag } from "./drag.js";
import { symbol_values } from "./objects.js";

/** Adds node drag handlers to a given node.
 * @param elem **[mut]** the element to attach drag handlers to
 * @param targets the nodes the drag action should affect\
 *   This uses a callback to keep it somewhat independent\
 *   of how selected nodes are implemented.
 * @returns a cleanup function for drag handlers
 */
export function add_node_drag(elem: HTMLElement, targets: () => GraphNode[]) {
  let node_diffs: NodeDiff[];
  let single: MovableSingle[];
  let double: MovableDouble[];

  const onstart = ({ clientX: mx, clientY: my }: MouseEvent) => {
    const nodes = targets();

    node_diffs = nodes.map(({ elem }) => {
      const { x, y } = elem.getBoundingClientRect();
      return { elem, diff: [x - mx, y - my] };
    });

    const partitioned = partition_edges(
      nodes.flatMap(({ ports }) => symbol_values(ports))
    );
    single = partitioned.single.map((edge) => make_single(edge, [mx, my]));
    double = partitioned.double.map((edge) => make_double(edge, [mx, my]));
  };

  const onmove = ({ clientX: mx, clientY: my }: MouseEvent) => {
    // update the positions of all nodes
    for (const {
      elem,
      diff: [dx, dy],
    } of node_diffs) {
      elem.style.left = `${mx + dx}px`;
      elem.style.top = `${my + dy}px`;
    }

    // update the positions of all edges
    for (const edge of single) move_single(edge, [mx, my]);
    for (const edge of double) move_double(edge, [mx, my]);
  };

  return add_drag(elem, { onstart, onmove, onend: onmove });
}

/** The relative position to maintain to a given node */
type NodeDiff = {
  /** The node to be dragged around */
  elem: HTMLElement;
  /** The offset to be maintained from the cursor */
  diff: [number, number];
};

/** Partitions graph edges into:
 * 1. those that have both targets connected (undirected)
 * 2. those that only have one target connected (directed)
 *
 * and creates offset data that can be used to move the edges.
 *
 * @param ports the target ports to partition the edges connected to
 * @returns edges split into single and double edge data
 */
function partition_edges(ports: GraphPort[]): {
  /** Edges with only one target connected */
  single: [GraphPort, GraphEdge][];
  /** Edges with both targets connected */
  double: [GraphEdge, GraphEdge][];
} {
  const edges = ports
    .values()
    .flatMap((port) =>
      port.edges.values().map((edge) => [port, edge] as const)
    );
  let seen = new Map<GraphPort, Map<GraphPort, GraphEdge>>();
  let double: [GraphEdge, GraphEdge][] = [];

  for (const [from, edge] of edges) {
    const { into } = edge;

    // edge both ways, pop and add to `double`
    const ports = seen.get(from);
    const edge_ = ports?.get(into)!;
    if (ports?.delete(into)) {
      double.push([edge, edge_]);
    }

    // insert the new edge to check
    if (!seen.has(into)) {
      seen.set(into, new Map());
    }
    seen.get(into)!.set(from, edge);
  }

  const single = seen
    .values()
    .flatMap((edges) => edges.entries())
    .toArray();

  return { single, double };
}

/** Only one anchor of the edge is included in target to move\
 * This means we have to recalculate the edge with every movement.
 */
type MovableSingle = {
  /** The element to move one endpoint of */
  elem: SVGPathElement;
  /** The offset of the moving anchor to be maintained from the cursor */
  diff0: [number, number];
  /** The side of the moving anchor the edge originates from */
  side0: Side;
  /** The position of the static anchor */
  pos1: [number, number];
  /** The side of the static anchor the edge originates from */
  side1: Side;
};

/** Creates the data required to move the position of a directed edge\
 * In this case `from` will be moved, whereas `into` remains static.
 * @param edge both ends of the the single edge to create
 * @param mouse the mouse position to set the initial offset from
 */
export function make_single(
  [from, { elem, into }]: [GraphPort, GraphEdge],
  [mx, my]: [number, number]
): MovableSingle {
  const [x, y] = center_of(from.elem);
  return {
    elem,
    diff0: [x - mx, y - my],
    side0: from.side,
    pos1: center_of(into.elem),
    side1: into.side,
  };
}

/** Updates a directed edge, relative to a given mouse position
 * @param edge **[mut]** the single edge to update one end of
 * @param mouse the mouse position to update the edge position relative to
 */
function move_single(
  { elem, diff0: [dx, dy], side0, pos1, side1 }: MovableSingle,
  [mx, my]: [number, number]
) {
  const pos0: [number, number] = [mx + dx, my + dy];
  const path = edge_from_poss(
    { pos: pos0, side: side0 },
    { pos: pos1, side: side1 }
  );
  elem.setAttribute("d", path);
}

/** Both anchors of the edge are included in targets to move\
 * This effectively means we just have to translate the position of the edge.
 */
type MovableDouble = {
  /** The element to move both endpoints of */
  elem: SVGPathElement;
  /** The offset of the 1st anchor to be maintained from the cursor */
  diff0: [number, number];
  /** The side of the 1st anchor the edge originates from */
  side0: Side;
  /** The offset of the 2nd anchor to be maintained from the cursor */
  diff1: [number, number];
  /** The side of the 2nd anchor the edge originates from */
  side1: Side;
};

/** Creates the data required to move the position of an undirected edge\
 * In this case, both `from` and `into` will be moved.
 * @param edge both ends of the double edge to create
 * @param mouse the mouse position to set the initial offset from
 */
function make_double(
  [{ into: from }, { elem, into }]: [GraphEdge, GraphEdge],
  [mx, my]: [number, number]
): MovableDouble {
  const [x0, y0] = center_of(from.elem);
  const [x1, y1] = center_of(into.elem);
  return {
    elem,
    diff0: [x0 - mx, y0 - my],
    side0: from.side,
    diff1: [x1 - mx, y1 - my],
    side1: into.side,
  };
}

/** Updates an undirected edge, relative to a given mouse position
 * @param edge **[mut]** the double edge to update both ends of
 * @param mouse the mouse position to update the edge position relative to
 *
 * @todo doing this via a transform on the entire edge might be more
 * efficient, see how plausible it is.
 */
function move_double(
  { elem, diff0: [dx0, dy0], side0, diff1: [dx1, dy1], side1 }: MovableDouble,
  [mx, my]: [number, number]
) {
  const pos0: [number, number] = [mx + dx0, my + dy0];
  const pos1: [number, number] = [mx + dx1, my + dy1];
  const path = edge_from_poss(
    { pos: pos0, side: side0 },
    { pos: pos1, side: side1 }
  );
  elem.setAttribute("d", path);
}
