<script lang="ts">
  import DragNode from "./DragNode.svelte";

  const rand_int = (n: number) => Math.floor(Math.random() * n);
  const rand_pos = ([w, h]: [number, number]): [number, number] => [
    rand_int(w),
    rand_int(h),
  ];

  let elem: HTMLDivElement | undefined = $state();
  let nodes = $derived.by(() => {
    if (elem === undefined) return [];
    const { width, height } = elem.getBoundingClientRect();

    return Array.from({ length: 30 }, () => ({
      pos: rand_pos([width, height]),
    }));
  });
</script>

<div bind:this={elem}>
  {#each nodes as { pos }, i}
    <DragNode name={`Node ${i}`} {pos}></DragNode>
  {/each}
</div>

<style>
  div {
    margin: 0px;
    width: 100vw;
    height: 100vh;
  }
</style>
