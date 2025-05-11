<script lang="ts">
  import { usePort } from "$lib/index.js";
  const port = usePort();
</script>

<div use:port></div>

<style>
  div {
    width: 10px;
    height: 10px;

    background-color: limegreen;
    border: 1px solid gray;
    border-radius: 10px;
  }
</style>
