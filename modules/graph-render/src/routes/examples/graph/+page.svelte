<script lang="ts">
  import { useGraph } from "$lib/index.js";
  import Node from "./Node.svelte";

  const graph = useGraph();
</script>

<div use:graph>
  <Node pos={[500, 300]}></Node>
  <Node pos={[300, 400]}></Node>
  <Node pos={[600, 450]}></Node>
</div>

<style>
  div {
    width: 100vw;
    height: 100vh;
  }
</style>
