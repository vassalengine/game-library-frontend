import RootPage from './RootPage.svelte';
import { CONFIG } from './lib/setup.js';

const base_url = window.location.pathname;

const app = new RootPage({
  target: document.body,
  anchor: document.body.firstChild,
  props: {
    ...CONFIG,
    base_url
  }
});

export default app;
