<script>
  import ErrorBox from './ErrorBox.svelte';
  import PackageSection from './PackageSection.svelte';
  import PackageEditor from './PackageEditor.svelte';

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

  function startEdit(event) {
    edit = true;
    editing = true;
  }

  function cancelEdit(event) {
    edit = false;
    editing = false;
    error = null;
  }

  function slug_for(s) {
    // percent-encode non-ascii
    return encodeURIComponent(
      // replace whitespace with hyphens
      s.replaceAll(/\s/, '-')
        // remove all special characters
        .replaceAll(/[:\/?#\[\]@!$&'()*+,;=%"<>\\^`{}|]/, '')
        // coalesce consecutive hyphens
        .replaceAll(/-+/, '-')
    )
    // remove leading and trailing hyphens
    .replaceAll(/^-+|-+$/, '');
  }

  async function submitEdit(event) {
    const fd = new FormData(event.target);

    const name = fd.get('package_name')?.trim();
    const slug = slug_for(name);

    const data = {
      'name': name,
      'sort_key': Number(fd.get('sort_key')),
      'description': ''
    };

    try {
      await client.addPackage(slug, data);
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
        <PackageEditor packages={proj.packages} />
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
