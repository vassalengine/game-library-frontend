export function unpackParams(params) {
  const query = params.get('q');

  // default query sort is relevance, otherwise title
  const sort_by = params.get('sort_by') ?? (query !== null ? 'r' : 't');

  return [sort_by, query];
}

export function makeRequestURL(api_url, params, limit) {
  // Construct API request
  const req_url = new URL(`${api_url}/projects`);

  // Pass on only params the API knows
  for (const k of ['q', 'sort_by', 'from', 'limit']) {
    const v = params.get(k);
    if (v !== null) {
      req_url.searchParams.set(k, v);
    }
  }

  if (!req_url.searchParams.has('limit')) {
    req_url.searchParams.set('limit', limit);
  }

  return req_url;
}
