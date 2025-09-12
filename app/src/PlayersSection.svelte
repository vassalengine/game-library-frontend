<script>
  import ErrorBox from './ErrorBox.svelte';
  import UserChip from './UserChip.svelte';

  export let ums_url;

  export let players;
  export let client;
  export let username;
  export let editing;

  let error = null;

  async function addPlayer(event) {
    try {
      await client.addPlayer();
      error = null;
    }
    catch (err) {
      error = err;
      return;
    }

    players.users.push(username);
    players = players;
  } 

  async function removePlayer(event) {
    try {
      await client.removePlayer();
      error = null;
    }
    catch (err) {
      errror = err;
      return;
    }

    players.users.splice(players.users.indexOf(username), 1);
    players = players;
  }
</script>

{#if error}
<ErrorBox {error} />
{/if}
<div>
  <h2>
    <svg class="svg-icon"><use xlink:href="#user-group"></use></svg>
    Players
    {#if !editing && username}
      {#if players.users.includes(username)}
    <button class="btn btn-primary p-1 mx-1 rounded-0" type="button" aria-label="Remove" on:click={removePlayer}><svg class="svg-icon"><use xlink:href="#user-minus"></use></svg></button>
      {:else}
    <button class="btn btn-primary p-1 mx-1 rounded-0" type="button" aria-label="Add" on:click={addPlayer}><svg class="svg-icon"><use xlink:href="#user-plus"></use></svg></button>
      {/if}
    {/if}
  </h2>
  <ul class="d-flex flex-wrap list-unstyled gap-1">
  {#each players.users as username}
    <li><UserChip {ums_url} {username} size=24 /></li>
  {/each}
  </ul>
</div>

