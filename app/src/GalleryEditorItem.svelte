<script>
  import { onMount } from 'svelte';

  let {
    img,
    src
  } = $props();

// TODO: add delete button

  let file_input = $state();

  onMount(() => {
    // set the file for the file input if there is one
    if (img?.file) {
      const dt = new DataTransfer();
      dt.items.add(img.file);
      file_input.files = dt.files;
    }
  });
</script>

<style>

figure:hover img {
  transition: filter 0.15s ease-in-out;
  filter: brightness(0.75);
}

.draggable {
  cursor: grab;
}

figure input[type="file"] {
  display: none;
}

</style>

<figure class="draggable figure col-lg-3 col-md-4 col-6 px-1">
  <img class="figure-img img-fluid img-thumbnail" src="{src}" alt="">
  <figcaption class="figure-caption text-center">
    <input type="hidden" name="filename" value={img.filename}>
    <input type="text" name="description" value={img.description}>
    <input bind:this={file_input} type="file" name="file">
  </figcaption>
</figure>
