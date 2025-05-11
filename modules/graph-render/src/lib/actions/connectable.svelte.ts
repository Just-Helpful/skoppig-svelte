import { getContext, setContext } from "svelte";
import type { Action } from "svelte/action";
import {
  connectable_edge,
  type ElemDataAnchor,
} from "../utils/connect_edge.js";
import type { Side } from "$lib/utils/side.js";
import { symbol_values } from "../utils/objects.js";

const ConnectContextSymbol = Symbol("node-vis edge context");

/** Data used for connectin ports */
class ConnectData {
  connect?: {
    /** The SVG element to draw connecting paths on */
    svg: SVGSVGElement;
    /** Possible connection points for paths */
    anchors: { [key: symbol]: ElemDataAnchor };
  } = $state.raw();
}

/** Fetches Data stored about the connection context */
export const useConnectData = () =>
  getContext<ConnectData>(ConnectContextSymbol);

/** Creates a context that enables the creation of edges between connectable ports\
 * This both sets up the SVG required to draw them and the port storage.
 */
export const useConnectContext = (): Action => {
  setContext(ConnectContextSymbol, new ConnectData());
  return connect_context;
};

/** A context that enables the creation of edges between connectable ports\
 * This both sets up the SVG required to draw them and the port storage.
 */
const connect_context: Action = (elem) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.width = "100%";
  svg.style.height = "100%";
  elem.appendChild(svg);

  const connect_ctx = useConnectData();
  connect_ctx.connect = { svg, anchors: {} };
  // no cleanup needed, all state is connected to the element
};

/** Parameters to the `connectable` action */
export type ConnectableParams = {
  /** The side from which to connect edges to */
  side: Side;
  /** Data attached to the connectable element\
   * Data from both elements involved in a connection\
   * will be passed to the `onconnect` handler
   */
  data?: any;
};

/** Data attached to a connect event, under the `details` key */
export type ConnectDetails<Data = any> = {
  /** The SVG path created connecting the two ports */
  elem: SVGPathElement;
  /** Data attached to the input port into the edge*/
  from: Data;
  /** Data attached to the output port from the edge */
  into: Data;
};

/** Event handlers for `connectable` elements */
export type ConnectableHandlers<Data = any> = {
  /** A handler called when this port is connected to another.
   *
   * When this handler throws an error, the connection fails\
   * and the error is propagated to further error handlers.\
   * This can be used to report why the connection failed.
   *
   * @param e event data for the edge between the ports
   */
  onconnect(e: CustomEvent<ConnectDetails<Data>>): void;
};

/** Makes a given element connectable to others with `connectable`.\
 * Connections are made with an Bezier path between nodes.\
 * This requires that all nodes are children of a element with
 * [`connect_context`](./connectable.svelte.ts).
 */
export const connectable: Action<
  HTMLElement,
  ConnectableParams,
  ConnectableHandlers
> = (elem, { side, data = null }) => {
  $effect(() => {
    const { connect } = useConnectData();
    if (connect === undefined) return;
    const { svg, anchors } = connect;

    const key = Symbol("node-vis port");
    const source = { elem, side, data };
    anchors[key] = source;

    const cleanup_drag = connectable_edge(
      svg,
      source,
      () => symbol_values(anchors),
      (e) => {
        elem.dispatchEvent(e);
      }
    );

    return () => {
      delete anchors[key];
      cleanup_drag();
    };
  });
};
