<script>
  export let current_version;
  export let news_link;
  export let base_url;
  export let user_info;
  export let project;
  export let gls_url;
  export let discourse_url;
  export let ums_url;
  export let returnto;

  import Client from '../public/gl/js/client.js';

  import Header from './Header.svelte';
  import ErrorBox from './ErrorBox.svelte';
  import GameSection from './GameSection.svelte';
  import ProjectSection from './ProjectSection.svelte';
  import PackagesSection from './PackagesSection.svelte';
  import ReadmeSection from './ReadmeSection.svelte';
  import GallerySection from './GallerySection.svelte';
  import PlayersSection from './PlayersSection.svelte';
  
  const client = new Client(gls_url, project);

  let proj = null;
  let proj_error = null;

  client.getProject()
    .then((p) => proj = p)
    .catch((err) => proj_error = err);

  let players = null;
  let players_error = null;

  client.getPlayers()
    .then((p) => players = p)
    .catch((err) => players_error = err);

  let editing = false;

</script>

<style>

/* Edit icons */

#project_content :global(.is_editable) {
  visibility: visible !important;
}

#project_content :global(.edit_button) {
  background: none;
  border: none;
  padding: 0;
  visibility: hidden;
}

#project_content :global(.edit_icon) {
  width: 0.75em;
  height: 0.75em;
  fill: #bbbbbb;
  vertical-align: 0;
}

#project_content :global(.edit_icon:hover) {
  fill: var(--bs-link-hover-color);
}

</style>

<svelte:head>
  {#if proj}
  <title>{proj.game.title} - Module Library - Vassal</title>
  {:else}
  <title>Module Library - Vassal</title>
  {/if}
</svelte:head>

<Header {base_url} {user_info} {discourse_url} {ums_url} {returnto} {current_version} {news_link} />

<main class="container px-5 mb-5">

<nav class="d-flex flex-wrap align-items-center my-3">
  <div class="d-lg-block d-none w-25"></div>
  <form class="mx-md-2 my-1 flex-grow-1" action="{base_url}/projects">
    <input class="form-control" id="search" type="search" name="q" placeholder="Search...">
  </form>
  <div class="w-100 d-md-none"></div>
  <div class="ms-auto mx-1 my-1 pe-0">
    <a href="{base_url}/projects">Browse All Projects</a>
  </div>
</nav>

<div id="project_content">
  {#if proj_error}
  <ErrorBox error={proj_error} />
  {/if}
  {#if proj}
  <GameSection bind:proj={proj} {client} username={user_info?.username} bind:editing={editing} />
  <ProjectSection bind:proj={proj} {client} username={user_info?.username} {ums_url} bind:editing={editing} />
  <PackagesSection bind:proj={proj} {client} username={user_info?.username} {ums_url} bind:editing={editing} />
  <ReadmeSection bind:proj={proj} {client} username={user_info?.username} bind:editing={editing} />
  <GallerySection bind:proj={proj} {client} username={user_info?.username} bind:editing={editing} />
  {/if}
</div>

<!-- TODO: limit text field length -->

{#if players_error}
<ErrorBox error={players_error} />
{/if}
{#if players !== null}
<PlayersSection players={players} client={client} username={user_info?.username} ums_url={ums_url} bind:editing={editing} />
{/if}

  {#if user_info}
    <button id="flag_button" type="button" class="btn bg-secondary-subtle p-1 mx-1 rounded-0"><svg class="svg-icon"><use xlink:href="#flag"></use></svg> Flag</button>
  {/if}

</main>
