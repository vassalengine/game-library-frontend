import App from './App.svelte';
import { getCookie } from '../public/gl/js/util.js';

// config
const UMS_URL = 'http://localhost:4000/api/v1';
const DISCOURSE_URL = 'https://forum.vassalengine.org';
const api_url = 'http://localhost:3000/api/v1';

const current_version = '3.7.12';
const news_link = 'https://forum.vassalengine.org/t/vassal-3-7-12-released/79548';

// determine if the user is logged in
let user_info = null;

const username = getCookie('username');
if (username) {
  let name = getCookie('name');
  if (name !== null) {
    name = decodeURI(name);
  }

  user_info = {
    username: username,
    name: name,
    avatar_url: `${UMS_URL}/users/${username}/avatar/48`
  };
}

// set the login/logout returnto
const here = encodeURIComponent(window.location.href);
const action = user_info ? 'Logout' : 'Login';
const returnto = encodeURIComponent(`${UMS_URL}/sso/complete${action}?returnto=${here}`);

// determine what project to display
const path = window.location.pathname;
const i = path.lastIndexOf('/');
const project = path.substring(i + 1);

// strip /projects from path to get base path
const base_path = window.location.pathname.substring(
  0, path.lastIndexOf('/', i - 1)
);

const base_url = window.location.origin + base_path;

const app = new App({
  target: document.body,
  anchor: document.body.firstChild,
  props: {
    current_version,
    news_link,
    base_url,
    api_url,
    DISCOURSE_URL,
    UMS_URL,
    project,
    user_info,
    returnto
  }
});

export default app;
