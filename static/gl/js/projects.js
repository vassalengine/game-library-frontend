function bytesToBase64(bytes) {
  return btoa(String.fromCodePoint(...bytes));
}

function b64encode(s) {
  return bytesToBase64(new TextEncoder().encode(s))
    .replace(/={1,2}$/, '') // unpad
    .replace('+', '-')      // url-safe
    .replace('/', '_');
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (m) => m.codePointAt(0));
}

function b64decode(s) {
  s = s.replace('-', '+')  // un-url-safe
    .replace('_', '/') +
    Array((4 - s.length % 4) % 4 + 1).join('='); // repad
  return new TextDecoder().decode(base64ToBytes(s));
}

function setNavLink(meta, key, s) {
  let nav = meta[key + "_page"];
  if (nav !== null && s !== null) {
    nav += `&s=${s}`;
  }

  const nav_el = document.getElementById(key);
  nav_el.href = nav;
  if (nav === null) {
    nav_el.style.visibility = 'hidden';
  }
}

function fillProjectsList(data) {
  const proj_list = document.getElementById('projects');
  const itemTemplate = document.querySelector('#proj_item_tmpl');

  for (let p of data['projects']) {
    const item = document.importNode(itemTemplate.content, true);

    const a = item.querySelector('.proj_tmpl_link');
    const val = p['name'];
    a.textContent = val;
    a.href = `${window.location.pathname}/${val}`;

    const tdiv = item.querySelector('.proj_tmpl_title');
    tdiv.textContent = p['game']['title'];

    const ddiv = item.querySelector('.proj_tmpl_desc');
    ddiv.textContent = p['description'];

    proj_list.appendChild(item);
  }
}

async function populateTable() {
  const params = new URLSearchParams(window.location.search);

  const api = '{{ api_url }}';

  // Construct API request 
  const api_url = new URL(`${api}/projects');
  // Pass on only params the API knows
  for (const k of ['q', 'sort', 'order', 'from', 'seek', 'limit']) {
    const v = params.get(k);
    if (v !== null) {
      api_url.searchParams.set(k, v);
    }
  }

  // Call the GLS API
  const response = await fetch(api_url);

  // Unpack parameters
  let sort = null;
  let query = null;
  let s = params.get('s');

  // Local state parameter s
  //
  // s is set => retain s
  // sort is set => add sort to s
  // query is set => add query to s
  // nothing set => sort = t, query = null

  if (params.has('seek')) {
    if (s === null) {
      // Invalid: we should have s set; go back to start
      window.location.href = window.location.origin + window.location.pathname;
      return;
    }
    [sort, query] = b64decode(s)
      .split(',', 2)
      .map((e) => e === "" ? null : e);
  }
  else {
    query = params.get('q');
    // default query sort is relevance, otherwise title
    sort = params.get('sort') ?? (query !== null ? 'r' : 't');
  }

  if (s === null) {
    s = b64encode(`${sort ?? ""},${query ?? ""}`);
  }

  // Set page title and results header for All Modules or Search Results 
  const results_header = document.getElementById('results_header');
  if (query !== null) {
    results_header.textContent = 'Search Results ';
    const results_for = document.createElement('small');
    results_for.textContent = `for '${query}'`;
    results_header.appendChild(results_for);

    document.title = `Search Results for '${query}' - Module Library - Vassal`;
  }
  else {
    results_header.textContent = 'All Modules';
    document.title = 'Module Library - Vassal';
  }

  // Hide the alphabetical index for searches
  const index_list = document.getElementById('index');
  index_list.hidden = query !== null;

  // Keep the query in search input
  if (query !== null) {
    const search_input = document.getElementById('search');
    search_input.value = query;
  }

  // Display Relevance as a sort option only for searches
  const relevance_opt = document.getElementById('relevance_opt');
  relevance_opt.hidden = query === null;

  // Set sort selector to match current sort order
  const sort_selector = document.getElementById('sort_selector');
  sort_selector.value = sort;

  // Changes to sort selector redirect to new page
  sort_selector.addEventListener('change', (e) => {
    const url = new URL(window.location);

    // clear seek, from, s
    url.searchParams.delete('seek');
    url.searchParams.delete('from');
    url.searchParams.delete('s');

    url.searchParams.set('sort', sort_selector.value);
    window.location.replace(url.toString());
  }); 

// TODO: handle error
  if (response.status !== 200) {
    return;
  }

  // Fill projects list
  const data = await response.json();
  fillProjectsList(data);

  const meta = data['meta'];

  // Set the result count
  const limit_span = document.getElementById('limit');
  limit_span.textContent = params.get('limit') ?? "10";

  const total_span = document.getElementById('total');
  total_span.textContent = meta['total'];

  const result_type_span = document.getElementById('result_type');
  const result_type = params.has('q') ? "search result" : "module";
  const result_type_plural = meta['total'] === 1 ? "" : "s";
  result_type_span.textContent = `${result_type}${result_type_plural}`;

  // Set navigation links 
  setNavLink(meta, 'prev', s);
  setNavLink(meta, 'next', s);
}

populateTable();
