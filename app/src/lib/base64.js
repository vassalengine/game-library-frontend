function bytesToBase64(bytes) {
  return btoa(String.fromCodePoint(...bytes));
}

export function b64encode(s) {
  return bytesToBase64(new TextEncoder().encode(s))
    .replace(/={1,2}$/, '') // unpad
    .replace('+', '-')      // url-safe
    .replace('/', '_');
}

function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (m) => m.codePointAt(0));
}

export function b64decode(s) {
  s = s.replace('-', '+')  // un-url-safe
    .replace('_', '/') +
    Array((4 - s.length % 4) % 4 + 1).join('='); // repad
  return new TextDecoder().decode(base64ToBytes(s));
}
