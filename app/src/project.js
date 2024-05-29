import ProjectPage from './ProjectPage.svelte';
import { getUserInfo, returnToFor, CURRENT_VERSION, DISCOURSE_URL, GLS_URL, NEWS_LINK, UMS_URL } from './lib/setup.js';

// config
const api_url = GLS_URL;

const current_version = CURRENT_VERSION;
const news_link = NEWS_LINK;

// determine if the user is logged in
const user_info = getUserInfo(UMS_URL);

// set the login/logout returnto
const returnto = returnToFor(user_info, window.location.href, UMS_URL);

// determine what project to display
const path = window.location.pathname;
const i = path.lastIndexOf('/');
const project = path.substring(i + 1);

// strip /projects from path to get base path
const base_path = path.substring(0, path.lastIndexOf('/', i - 1));
const base_url = window.location.origin + base_path;

const app = new ProjectPage({
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
