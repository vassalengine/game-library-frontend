<script>
  import FileSection from './FileSection.svelte';

  export let ums_url;

  export let release;
  export let current = false;

  function extPriority(filename) {
    if (filename.endsWith('.vmod')) {
      return 0;
    }
    else if (filename.endsWith('.vext')) {
      return 1;
    }
    else if (filename.endsWith('.vsav')) {
      return 2;
    }
    else {
      return 3;
    }
  }

  function sortFiles(files) {
    files.sort((a, b) => {
      return (extPriority(a.filename) - extPriority(b.filename)) ||
        a.filename.localeCompare(b.filename);
    });
    return files;
  }
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
  {#each sortFiles(release.files) as file}
  <li class="mb-2">
    <FileSection {file} {ums_url} />
  </li>
  {/each}
</ul>
{/if}
