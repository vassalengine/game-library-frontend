import { b64encode, b64decode } from './base64.js';

class ParamsError extends Error {}

export function unpackParams(params) {
  // Unpack parameters
  let sort_by = null;
  let query = null;
  let s = params.get('s');

  // Local state parameter s
  //
  // s is set => retain s
  // query is set => add query to s
  // nothing set => sort_by = t, query = null

  if (params.has('sort_by') && params.has('dir') && params.has('anchor')) {
    if (s === null) {
      // invalid: s should be set if we're seeking
      throw new ParamsError();
    }

    query = b64decode(s);
  }
  else {
    query = params.get('q');
    // default query sort is relevance, otherwise title
    sort_by = params.get('sort_by') ?? (query !== null ? 'r' : 't');
  }

  if (s === null) {
    s = b64encode(query ?? '');
    sort_by = 't';
  }

  return [sort_by, query, s];
}

export function makeRequestURL(api_url, params, limit) {
  // Construct API request
  const req_url = new URL(`${api_url}/projects`);

  // Pass on only params the API knows
  for (const k of ['q', 'sort_by', 'dir', 'anchor', 'from', 'limit']) {
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
