<script>
  import { SortableList } from '@jhubbardsf/svelte-sortablejs';

  import GalleryEditorItem from './GalleryEditorItem.svelte';

  let {
    gallery,
    client,
    md,
    submitEdit,
    cancelEdit
  } = $props();

  let gallery_edit = $state(gallery);

  function is_single_image(files) {
    return files.length == 1 && files[0].type.startsWith('image/');
  }

  function selectImage(event) {
    if (is_single_image(event.target.files)) {
      addImage(event.target.files[0]);
    }
  }

  function addImage(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      gallery_edit.push({
        filename: file.name,
        description: "",
        data: e.target.result,
        file: file
      });
    };
  }

</script>

<style>

figure:hover #new_image_label {
  transition: filter 0.15s ease-in-out;
  filter: brightness(0.75);
}

#new_image_figure {
  pointer-events: auto;
}

#new_image_input {
  display: none;
}

#new_image_label {
  display: inline-flex;
  position: relative;
  width: 8em;
  height: 8em;
}

#new_image_add_overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

#new_image_add_overlay svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25%;
  height: auto;
}

</style>

<form action="" onsubmit={submitEdit}>
  <SortableList id="image_list" class="d-flex flex-wrap align-items-center justify-content-evenly" animation={150} draggable=".draggable">
  {#each gallery_edit as img}
    {@const src = img?.data ?? client.imageUrl(img.filename)}
    <GalleryEditorItem {img} {src} />
  {/each}
    <figure id="new_image_figure" class="figure col-lg-3 col-md-4 col-6 px-1">
      <label id="new_image_label" for="new_image_input" class="figure-img img-fluid img-thumbnail">
        <div id="new_image_add_overlay">
          <svg><use xlink:href="#plus"></use></svg>
        </div>
      </label>
      <input id="new_image_input" type="file" accept="image/png, image/jpeg, image/svg+xml, image/webp, image/avif" onchange={selectImage}>
    </figure>
  </SortableList>

  <button type="submit" aria-label="Submit" class="btn btn-primary"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
  <button type="button" aria-label="Cancel" class="btn btn-primary" onclick={cancelEdit}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
</form>
