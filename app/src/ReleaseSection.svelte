<script>
  import FileSection from './FileSection.svelte';

  export let ums_url;

  export let release;
  export let current = false;
</script>

<style>
/* Release pills */

.current_release {
  background-color: #008800;
}

.release {
  background-color: #bbbbbb;
}
</style>

<div class="badge rounded-pill fs-5" class:current_release={current} class:release={!current}>{release.version}</div>
{#if release.files.length > 0}
<ul class="list-unstyled">
  {#each release.files as file}
  <li class="mb-2">
    <FileSection {file} {ums_url} />
  </li>
  {/each}
</ul>
{/if}
