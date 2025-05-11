<script lang="ts" module>
  import type { Side } from "$lib/utils/side.js";
  type Props = {
    name: string;
    pos: [number, number];
    side: Side;
  };
</script>

<script lang="ts">
  import { connectable } from "$lib/index.js";
  const { name, pos, side }: Props = $props();
  const [x, y] = pos;

  const inner_style = [
    "width: 5px; height: 100%; left: 0", //   west
    "width: 100%; height: 5px; top: 0", //    north
    "width: 5px; height: 100%; right: 0", //  east
    "width: 100%; height: 5px; bottom: 0", // south
  ][side];
</script>

<div
  use:connectable={{ side, data: name }}
  onconnect={(e) =>
    console.log(`Connected "${e.detail.from}" and "${e.detail.into}"`)}
  class="outer"
  style="left: {x}px; top: {y}px;"
>
  <div class="inner" style={inner_style}></div>
</div>

<style>
  .outer {
    position: absolute;
    background-color: rgb(0 207 0 / 0.9);

    width: 20px;
    height: 20px;
  }

  .inner {
    position: absolute;
    background-color: rgb(from red r g b / 0.9);
  }
</style>
