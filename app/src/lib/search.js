export function makeRequestURL(api_url, params, limit) {
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

export function normalizeWhitespace(s) {
  return s.trim().split(/\s+/).filter(s => s.length > 0).join(' ');
}

export function cleanupSearch(event) {
  const fdata = event.formData;
  for (const k of fdata.keys()) {
    fdata.set(k, normalizeWhitespace(fdata.get(k)));
  }
}
