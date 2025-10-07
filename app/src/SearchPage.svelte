<script>
  import { fetchJSON } from './lib/client.js';
  import { cleanupSearch, makeRequestURL } from './lib/search.js';

  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import SearchPageGuts from './SearchPageGuts.svelte';

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

  let error = $state(null);
  let meta = $state(null);
  let projects = $state(null);

  function unpackParams(params) {
    const q = params.get('q');
    const publisher = params.get('publisher');
    const year = params.get('year');
    const tags = params.getAll('tag');
    const owners = params.getAll('owner');
    const players = params.getAll('player');

    // default query sort is relevance, otherwise title
    const sort_by = params.get('sort_by') ?? (!!q ? 'r' : 't');

    return [sort_by, q, publisher, year, tags, owners, players];
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

  function loadProjects(url) {
     fetchJSON(url)
      .then((result) => ({ projects, meta } = result))
      .catch((err) => error = err);
  }

  function submitSearch(event) {
    event.preventDefault();
    event.stopPropagation();

    const fdata = new FormData(event.target);

    const url = new URL(window.location);
    url.search = "";

    for (const [k, v] of fdata.entries()) {
      if (v !== '') {
        url.searchParams.set(k, v);
      }
    }

    window.location.assign(url);
  } 

  if (window.location.search !== "") {
    loadProjects(makeRequestURL(gls_url, params, limit));
  }
</script>

<style>

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

<nav>
  <form action="" onformdata={cleanupSearch} onsubmit={submitSearch}>
    <div class="row">
      <div class="col">
        <label for="title_input" class="form-label">Title</label>
        <input id="title_input" class="form-control" type="text" name="q" value={query} />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="publisher_input" class="form-label">Publisher</label>
        <input id="publisher_input" class="form-control" type="text" name="publisher" value={publisher} />
      </div>
      <div class="col">
        <label for="year_input" class="form-label">Year</label>
        <input id="year_input" class="form-control" type="text" name="year" value={year} />
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        <label for="length_min_input" class="form-label">Length</label>
        <div class="row">
          <div class="col">
            <input id="length_min_input" class="form-control" type="text" />
          </div>
            to
          <div class="col">
            <input id="length_max_input" class="form-control" type="text" />
          </div>
        </div>
      </div>
      <div class="col-6">
        <label for="players_min_input" class="form-label">Number of players</label>
        <div class="row">
          <div class="col">
            <input id="players_min_input" class="form-control" type="text" />
          </div>
            to
          <div class="col">
            <input id="players_max_input" class="form-control" type="text" />
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="tags_input" class="form-label">Tags</label>
        <input id="tags_input" class="form-control" type="text" name="tag" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="owners_input" class="form-label">Project owners</label>
        <input id="owners_input" class="form-control" type="text" name="owner" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="players_input" class="form-label">Players</label>
        <input id="players_input" class="form-control" type="text" name="player" />
      </div>
    </div>
    <button type="submit" aria-label="Search" class="btn btn-primary"><svg class="svg-icon"><use xlink:href="#magnifying-glass"></use></svg> Search</button>
  </form>
</nav>

<SearchPageGuts {base_url} {gls_url} {sort_by} relevance={!!query} {limit} {loadProjects} bind:error={error} bind:meta={meta} bind:projects={projects} /> 
</main>

<div class="svg-sprites">
  <div class="fontawesome">
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="magnifying-glass" viewBox="0 0 640 640">
        <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->        <path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/>
      </symbol>
    </svg>
  </div>
</div>

<Footer/>
