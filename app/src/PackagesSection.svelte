<script>
  import { getCookie } from '../public/gl/js/util.js';

  import ErrorBox from './ErrorBox.svelte';
  import PackageSection from './PackageSection.svelte';

  export let UMS_URL;

  export let proj;
  export let client;
  export let username;
  export let editing;

  function user_is_owner() {
     return username && proj.owners.includes(username);
  }

  let pkg_names = new Set(proj.packages.map((p) => p.name));

  function validatePackageName(event) {
    event.target.setCustomValidity(
      pkg_names.has(event.target.value) ?
        "Package already exists" : ""
    );
  }

  //
  // edit mode
  //

  let edit = false;
  let error = null;

  function startEdit(event) {
    edit = true;
    editing = true;
  }

  function cancelEdit(event) {
    edit = false;
    editing = false;
    error = null;
  }

  async function submitEdit(event) {
    const pkg = new FormData(event.target).get('package_name');
    try {
      await client.addPackage(pkg, getCookie('token'));
      error = null;
    }
    catch (err) {
      error = err;
      return;
    }

    // update the project data
    try {
      proj = await client.getProject();
      error = null;
    }
    catch (err) {
      error = err;
      return;
    }

    edit = false;
    editing = false;
  }

</script>

{#if error}
<ErrorBox error={error} />
{/if}
<div>
  <h2>
    <svg class="svg-icon"><use xlink:href="#cubes"></use></svg>
    Packages
    <button class="edit_button" class:is_editable={!editing && user_is_owner()} type="button" on:click={startEdit}>
      <svg class="svg-icon edit_icon"><use xlink:href="#plus"></use></svg>
    </button>
  </h2>
  <div>
  {#if edit}
    <div class="package_tmpl_top border rounded p-3 my-2">
      <form action="" on:submit|preventDefault={submitEdit}>
        <svg class="svg-icon"><use xlink:href="#cube"></use></svg>
        <label for="package_name_input" class="form-label">Package name</label>
        <input id="package_name_input" type="text" name="package_name" class="package_tmpl_name form-control" required on:input={validatePackageName}>
        <button class="btn btn-primary p-1 mx-1 rounded-0" type="submit"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
        <button class="btn btn-primary p-1 mx-1 rounded-0" type="button" on:click={cancelEdit}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
      </form>
    </div>
  {/if}
  {#each proj.packages as pkg}
    <PackageSection bind:proj={proj} pkg={pkg} client={client} username={username} UMS_URL={UMS_URL} bind:editing={editing} />
  {/each}
  </div>
</div>
