import ProjectsPage from './ProjectsPage.svelte';
import { getUserInfo, returnToFor, CURRENT_VERSION, DISCOURSE_URL, GLS_URL, NEWS_LINK, UMS_URL } from './lib/setup.js';

const current_version = CURRENT_VERSION;
const news_link = NEWS_LINK;

const LIMIT = 10;

// determine if the user is logged in
const user_info = getUserInfo(UMS_URL);

// set the login/logout returnto
const returnto = returnToFor(user_info, window.location.href, UMS_URL);

const path = window.location.pathname;

// strip /projects from path to get base path
const base_path = path.substring(0, path.lastIndexOf('/'));
const base_url = window.location.origin + base_path;

const app = new ProjectsPage({
  target: document.body,
  anchor: document.body.firstChild,
  props: {
    current_version,
    news_link,
    base_url,
    GLS_URL,
    DISCOURSE_URL,
    UMS_URL,
    user_info,
    returnto,
    LIMIT
  }
});

export default app;
