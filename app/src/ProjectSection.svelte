<script>
  import UseBootstrapTag from 'https://cdn.jsdelivr.net/npm/use-bootstrap-tag@2.2.0/+esm';
  import { intlFormatDistance } from './lib/util.js';

  import ErrorBox from './ErrorBox.svelte';
  import UserChip from './UserChip.svelte';

  export let ums_url;
 
  export let proj;
  export let client;
  export let username;
  export let editing;

  function user_is_owner() {
     return username && proj.owners.includes(username);
  }

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  let owner_tags;

  function setupOwnersInput(owners_input) {
    owner_tags = UseBootstrapTag(owners_input);
    owner_tags.addValue(proj.owners);

    // TODO: make autocomplete look like Discourse's, with avatars
    // FIXME: Enter doesn't create chip

    const inner_input = owners_input.parentNode.querySelector('.input-wrapper input');
    inner_input.id = 'newowner';
    inner_input.name = 'newowner';

    const ac = document.createElement('auto-complete');
    ac.id = 'newownerauto';
    ac.resultdata = 'users';
    ac.resultname = 'username';
    ac.querymin = 2;
    ac.optionmax = 100;
    ac.inputdelay = 200;

    const par = inner_input.parentNode;
    ac.appendChild(inner_input);
    par.appendChild(ac);

    // TODO: prevent removal of last owner
    // TODO: prevent addition of duplicate owners

    // auto-complete element must be in the DOM when its api is updated,
    // and setting it directly doesn't work; setAttribute must be used.
    ac.setAttribute(
      'api',
      `${ums_url}/users?term=\${newowner}&include_groups=false&limit=6`
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
    const cur_owners = new Set(owner_tags.getValues());
    const prev_owners = new Set(proj.owners);
    const to_add = [...[...cur_owners.values()].filter((u) => !prev_owners.has(u))];
    const to_remove = [...[...prev_owners.values()].filter((u) => !cur_owners.has(u))];

    try {
      if (to_add) {
        await client.addOwners(to_add);
      }

      if (to_remove) {
        await client.removeOwners(to_remove);
      }
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
<div class="my-2 pb-2">
  <h2>
    <svg class="svg-icon"><use xlink:href="#person-digging"></use></svg>
    Project
    <button class="edit_button" class:is_editable={!editing && user_is_owner()}  type="button" on:click={startEdit}>
      <svg class="svg-icon edit_icon"><use xlink:href="#pencil"></use></svg>
    </button>
  </h2>
{#if edit}
  <div class="container">
    <div class="row">
      <form action="" on:submit|preventDefault={submitEdit}>
        <input type="text" class="form-control" use:setupOwnersInput>
<!--
        <auto-complete id="newownerauto" api="{GL_BASE}/u/search/users?term=${newowner}&include_groups=false&limit=6" resultdata="users" resultname="username" querymin="2" optionmax="100" inputdelay="200">
          <input class="form-control" type="text" id="newowner" name="newowner">
        </auto-complete>
-->
        <button type="submit" class="btn btn-primary"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
        <button type="button" class="btn btn-primary" on:click={cancelEdit}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
      </form>
    </div>
  </div>
{:else}
  {@const now = new Date()}
  <div>
    <div class="px-3 pt-2 pb-2 border rounded d-flex flex-wrap gap-2">
      <div>
        <div class="d-flex align-items-center gap-1">
          <svg class="svg-icon"><use xlink:href="#id-badge"></use></svg>
          {proj.name}
        </div>
        <div class="d-flex align-items-center gap-1">
          <div>
            <svg class="svg-icon"><use xlink:href="#user"></use></svg>
            Owners
          </div>
          <ul class="d-flex flex-wrap list-unstyled m-0 gap-1">
          {#each proj.owners as owner}
            <li><UserChip {ums_url} username={owner} size=24 /></li>
          {/each}
          </ul>
        </div>
      </div>
      <div class="ms-auto">
        <div>
          <time datetime={proj.modified_at} title={proj.modified_at}>
            <svg class="svg-icon"><use xlink:href="#arrows-rotate"></use></svg>
            Updated {intlFormatDistance(rtf, new Date(proj.modified_at), now)}
          </time>
        </div>
        <div>
          <time datetime={proj.created_at} title={proj.created_at}>
            <svg class="svg-icon"><use xlink:href="#star"></use></svg>
            Created {intlFormatDistance(rtf, new Date(proj.created_at), now)}
          </time>
        </div>
      </div>
    </div>
  </div>
{/if}
</div>
