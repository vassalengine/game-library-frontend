<script>
  import ErrorBox from './ErrorBox.svelte';
  import PackageSection from './PackageSection.svelte';

  export let ums_url;

  export let proj;
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
  let error = null;

  let pkg_names;
  let pkg_sort_keys;

  function startEdit(event) {
    edit = true;
    editing = true;

    pkg_names = new Set(proj.packages.map((p) => p.name));
    pkg_sort_keys = new Set(proj.packages.map((p) => p.sort_key));
  }

  function cancelEdit(event) {
    edit = false;
    editing = false;
    error = null;
  }

  async function submitEdit(event) {
    const fd = new FormData(event.target);

    const pkg = fd.get('package_name');
    const data = {
      'sort_key': fd.get('sort_key'),
      'description': ''
    };

    try {
      await client.addPackage(pkg, data);
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

  function validatePackageName(event) {
    event.target.setCustomValidity(
      pkg_names.has(event.target.value) ?
        "Package already exists" : ""
    );
  }

  function validatePackageSortKey(event) {
    let message = "";

    const sk = parseInt(event.target.value);
    if (Number.isNaN(sk)) {
      message = "Sort key is not an integer";
    }

    if (pkg_sort_keys.has(sk)) {
      message = "Sort key already exists";
    }

    event.target.setCustomValidity(message);
  }
</script>

{#if error}
<ErrorBox {error} />
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
        <label for="sort_key_input" class="form-label">Package sort key</label>
        <input id="sort_key_input" type="number" min="-9223372036854775808" max="9223372036854775807" step="1" name="sort_key" class="package_tmpl_name form-control" required on:input={validatePackageSortKey}>
        <button class="btn btn-primary p-1 mx-1 rounded-0" type="submit"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
        <button class="btn btn-primary p-1 mx-1 rounded-0" type="button" on:click={cancelEdit}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
      </form>
    </div>
  {/if}
  {#each proj.packages as pkg}
    <PackageSection bind:proj={proj} {pkg} {client} {username} {ums_url} bind:editing={editing} />
  {/each}
  </div>
</div>
