<script lang="ts">
  import PortTray from "$lib/components/PortTray.svelte";
  import Port from "./Port.svelte";

  import { EAST, WEST } from "$lib/utils/side.js";
  import { useNode } from "$lib/index.js";
  const node = useNode();

  const { pos }: { pos: [number, number] } = $props();
  const [x, y] = pos;
</script>

<div use:node style="left: {x}px; top: {y}px">
  <PortTray side={EAST}>
    <Port></Port>
    <Port></Port>
  </PortTray>
  <PortTray side={WEST}>
    <Port></Port>
    <Port></Port>
    <Port></Port>
  </PortTray>
</div>

<style>
  div {
    position: absolute;
    width: 100px;
    height: 100px;

    background-color: slategray;
  }
</style>
