import type { Action } from "svelte/action";
import { useNodeData } from "./node.svelte.js";
import {
  type ConnectDetails,
  useConnectData,
  type ConnectableHandlers,
} from "./connectable.svelte.js";
import { side_from_elems } from "$lib/utils/side.js";
import { connectable_edge } from "../utils/connect_edge.js";
import { symbol_values } from "$lib/utils/objects.js";

export { config } from "../utils/connect_edge.js";

/** Initialisation data for the `port` action */
type PortInit = {
  /** The name this port should be initialised with.\
   * Defaults to `"node-vis port"`.
   */
  name?: string;
  /** The data to be attached to this port */
  data?: any;
};

/** Custom event handlers attached to a `port` */
type PortHandlers = ConnectableHandlers;

/** Creates an action that adds a port to an existing node\
 * In order to construct a node, use the
 * [`node`](./node.svelte.ts) action
 */
export const usePort = () => port;

/** An action that adds a port to an existing node\
 * In order to construct a node, use the
 * [`node`](./node.svelte.ts) action
 */
const port: Action<HTMLElement, PortInit | undefined, PortHandlers> = (
  elem,
  { name = "node-vis port", data }: PortInit = {}
) => {
  $effect(() => {
    const { node } = useNodeData();
    if (node === undefined) return;

    const key = Symbol(name);
    const side = side_from_elems(node.elem, elem);
    const port = { elem, side, data, edges: [] };
    node.ports[key] = port;

    const connectData = useConnectData();
    const { connect } = connectData;
    if (connect === undefined) return;
    const { svg, anchors } = connect;
    anchors[key] = { elem, side, data: port };

    const cleanup_connect = connectable_edge(
      svg,
      anchors[key],
      () => symbol_values(anchors),
      ({ detail: { elem: path, from, into } }): void => {
        from.edges.push({ elem: path, into: into });
        into.edges.push({ elem: path, into: from });

        const evt = new CustomEvent<ConnectDetails>("connect", {
          detail: { elem: path, from: from.data, into: into.data },
        });
        elem.dispatchEvent(evt);
      }
    );

    return () => {
      delete node.ports[key];
      delete anchors[key];
      cleanup_connect();
    };
  });
};
