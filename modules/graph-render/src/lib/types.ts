// The types used here are designed to minimise the number
// of references needed to navigate the graph
// and access the attached elements

import type { Side } from "./utils/side.js";

/** A complete visualisation graph */
export type Graph = { [name: symbol]: GraphNode };

/** A single node in the visual graph */
export type GraphNode = {
  /** The element this node is attached to.\
   * Used to manipulate the node in the DOM
   */
  elem: HTMLElement;
  /** The data attached to the given `node` */
  data: any;
  /** The ports on this `node` that can be connected to other ports */
  ports: { [name: symbol]: GraphPort };
};

/** A port attached to a node in the visual graph */
export type GraphPort = {
  /** The element this port is attached to\
   * Used to manipulate the node in the DOM
   */
  elem: HTMLElement;
  /** The side that all edges should originate from on the port */
  side: Side;
  /** The data attached to the given `port`\
   * This data is provided to the `is_connectable` function
   */
  data: any;
  /** Edges from this port to other ports */
  edges: GraphEdge[];
};

/** An edge connected to 2 given ports */
export type GraphEdge = {
  /** The element visually connecting ports */
  elem: SVGPathElement;
  /** The other port the edge is connected into */
  into: GraphPort;
};
