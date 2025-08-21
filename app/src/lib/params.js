export function unpackParams(params) {
  const query = params.get('q');

  // default query sort is relevance, otherwise title
  const sort_by = params.get('sort_by') ?? (query !== null ? 'r' : 't');

  return [sort_by, query];
}

export function makeRequestURL(api_url, params, limit) {
  // Construct API request
  const req_url = new URL(`${api_url}/projects`);

  for (const [k, v] of params.entries()) {
    req_url.searchParams.set(k, v);
  }

  if (!req_url.searchParams.has('limit')) {
    req_url.searchParams.set('limit', limit);
  }

  return req_url;
}
