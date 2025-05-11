<script lang="ts">
  import PortTray from "$lib/components/PortTray.svelte";
  import { NORTH, EAST, SOUTH, WEST } from "$lib/utils/side.js";
</script>

<div class="node">
  <PortTray side={SOUTH}>
    <div class="port"></div>
  </PortTray>
  <PortTray side={EAST}>
    <div class="port"></div>
    <div class="port"></div>
  </PortTray>
  <PortTray side={WEST}>
    <div class="port"></div>
    <div class="port"></div>
    <div class="port"></div>
  </PortTray>
  <PortTray side={NORTH}>
    <div class="port"></div>
    <div class="port"></div>
    <div class="port"></div>
    <div class="port"></div>
  </PortTray>
</div>

<style>
  .node {
    position: relative;
    width: 100px;
    height: 100px;

    background-color: slategray;
  }

  .port {
    width: 10px;
    height: 10px;

    background-color: limegreen;
    border: 1px solid gray;
    border-radius: 10px;
  }
</style>
