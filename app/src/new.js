import ProjectPage from './ProjectPage.svelte';
import { CONFIG } from './lib/setup.js';

const path = window.location.pathname;

// strip last component from path to get base path
const base_path = path.substring(0, path.lastIndexOf('/', i - 1));
const base_url = window.location.origin + base_path;

const app = new NewProjectPage({
  target: document.body,
  anchor: document.body.firstChild,
  props: {
    ...CONFIG,
    base_url
  }
});

export default app;
