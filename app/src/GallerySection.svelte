<script>
  import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
  import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.1.3/+esm';

  import ErrorBox from './ErrorBox.svelte';

  export let proj;
  export let client;
  export let username;
  export let editing;

  function mdInit() {
    const defaults = {
      html: false,
      xhtmlOut: false,
      breaks: false,
      langPrefix: 'language-',
      linkify: true,
      typographer: true,
  //    highlight: doHighlight
    };

    const md = markdownIt(defaults);

    return md;
  }

  const md = mdInit();

  //
  // edit mode
  //

  let edit = false;
  let error = null;

  function startEdit(event) {
    edit = true;
    editing = true;
  }

  function cancelEdit(event) {
    edit = false;
    editing = false;
    error = null;
  }

</script>

<style>

figure:hover img {
  transition: filter 0.15s ease-in-out;
  filter: brightness(0.75);
}

</style>

{#if error}
<ErrorBox {error} />
{/if}
<div class="d-flex flex-wrap align-items-center justify-content-evenly">
{#each proj.gallery as img}
  {@const src = client.imageUrl(img.filename)}
  <figure class="figure col-lg-3 col-md-4 col-6 px-1">
    <a href="{src}"><img class="figure-img img-fluid img-thumbnail" src="{src}" alt=""></a>
    <figcaption class="figure-caption text-center">{@html DOMPurify.sanitize(md.renderInline(img.description))}</figcaption>
  </figure>
{/each}
</div>
