<script>
  import { getCookie } from '../public/gl/js/util.js';

  import ReleaseSection from './ReleaseSection.svelte';

  export let ums_url;

  export let proj;
  export let pkg;
  export let client;
  export let username;
  export let editing;

  function user_is_owner() {
     return username && proj.owners.includes(username);
  }

  //
  // edit mode
  //

  let edit = false;

  function startEdit(event) {
    edit = true;
    editing = true;
  }

  function cancelEdit(event) {
    edit = false;
    editing = false;
  }

  async function submitEdit(event) {
    edit = false;
    editing = false;
  }

  function startRelease(event) {
    edit = true;
    editing = true;
  }

  function cancelRelease(event) {
    edit = false;
    editing = false;
  }

  async function submitRelease(event) {
    const fdata = new FormData(event.target);

    console.log(fdata);
    // TODO
    const release_file = fdata.get('release_file');

    try {
      await client.addRelease(
        '13_Days_Official',
        '1.0.1',
        release_file,
        release_file.type,
        getCookie('token')
      );
    }
    catch (error) {
  // TODO: error box
  //      handleErrorBefore(error, 'game_section_form');
      console.log(error);
      return;
    }

    edit = false;
    editing = false;
  }
</script>

<style>
/* Release accordion */

summary {
  list-style: none;
  display: flex;
  align-items: center;
}

summary::before {
  content: '';
  width: 1em;
  height: 0.5em;
  background: url('../public/gl/images/chevron-down.svg');
  background-size: cover;
  margin-right: 0.5em;
  transition: 0.2s;
}

details[open] > summary::before {
  transform: rotate(180deg);
}
</style>

<div class="border rounded p-3 my-2">
  <h3>
    <svg class="svg-icon"><use xlink:href="#cube"></use></svg>
    {pkg.name}
    <button class="edit_button" class:is_editable={!editing && user_is_owner()} type="button" on:click={startRelease}>
      <svg class="svg-icon edit_icon"><use xlink:href="#plus"></use></svg>
    </button>
  </h3>
  <div>{pkg.description}</div>
  <ol class="list-unstyled">
    {#if edit}
    <li class="release_tmpl_top border rounded p-3 my-2">
      <form action="" on:submit|preventDefault={submitRelease}>
        <input id="release_file_input" class="release_tmpl_name form-control" type="file" name="release_file" required>
        <button class="btn btn-primary p-1 mx-1 rounded-0" type="submit"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
        <button class="btn btn-primary p-1 mx-1 rounded-0" type="button" on:click={cancelRelease}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
      </form>
    </li>
    {/if}
    {#if pkg.releases.length > 0}
    <li class="d-flex flex-wrap align-items-start p-1 my-2 gap-2">
      <ReleaseSection release={pkg.releases[0]} current {ums_url} />
    </li>
    {/if}  
  </ol>
  {#if pkg.releases.length > 1}
  <details>
    <summary>Older releases...</summary>
    <ol class="list-unstyled">
      {#each pkg.releases.slice(1) as release}
      <li class="d-flex flex-wrap align-items-start p-1 my-2 gap-2">
        <ReleaseSection {release} {ums_url} />
      </li>
      {/each}
    </ol>
  </details>
  {/if}
</div>
