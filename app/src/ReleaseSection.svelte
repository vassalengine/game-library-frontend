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

<li class="d-flex flex-wrap align-items-center p-1 my-2 gap-2">
  <div class="badge rounded-pill fs-5" class:current_release={current} class:release={!current}>{release.version}</div>
  {#if release.files.length > 0}
  <li class="">
    {#each release.files as file}
    <FileSection {file} {ums_url} />
    {/each}
  </li>
  {/if}
</li>
