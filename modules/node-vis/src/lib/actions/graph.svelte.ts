import { getContext, setContext } from "svelte";
import type { Action } from "svelte/action";
import type { Graph } from "../types.js";
import { useConnectContext } from "./connectable.svelte.js";

/** The symbol used to create a graph context */
const GraphContextSymbol = Symbol("node-vis graph");

/** The reactive data stored in a graph context
 * @note this needs to be reactive because of how svelte contexts work
 */
class GraphData {
  graph: Graph = $state.raw({});
}

/** Fetches Data stored about graph nodes */
export const useGraphData = () => getContext<GraphData>(GraphContextSymbol);

/** Creates an action to create a graph from an element
 * Within this graph, `nodes` may be added with the
 * [`useNode`](./node.svelte.ts) hook
 */
export const useGraph = (): Action => {
  setContext(GraphContextSymbol, new GraphData());
  return useConnectContext();
};
