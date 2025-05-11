import { getContext, setContext } from "svelte";
import type { Action } from "svelte/action";
import { useGraphData } from "./graph.svelte.js";
import type { GraphNode } from "$lib/types.js";
import { add_node_drag } from "$lib/utils/drag_node.js";

/** The symbol used to create a node context */
const NodeContextSymbol = Symbol("node-vis node");

/** The reactive data stored in a node context
 * @note this needs to be reactive because of how svelte contexts work
 */
class NodeData {
  node?: GraphNode = $state.raw();
}

/** Fetches the node data attached to the current context */
export const useNodeData = () => getContext<NodeData>(NodeContextSymbol);

/** Creates an action that adds a node to an existing graph\
 * In order to construct a graph, use the
 * [`useGraph`](./graph.svelte.ts) hook
 */
export const useNode = () => {
  // set up the context needed for nodes
  setContext(NodeContextSymbol, new NodeData());
  return node;
};

/** Initialisation data for the `node` action */
type NodeInit = {
  /** The name this node should be initialised with.\
   * Defaults to `"node-vis node"`.
   */
  name?: string;
  /** The data to be attached to this node */
  data?: any;
};

/** An action that adds a node to an existing graph\
 * In order to construct a graph, use the
 * [`graph`](./graph.svelte.ts) action
 */
export const node: Action<HTMLElement, NodeInit | undefined> = (
  elem,
  { name = "node-vis node", data }: NodeInit = {}
) => {
  $effect(() => {
    const { graph } = useGraphData();
    if (graph === undefined) return;
    const node_ctx = useNodeData();

    const node: GraphNode = { elem, data, ports: {} };
    const key = Symbol(name);
    node_ctx.node = node;
    graph[key] = node;

    const cleanup_drag = add_node_drag(elem, () => [node]);
    return () => {
      delete graph[key];
      cleanup_drag();
    };
  });
};
