import { b64encode, b64decode } from './base64.js';

class ParamsError extends Error {}

export function unpackParams(params) {
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
      // invalid: s should be set if we're seeking
      throw new ParamsError();
    }

    [sort, query] = b64decode(s)
      .split(',', 2)
      .map((e) => e === '' ? null : e);
  }
  else {
    query = params.get('q');
    // default query sort is relevance, otherwise title
    sort = params.get('sort') ?? (query !== null ? 'r' : 't');
  }

  if (s === null) {
    s = b64encode(`${sort ?? ''},${query ?? ''}`);
  }

  return [sort, query, s];
}

export function makeRequestURL(api_url, params, limit) {
  // Construct API request
  const req_url = new URL(`${api_url}/projects`);

  // Pass on only params the API knows
  for (const k of ['q', 'sort', 'order', 'from', 'seek', 'limit']) {
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
