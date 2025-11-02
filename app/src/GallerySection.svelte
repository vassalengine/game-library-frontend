<script>
  import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';

  import ErrorBox from './ErrorBox.svelte';
  import GalleryItem from './GalleryItem.svelte';
  import GalleryEditor from './GalleryEditor.svelte';

  let {
    proj = $bindable(),
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

  function isModified(ids, descriptions) {
    if (ids.length !== proj.gallery.length) {
      // an image was removed
      return true;
    }

    if (!ids.every((id, i) => id === proj.gallery[i].id)) {
      // id mismatch => some combination of reordering, deletion
      return true;
    }

    if (!descriptions.every((d, i) => d === proj.gallery[i].description)) {
      // an image description changed
      return true;
    }

    return false;
  }

  async function submitEdit(event) {
    event.preventDefault();
    event.stopPropagation();

    const fdata = new FormData(event.target);

    const ids = fdata.getAll('id');
    const descriptions = fdata.getAll('description');

    // check if there are any changes
    if (!isModified(ids, descriptions)) {
      edit = false;
      editing = false;
      return;
    }

    // assmble the data into a new items list
    const data = Array(ids.length).fill().map((_, i) => ({
        id: parseInt(ids[i]),
        description: descriptions[i],
    }));

    // set the next ids
    for (const [i, item] of data.entries()) {
      item.next_id = i === data.length - 1 ? null : data[i + 1].id;
    }

    // make an id map for original items
    const orig_pos = proj.gallery.reduce(
      (prev, cur, i) => ({...prev, [cur.id]: i}), {}
    );

    const patches = [];

/*
  Operations:

    { op: 'update', id: item.id, description: item.description }
    { op: 'delete', id: item.id }
    { op: 'move', id: item.id, next: item.next_id }

*/

    // collect the updated items
    const updated = [];
    for (const item of data) {
      // get the original version
      const opos = orig_pos[item.id];
      delete orig_pos[item.id];
      const oitem = proj.gallery[opos];

      const uitem = {};

      if (item.description !== oitem.description) {
        // description has changed
        uitem.op = 'update';
        uitem.description = item.description;
      }

      if (item.next_id !== (opos < proj.gallery.length - 1 ? proj.gallery[opos + 1].id : null)) {
        // next has changed
        uitem.op = 'move';
        uitem.next_id = item.next_id;
      }

      if (Object.keys(uitem).length > 0) {
        // something changed, record it
        uitem.id = item.id;
        updated.push(uitem);
      }
    }

    // anything remaining in orig_pos was deleted
    for (const id of Object.keys(orig_pos)) {
      updated.push({ op: 'delete', id: id });
    }

    console.log(updated);

/*
    // update the gallery
    try {
      await client.updateGallery(updated);
      error = null;
    }
    catch (err) {
      error = err;
      return;
    }

    // update the project data
    try {
      proj = await client.getProject();
      error = null;
    }
    catch (err) {
      error = err;
      return;
    }
*/

    edit = false;
    editing = false;
  }

  function is_single_image(files) {
    return files.length == 1 && files[0].type.startsWith('image/');
  }


  async function submitImage(event) {
    if (!is_single_image(event.target.files)) {
      return;
    }

    const file = event.target.files[0];

    try {
      const callbacks = {
        progress: (e) => {
          if (e.lengthComputable) {
//              uploadProgress = Math.floor((e.loaded / e.total) * 100);
            console.log(Math.floor((e.loaded / e.total) * 100));
          }
        }
      };

      const [_, promise] = await client.addImage(
        file.name,
        file,
        file.type,
        callbacks
      );

      const result = await promise;
      error = null;

      switch (result) {
        case Client.UPLOAD_OK:
          break;
        case Client.UPLOAD_ABORTED:
          return;
      }
    }
    catch (err) {
      error = err;
      return;
    }

    // update the project data
    try {
      proj = await client.getProject();
      error = null;
    }
    catch (err) {
      error = err;
      return;
    }
  }

</script>

{#if error}
<ErrorBox {error} />
{/if}
<button class="edit_button fs-2" class:is_editable={!editing && user_is_owner()} type="button" aria-label="Edit" onclick={startEdit}>
  <svg class="svg-icon edit_icon"><use xlink:href="#pencil"></use></svg>
</button>

{#if edit}
<GalleryEditor {proj} {client} {md} {submitEdit} {cancelEdit} {submitImage} />
{:else}
<div class="d-flex flex-wrap align-items-center justify-content-evenly">
{#each proj.gallery as img}
  {@const src = client.imageUrl(img.filename)}
  <GalleryItem {img} {src} {md} />
{/each}
</div>
{/if}
