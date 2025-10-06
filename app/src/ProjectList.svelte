<script>
  import ProjectListItem from './ProjectListItem.svelte';
 
  let {
    base_url,
    projects
  } = $props();

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();

</script>

{#if projects}
<ol id="projects_list" class="list-unstyled m-0 p-0">
  {#each projects as proj}
  <ProjectListItem {base_url} {proj} {rtf} {now} />
  {/each}
</ol>
{/if}
