import ProjectPage from './ProjectPage.svelte';
import { CONFIG } from './lib/setup.js';

// determine what project to display
const path = window.location.pathname;
const i = path.lastIndexOf('/');
const project = path.substring(i + 1);

// strip last component from path to get base path
const base_path = path.substring(0, path.lastIndexOf('/', i - 1));
const base_url = window.location.origin + base_path;

const app = new ProjectPage({
  target: document.body,
  anchor: document.body.firstChild,
  props: {
    ...CONFIG,
    base_url,
    project
  }
});

export default app;
