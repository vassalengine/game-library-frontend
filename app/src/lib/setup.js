import { getCookie } from '../../public/gl/js/util.js';

export const GLS_URL = 'http://localhost:3000/api/v1';
export const UMS_URL = 'http://localhost:4000/api/v1';
export const DISCOURSE_URL = 'https://forum.vassalengine.org';

export const CURRENT_VERSION = '3.7.12';
export const NEWS_LINK = 'https://forum.vassalengine.org/t/vassal-3-7-12-released/79548';

export function getUserInfo(ums_url) {
  const username = getCookie('username');
  if (!username) {
    return null;
  }

  let name = getCookie('name');
  if (name !== null) {
    name = decodeURI(name);
  }

  return {
    username,
    name,
    avatar_url: `${ums_url}/users/${username}/avatar/48`
  };
}

export function returnToFor(logged_in, ret_url, ums_url) {
  const here = encodeURIComponent(ret_url);
  const action = logged_in ? 'Logout' : 'Login';
  return encodeURIComponent(`${ums_url}/sso/complete${action}?returnto=${here}`);
}
