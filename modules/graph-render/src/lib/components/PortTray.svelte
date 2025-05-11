<script lang="ts" module>
  import type { Snippet } from "svelte";

  export type Props = {
    /** The side on which to mount the ports tray */
    side: Side;
    /** The ports to render within the tray */
    children?: Snippet;
  };
</script>

<script lang="ts">
  import type { Side } from "../utils/side.js";
  const { side, children }: Props = $props();
</script>

<div class="side-{side}">
  {@render children?.()}
</div>

<style>
  div {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
  }

  /** Vertical ports, east / west */
  .side-0,
  .side-2 {
    width: 0px;
    height: 100%;
    flex-direction: column;
  }
  /** Horizontal ports, north / south */
  .side-1,
  .side-3 {
    width: 100%;
    height: 0px;
    flex-direction: row;
  }

  /** Ports for west / south appear in bottom right */
  .side-2,
  .side-3 {
    right: 0px;
    bottom: 0px;
  }
</style>
