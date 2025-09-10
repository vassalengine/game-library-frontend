<script>
  export let proj;
  export let box_img;

  export let submitEdit;
  export let cancelEdit;

  //
  // box image
  //

  let box_img_clear = false;

  function clearImage(event) {
    box_img = '';
    box_img_clear = true;
  }

  function is_single_image(files) {
    return files.length == 1 && files[0].type.startsWith('image/');
  }

  function setImage(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      box_img = e.target.result;
      box_img_clear = false;
    };
  }

  function selectImage(event) {
    if (is_single_image(event.target.files)) {
      setImage(event.target.files[0]);
    }
    else {
      event.target.files = new DataTransfer().files;
    }
  }

  function handleDragEnter(event) {
  }

  function handleDragOver(event) {
  }

  function handleDrop(event) {
    const dt = event.dataTransfer;
    if (is_single_image(dt.files)) {
      setImage(dt.files[0]);
      event.target.files = dt.files;
    }
  }

  //
  // title sort key
  //

  let game_title = proj.game.title;

  function sortKeyFor(t) {
    t = t.normalize("NFKD")
          .toLowerCase()
          .replace(/\p{M}/ug, "")
          .replace(/^[^\p{L}\p{N}]+/u, "");

    const i = t.indexOf(" ");
    if (i !== -1) {
      const art = t.substring(0, i);
      const rest = t.substring(i + 1);

      if (["an", "the"].includes(art) ||
        (art === "a" && !(rest.startsWith("la ") || rest.startsWith("las "))))
      {
        return `${rest}, ${art}`;
      }
    }
    return t;
  }

</script>

<style>

#box_image_input {
  display: none;
}

#box_image_label {
  display: inline-flex;
  position: relative;
  pointer-events: none;
}

#box_image_label:hover #box_image {
  filter: grayscale(100%) brightness(0.5) blur(1px);
}

#box_image_delete_overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: auto;
}

#box_image_delete_overlay button {
  position: absolute;
  transform: translate(-50%, -50%);
  top: 0.5em;
  left: 0.5em;
  width: 1.75em;
  height: 1.75em;
  border: 2px solid black;
  border-radius: 50%;
  z-index: 10;
  background-color: white;
}

.no_image #box_image_delete_overlay button {
  visibility: hidden !important;
}

#box_image_delete_overlay button:hover {
  border-color: #0a58ca;
}

#box_image_delete_overlay button:hover svg {
  fill: #0a58ca;
}

#box_image_edit_overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: auto;
  z-index: 0;
}

#box_image_edit_overlay:hover {
  opacity: 1;
  cursor: pointer;
}

#box_image_edit_overlay svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 25%;
  height: auto;
  fill: white;
}

@media only screen and (max-width: 767px) {
  #game_section_form {
    clear: both;
  }
}

/* FIXME: duplicated with GameSection below here */

#box_image_none {
  display: none;
  font-style: italic;
  background-color: #dee2e6;
}

.no_image #box_image_none {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 12em;
  height: 12em;
}

.no_image #box_image {
  display: none !important;
}

@media only screen and (min-width: 768px) {
  #box_image {
    max-width: 240px;
  }
}

</style>

<div>
  <form id="game_section_form" action="" on:submit|preventDefault={submitEdit}>
    <div class="float-left my-2 ms-2 me-3" class:no_image={!box_img}>
      <label id="box_image_label" for="box_image_input" on:dragenter|stopPropagation|preventDefault={handleDragEnter} on:dragover|stopPropagation|preventDefault={handleDragOver} on:drop|stopPropagation|preventDefault={handleDrop}>
        <img id="box_image" class="rounded border img-fluid" src={box_img} alt="box cover">
        <div id="box_image_none" class="rounded border">
          <div>no image</div>
        </div>
        <div id="box_image_delete_overlay">
          <button type="button" on:click={clearImage}>
            <svg class="svg-icon"><use xlink:href="#xmark"></use></svg>
          </button>
        </div>
        <div id="box_image_edit_overlay">
          <svg><use xlink:href="#pencil"></use></svg>
        </div>
      </label>
      <input type="hidden" name="box_image_clear" value={box_img_clear}>
      <input id="box_image_input" type="file" name="box_image" accept="image/png, image/jpeg, image/svg+xml, image/webp, image/avif" on:change={selectImage}>
    </div>
    <div class="row">
      <div class="col-12">
        <label for="game_title_input" class="form-label">Title</label>
        <input id="game_title_input" type="text" name="game_title" class="form-control" required bind:value={game_title}>
      </div>
      <div class="col-12">
        <label for="game_title_sort_key_input" class="form-label">Title Sort Key</label>
        <input id="game_title_sort_key_input" type="text" name="game_title_sort_key" class="form-control" readonly disabled value={sortKeyFor(game_title.trim())}>
      </div>
      <div class="col-8">
        <label for="game_publisher_input" class="form-label">Publisher</label>
        <input id="game_publisher_input" type="text" name="game_publisher" class="form-control" value={proj.game.publisher}>
      </div>
      <div class="col-4">
        <label for="game_year_input" class="form-label">Year</label>
        <input id="game_year_input" type="text" name="game_year" class="form-control" value={proj.game.year}>
      </div>
      <div class="col-3">
        <label for="game_players_min_input" class="form-label">Minimum Players</label>
        <input id="game_players_min_input" type="number" min="1" step="1" name="game_players_min" class="form-control" value={proj.game.players?.min ?? ''}>
      </div>
      <div class="col-3">
        <label for="game_players_max_input" class="form-label">Maximum Players</label>
        <input id="game_players_max_input" type="number" min="1" step="1" name="game_players_max" class="form-control" value={proj.game.players?.max ?? ''}>
      </div>
      <div class="col-3">
        <label for="game_length_min_input" class="form-label">Minimum Length</label>
        <input id="game_length_min_input" type="number" min="1" step="1" name="game_length_min" class="form-control" value={proj.game.length?.min ?? ''}>
      </div>
      <div class="col-3">
        <label for="game_length_max_input" class="form-label">Maximum Length</label>
        <input id="game_length_max_input" type="number" min="1" step="1" name="game_length_max" class="form-control" value={proj.game.length?.max ?? ''}>
      </div>
      <div class="col-12">
        <label for="description_input" class="form-label">Description</label>
        <input id="description_input" type="text" name="description" class="form-control" value={proj.description}>
      </div>
      <div class="col-12">
        <button type="submit" class="btn btn-primary"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
        <button type="button" class="btn btn-primary" on:click={cancelEdit}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
      </div>
    </div>
  </form>
</div>
