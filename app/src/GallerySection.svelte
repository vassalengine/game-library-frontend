<script>
  import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';

  import ErrorBox from './ErrorBox.svelte';
  import GalleryItem from './GalleryItem.svelte';
  import GalleryEditor from './GalleryEditor.svelte';

  let {
    proj,
    client,
    username,
    editing = $bindable()
  } = $props();

  function user_is_owner() {
     return username && proj.owners.includes(username);
  }

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

  let edit = $state(false);
  let error = $state(null);

  function startEdit(event) {
    edit = true;
    editing = true;
  }

  function cancelEdit(event) {
    edit = false;
    editing = false;
    error = null;
  }

  function submitEdit(event) {
    event.preventDefault();
    event.stopPropagation();

    const fdata = new FormData(event.target);

    const filenames = fdata.getAll('filename');
    const descriptions = fdata.getAll('description');
    const files = fdata.getAll('file');

    const imgs = [];
    for (let i = 0; i < filenames.length; ++i) {
      imgs[i] = {
        filename: filenames[i],
        description: descriptions[i],
        file: files[i]
      };
    }

    console.log(imgs);

    edit = false;
    editing = false;
  }

</script>

{#if error}
<ErrorBox {error} />
{/if}
<button class="edit_button fs-2" class:is_editable={!editing && user_is_owner()} type="button" aria-label="Edit" onclick={startEdit}>
  <svg class="svg-icon edit_icon"><use xlink:href="#pencil"></use></svg>
</button>

{#if edit}
<GalleryEditor gallery={proj.gallery} {client} {md} {submitEdit} {cancelEdit} />
{:else}
<div class="d-flex flex-wrap align-items-center justify-content-evenly">
{#each proj.gallery as img}
  {@const src = client.imageUrl(img.filename)}
  <GalleryItem {img} {src} {md} />
{/each}
</div>
{/if}
