<script>
  export let current_version;
  export let news_link;
  export let base_url;
  export let user_info;
  export let gls_url;
  export let discourse_url;
  export let ums_url;
  export let returnto;
  export let limit;

  import { makeRequestURL, unpackParams } from './lib/params.js';
  import { fetchJSON } from './lib/client.js';

  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import ErrorBox from './ErrorBox.svelte';
  import ProjectListItem from './ProjectListItem.svelte';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const now = new Date();

  const params = new URLSearchParams(window.location.search);
 
  let unpacked;
  try { 
    unpacked = unpackParams(params);
  }
  catch (err) {
    // Invalid params, go back to start
    window.location.replace(window.location.origin + window.location.pathname);
  }

  const [sort, query, state] = unpacked;

  let error = null;
  let meta = null;
  let projects = null;

  function normalizeWhitespace(s) {
    return s.split(/\s+/).filter(s => s.length > 0).join(' ');
  }

  function cleanupSearch(event) {
    event.formData.set('q', normalizeWhitespace(event.formData.get('q')));
  }

  function loadProjects(url) {
     fetchJSON(url)
      .then((result) => ( { projects, meta } = result ))
      .catch((err) => error = err);
  }

  function updateSort(event) {
    const url = new URL(window.location);

    // clear seek, from, s
    url.searchParams.delete('seek');
    url.searchParams.delete('from');
    url.searchParams.delete('s');

    if (query !== null) {
      url.searchParams.set('q', query);
    }

    url.searchParams.set('sort', event.target.value);

    // update page instead of reloading
    loadProjects(makeRequestURL(gls_url, url.searchParams, limit));
    window.history.replaceState(null, '', url.toString());
  }

  loadProjects(makeRequestURL(gls_url, params, limit));
</script>

<style>

/* Alphabetical index */

#index ol {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0;
  margin: 0 auto;
  gap: 0.4em;
}

#index li {
  list-style: none;
  white-space: nowrap;
}

@media only screen and (max-width:767px) {
  #index ol {
    max-width: 15em;
  }
}

</style>

<svelte:head>
  {#if query === null}
  <title>Module Library - Vassal</title>
  {:else}
  <title>Search Results for {query} - Module Library - Vassal</title>
  {/if}
</svelte:head>

<Header {base_url} {user_info} {discourse_url} {ums_url} {returnto} {current_version} {news_link} />

<main class="container px-5 mb-5">

<nav class="d-flex flex-wrap align-items-center my-3">
  <form class="mx-md-2 my-1 flex-grow-1 order-md-1" action="{base_url}/projects" on:formdata={cleanupSearch}>
    <input class="form-control" type="search" name="q" placeholder="Search..." value={query} required>
  </form>
  <div class="w-100 d-md-none"></div>
{#if projects}
  <div class="small me-auto mx-1 my-1 order-md-0">
<!-- TODO: Is there some way to provide a range for the count? -->
    <span class="text-muted">Displaying</span>
    <b>{Math.min(params.get('limit') ?? limit, meta.total)}</b>
    <span class="text-muted">of</span>
    <b>{meta.total}</b>
    <span class="text-muted">{params.has('q') ? "search result" : "module"}{meta.total === 1 ? "" : "s"}</span>
  </div>
{/if}
  <div class="ms-auto mx-1 my-1 pe-0 order-md-2">
    <a href="{base_url}/projects">Browse All Projects</a>
  </div>
</nav>

<div class="my-1 p-3 bg-light rounded">
  <h1 class="m-0">
  {#if query === null}
  All Modules
  {:else}
  Search Results <small>for '{query}'</small>
  {/if}
  </h1>
</div>

{#if query === null}
<nav id="index" class="my-2">
  <ol>
    <li><a href="?sort=t">0–9</a></li>
    <li><a href="?sort=t&from=A">A</a></li>
    <li><a href="?sort=t&from=B">B</a></li>
    <li><a href="?sort=t&from=C">C</a></li>
    <li><a href="?sort=t&from=D">D</a></li>
    <li><a href="?sort=t&from=E">E</a></li>
    <li><a href="?sort=t&from=F">F</a></li>
    <li><a href="?sort=t&from=G">G</a></li>
    <li><a href="?sort=t&from=H">H</a></li>
    <li><a href="?sort=t&from=I">I</a></li>
    <li><a href="?sort=t&from=J">J</a></li>
    <li><a href="?sort=t&from=K">K</a></li>
    <li><a href="?sort=t&from=L">L</a></li>
    <li><a href="?sort=t&from=M">M</a></li>
    <li><a href="?sort=t&from=N">N</a></li>
    <li><a href="?sort=t&from=O">O</a></li>
    <li><a href="?sort=t&from=P">P</a></li>
    <li><a href="?sort=t&from=Q">Q</a></li>
    <li><a href="?sort=t&from=R">R</a></li>
    <li><a href="?sort=t&from=S">S</a></li>
    <li><a href="?sort=t&from=T">T</a></li>
    <li><a href="?sort=t&from=U">U</a></li>
    <li><a href="?sort=t&from=V">V</a></li>
    <li><a href="?sort=t&from=W">W</a></li>
    <li><a href="?sort=t&from=X">X</a></li>
    <li><a href="?sort=t&from=Y">Y</a></li>
    <li><a href="?sort=t&from=Z">Z</a></li>
  </ol>
</nav>
{/if}

<div class="container mx-0 my-2">
  <div class="row">
    <div class="col-auto ms-auto pe-0">
      <label for="sort_selector">Sort by</label>
      <select name="sort" id="sort_selector" value={sort} on:change={updateSort}>
        {#if query !== null}
        <option value="r">Relevance</option>
        {/if}
        <option value="t">Alphabetical</option>
        <option value="m">Recent Updates</option>
        <option value="c">Newly Added</option>
      </select>
    </div>
  </div>
</div>

{#if error}
<ErrorBox {error} />
{/if}

<ol class="list-unstyled m-0 p-0">
{#if projects}
  {#each projects as proj}
  <ProjectListItem {base_url} {proj} {rtf} {now} />
  {/each}
{/if}
</ol>

<nav class="d-flex mt-3 align-items-center justify-content-center">
  <a class="mx-2" title="previous page" href={state && meta?.prev_page ? `${meta.prev_page}&s=${state}` : ''} style:visibility={meta?.prev_page ? 'visible' : 'hidden'}><svg width="29" height="29" viewBox="0 0 29 29" xmlns="http://www.w3.org/2000/svg"><circle fill="#D6D6D5" cx="14.5" cy="14.5" r="14.5"></circle><path fill="#FFF" d="M14.5 19v-3h5v-3h-5v-3L9 14.5z"></path></svg></a>

  <a class="mx-2" title="next page" href={state && meta?.next_page ? `${meta.next_page}&s=${state}` : ''} style:visibility={meta?.next_page ? 'visible' : 'hidden'}><svg width="29" height="29" viewBox="0 0 29 29" xmlns="http://www.w3.org/2000/svg"><circle fill="#D6D6D5" cx="14.5" cy="14.5" r="14.5"></circle><path fill="#FFF" d="M15 19v-3h-5v-3h5v-3l5.5 4.5z"></path></svg></a>
</nav>

</main>

<Footer/>
