<script>
  import { fetchJSON } from './lib/client.js';
  import { cleanupSearch, makeRequestURL } from './lib/search.js';

  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import SearchPageGuts from './SearchPageGuts.svelte';
  import ChipInput from './ChipInput.svelte';

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

  let users_cache = $state(new Map());

  const params = new URLSearchParams(window.location.search);

  const q = params.get('q');
  const publisher = params.get('publisher');
  const year = params.get('year');
  const players_min = params.get('players_min');
  const players_max = params.get('players_max');
  const length_min = params.get('length_min');
  const length_max = params.get('length_max');
  const tags = params.getAll('tag');
  const owners = params.getAll('owner');
  const players = params.getAll('player');

  // default query sort is relevance, otherwise title
  const sort_by = params.get('sort_by') ?? (!!q ? 'r' : 't');

  let owners_select = $state([...owners]);
  let players_select = $state([...players]);

  async function fetchUsersStartingWith(prefix) {
    const url = new URL(`${ums_url}/users`);
    url.searchParams.append('term', prefix);
    url.searchParams.append('include_groups', false);
    url.searchParams.append('limit', 6);

    return (await fetchJSON(url)).users;
  }

  function userToText(u) {
    return u?.username;
  }

  function textToUser(u) {
    return { username: u };
  }

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
    url.search = '';

    for (const [k, v] of fdata.entries()) {
      if (v !== '') {
        url.searchParams.set(k, v);
      }
    }

    for (const u of owners_select) {
      url.searchParams.append('owner', u);
    }

    for (const u of players_select) {
      url.searchParams.append('player', u);
    }

    window.location.assign(url);
  }

  if (window.location.search !== '') {
    loadProjects(makeRequestURL(gls_url, params, limit));
  }
</script>

<style>

</style>

<svelte:head>
  {#if q === null}
  <title>Module Library - Vassal</title>
  {:else}
  <title>Search Results for {q} - Module Library - Vassal</title>
  {/if}
</svelte:head>

<Header {base_url} {user_info} {discourse_url} {ums_url} {returnto} {current_version} {news_link} />

<main class="container px-5 mb-5">

<!-- TODO: players needs to support exact and inclusive matches -->
<!-- TODO: restrict players, length to numbers -->
<!-- TODO: add chip selection for tags -->

<nav>
  <form action="" onformdata={cleanupSearch} onsubmit={submitSearch}>
    <div class="row">
      <div class="col">
        <label for="title_input" class="form-label">Full-text search</label>
        <input id="title_input" class="form-control" type="text" name="q" value={q} />
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
        <label for="players_min_input" class="form-label">Number of players</label>
        <div class="row">
          <div class="col">
            <input id="players_min_input" class="form-control" type="text" name="players_min" value={players_min}  />
          </div>
            to
          <div class="col">
            <input id="players_max_input" class="form-control" type="text" name="players_max" value={players_max} />
          </div>
        </div>
      </div>
      <div class="col-6">
        <label for="length_min_input" class="form-label">Length</label>
        <div class="row">
          <div class="col">
            <input id="length_min_input" class="form-control" type="text" name="length_min" value={length_min} />
          </div>
            to
          <div class="col">
            <input id="length_max_input" class="form-control" type="text" name="length_max" value={length_max} />
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
        <ChipInput fetchItemsFor={fetchUsersStartingWith} itemToText={userToText} textToItem={textToUser} bind:items={owners_select} bind:items_cache={users_cache} />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label for="players_input" class="form-label">Players</label>
        <ChipInput fetchItemsFor={fetchUsersStartingWith} itemToText={userToText} textToItem={textToUser} bind:items={players_select} bind:items_cache={users_cache} />
      </div>
    </div>
    <button type="submit" aria-label="Search" class="btn btn-primary"><svg class="svg-icon"><use xlink:href="#magnifying-glass"></use></svg> Search</button>
  </form>
</nav>

<SearchPageGuts {base_url} {gls_url} {sort_by} relevance={!!q} {limit} {loadProjects} bind:error={error} bind:meta={meta} bind:projects={projects} />
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
