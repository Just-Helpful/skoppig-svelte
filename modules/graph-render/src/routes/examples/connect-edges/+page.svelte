<script lang="ts">
  import DragPort from "./DragPort.svelte";
  import type { Side } from "$lib/utils/side.js";
  import { useConnectContext } from "$lib/index.js";
  const context = useConnectContext();

  const rand_int = (n: number) => Math.floor(Math.random() * n);
  const rand_side = () => (rand_int(4) % 4) as Side;
  const rand_pos = ([w, h]: [number, number]): [number, number] => [
    rand_int(w) + 50,
    rand_int(h) + 50,
  ];

  let elem: HTMLDivElement | undefined = $state();
  let ports: { pos: [number, number]; side: Side }[] = $derived.by(() => {
    if (elem === undefined) return [];
    const { width, height } = elem!.getBoundingClientRect();

    return Array.from({ length: 30 }, () => ({
      pos: rand_pos([width - 100, height - 100]),
      side: rand_side(),
    }));
  });
</script>

<div use:context bind:this={elem}>
  {#each ports as { pos, side }, i}
    <DragPort name={`Port ${i}`} {pos} {side}></DragPort>
  {/each}
</div>

<style>
  div {
    margin: 0px;
    width: 100vw;
    height: 100vh;
  }
</style>
