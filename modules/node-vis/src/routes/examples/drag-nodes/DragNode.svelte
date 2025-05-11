<script lang="ts" module>
  type Props = {
    name: string;
    pos: [number, number];
  };
</script>

<script lang="ts">
  import { draggable } from "$lib/index.js";
  const { name, pos }: Props = $props();
  const [x, y] = pos;
</script>

<div
  use:draggable={{ data: name }}
  onmove={(e) => console.log(e.detail.data)}
  style="left: {x}px; top: {y}px"
></div>

<style>
  div {
    position: absolute;
    width: 50px;
    height: 50px;

    background-color: rgb(0 207 0 / 0.9);
  }
</style>
