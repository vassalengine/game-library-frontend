<script>

  export let current_version;
  export let news_link;
  export let base_url;
  export let user_info;
  export let gls_url;
  export let discourse_url;
  export let ums_url;
  export let returnto;

  import { getCookie } from './lib/util.js';

  import Client from './lib/client.js';

  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import ErrorBox from './ErrorBox.svelte';

  import UserChip from './UserChip.svelte';

  const client = new Client(
    gls_url,
    ums_url,
    null,
    getCookie('token'),
    getCookie('refresh')
  );

  let flags = null;
  let error = null;

  client.getFlags()
    .then((f) => flags = f.flags)
    .catch((err) => error = err); 

</script>

<svelte:head>
  <title>Module Library - Vassal</title>
</svelte:head>

<Header {base_url} {user_info} {discourse_url} {ums_url} {returnto} {current_version} {news_link} />

<main class="container px-5 mb-5">
  {#if error}
  <ErrorBox error={error} />
  {/if}
  
  <table>
    <tbody>
    {#if flags !== null}
    {#each flags as flag}
      <tr>
        <td><a href="{base_url}/projects/{flag.project}">{flag.project}</a></td>
        <td>{flag.flag}</td>
        <td><UserChip {ums_url} username={flag.flagged_by} size=24 /></td>
        <td>{flag.flagged_at}</td>
        <td>{flag.message ?? ""}</td>
      </tr>
    {/each}
    {/if}
    </tbody>
  </table>
</main>

<Footer/>
