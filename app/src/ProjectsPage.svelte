<script>
  import { fetchJSON } from './lib/client.js';

  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import Search from './Search.svelte';
  import ErrorBox from './ErrorBox.svelte';
  import ProjectList from './ProjectList.svelte';

  let {
    current_version,
    news_link,
    base_url,
    user_info,
    gls_url,
    discourse_url,
    ums_url,
    returnto,
    limit
  } = $props();

  function unpackParams(params) {
    const query = params.get('q');
    const publisher = params.get('publisher');
    const year = params.get('year');
    const tags = params.getAll('tag');
    const owners = params.getAll('owner');
    const players = params.getAll('player');

    // default query sort is relevance, otherwise title
    const sort_by = params.get('sort_by') ?? (query !== null ? 'r' : 't');

    return [sort_by, query, publisher, year, tags, owners, players];
  }

  function makeRequestURL(api_url, params, limit) {
    // Construct API request
    const req_url = new URL(`${api_url}/projects`);

    for (const [k, v] of params.entries()) {
      req_url.searchParams.append(k, v);
    }

    if (!req_url.searchParams.has('limit')) {
      req_url.searchParams.set('limit', limit);
    }

    return req_url;
  }

  const params = new URLSearchParams(window.location.search);
  const [
    sort_by,
    query,
    publisher,
    year,
    tags,
    owners,
    players
  ] = unpackParams(params);

  let error = $state(null);
  let meta = $state(null);
  let projects = $state(null);

  function loadProjects(url) {
     fetchJSON(url)
      .then((result) => ({ projects, meta } = result))
      .catch((err) => error = err);
  }

  function updateSort(event) {
    const url = new URL(window.location);

    // clear sort_by, from
    url.searchParams.delete('sort_by');
    url.searchParams.delete('from');

    if (query !== null) {
      url.searchParams.set('q', query);
    }

    url.searchParams.set('sort_by', event.target.value);

    // update page instead of reloading
    loadProjects(makeRequestURL(gls_url, url.searchParams, limit));
    window.history.replaceState(null, '', url.toString());
  }

  function handleIntersect(entries) {
    if (!entries[0].isIntersecting) {
      return;
    }

    if (!meta.next_page) {
      return;
    }

    const target = entries[0].target;

    observer.unobserve(target);

    const page = meta.next_page;
    const projects_list = document.getElementById('projects_list');

    const s_query = page.substring(1);
    const s_params = new URLSearchParams(s_query);
    const s_url = makeRequestURL(gls_url, s_params, limit);

    fetchJSON(s_url)
        .then((result) => {
          meta.next_page = result.meta.next_page;
          // must reassign to projects so it works reactively
          projects = projects.concat(result.projects);
        })
        .then(() => observer.observe(target))
        .catch((err) => error = err);
  }

  const observer = new IntersectionObserver(handleIntersect);
  const watchScroll = (el) => observer.observe(el);

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

{#snippet search_msg()}
  {#if projects}
  <div class="small me-auto mx-1 my-1 order-md-0">
<!-- TODO: Is there some way to provide a range for the count? -->
    <span class="text-muted">Displaying</span>
    <b>{projects.length}</b>
    <span class="text-muted">of</span>
    <b>{meta.total}</b>
    <span class="text-muted">{params.has('q') ? "search result" : "module"}{meta.total === 1 ? "" : "s"}</span>
  </div>
  {:else}
  <div class="d-lg-block d-none w-25 order-md-0"></div>
  {/if}
{/snippet}

<Search {base_url} {query} message={search_msg} />

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
    <li><a href="?sort_by=t">0–9</a></li>
    <li><a href="?sort_by=t&from=A">A</a></li>
    <li><a href="?sort_by=t&from=B">B</a></li>
    <li><a href="?sort_by=t&from=C">C</a></li>
    <li><a href="?sort_by=t&from=D">D</a></li>
    <li><a href="?sort_by=t&from=E">E</a></li>
    <li><a href="?sort_by=t&from=F">F</a></li>
    <li><a href="?sort_by=t&from=G">G</a></li>
    <li><a href="?sort_by=t&from=H">H</a></li>
    <li><a href="?sort_by=t&from=I">I</a></li>
    <li><a href="?sort_by=t&from=J">J</a></li>
    <li><a href="?sort_by=t&from=K">K</a></li>
    <li><a href="?sort_by=t&from=L">L</a></li>
    <li><a href="?sort_by=t&from=M">M</a></li>
    <li><a href="?sort_by=t&from=N">N</a></li>
    <li><a href="?sort_by=t&from=O">O</a></li>
    <li><a href="?sort_by=t&from=P">P</a></li>
    <li><a href="?sort_by=t&from=Q">Q</a></li>
    <li><a href="?sort_by=t&from=R">R</a></li>
    <li><a href="?sort_by=t&from=S">S</a></li>
    <li><a href="?sort_by=t&from=T">T</a></li>
    <li><a href="?sort_by=t&from=U">U</a></li>
    <li><a href="?sort_by=t&from=V">V</a></li>
    <li><a href="?sort_by=t&from=W">W</a></li>
    <li><a href="?sort_by=t&from=X">X</a></li>
    <li><a href="?sort_by=t&from=Y">Y</a></li>
    <li><a href="?sort_by=t&from=Z">Z</a></li>
  </ol>
</nav>
{/if}

<div class="container mx-0 my-2">
  <div class="row">
    <div class="col-auto ms-auto pe-0">
      <label for="sort_selector">Sort by</label>
      <select name="sort_by" id="sort_selector" value={sort_by} onchange={updateSort}>
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

{#if projects}
<ProjectList {base_url} {projects} />
<div {@attach watchScroll} id="scroll_forward" class="infinite-scroll"></div>
{/if}

</main>

<Footer/>
