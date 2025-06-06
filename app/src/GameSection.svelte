<script>
  import { getCookie } from '../public/gl/js/util.js';

  import ErrorBox from './ErrorBox.svelte';

  export let proj;
  export let client;
  export let username;
  export let editing;

  function user_is_owner() {
     return username && proj.owners.includes(username);
  }

  let players_slug;

  function plural(v) {
    return v === 1 ? '' : 's';
  }

  function makePlayersSlug(min, max) {
    return makeRangeSlug(min, 'player', max, 'player');
  }

  let length_slug;

  function roundNearest(v, step) {
    return Math.round(v / step) * step;
  }

  function minutesOrHours(t) {
    return t > 90 ? [roundNearest(t / 60, 0.5), 'hour'] : [t, 'minute'];
  }

  function makeLengthSlug(min, max) {
    return makeRangeSlug(...minutesOrHours(min), ...minutesOrHours(max))
  }

  function makeRangeSlug(lval, lunit, hval, hunit) {
    if (lval !== null) {
      if (hval !== null) {
        if (lval === hval) {
          return `${lval} ${lunit}${plural(lval)}`;
        }
        else if (lunit === hunit) {
          return `${lval}–${hval} ${hunit}s`;
        }
        else {
          return `${lval} ${lunit}${plural(lval)}–${hval} ${hunit}${plural(hval)}`;
        }
      }
      else {
        return `At least ${lval} ${lunit}${plural(lval)}`;
      }
    }
    else if (hval !== null) {
      return `Up to ${hval} ${hunit}${plural(hval)}`;
    }
    else {
      return 'unknown';
    }
  }

  //
  // box image
  //

  let box_img = proj.image ? client.imageUrl(proj.image) : '';
  let box_img_clear = false;

  function clearImage(event) {
    box_img = '';
  }

  function is_single_image(files) {
    return files.length == 1 && files[0].type.startsWith('image/');
  }

  function setImage(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      box_img = e.target.result;
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

  let sort_key;
  let use_sort_key;

  function toggleSortKey(event) {
    sort_key = proj.game.title;
  }

  function init() {
    box_img = proj.image ? client.imageUrl(proj.image) : '';
    sort_key = proj.game.title_sort_key;
    use_sort_key = proj.game.title !== proj.game.title_sort_key;

    players_slug = makePlayersSlug(
      proj.game.players?.min ?? null,
      proj.game.players?.max ?? null
    );

    length_slug = makeLengthSlug(
      proj.game.length?.min ?? null,
      proj.game.length?.max ?? null
    );
  }

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
    init();
  }

  async function submitEdit(event) {
    const fdata = new FormData(event.target);

    const data = {};

    const description = fdata.get('description');
    if (description !== proj.description) {
      data.description = description;
    }

    // check for updates to properties which cannot be null
    for (const k of ['title', 'title_sort_key', 'publisher', 'year']) {
      const fv = fdata.get(`game_${k}`);
      if (fv !== proj.game[k]) {
        (data.game ??= {})[k] = fv;
      }
    }

    // check for updates to min/max players, length, which can be null
    for (const k0 of ['players', 'length']) {
      for (const k1 of ['min', 'max']) {
        const fv = fdata.get(`game_${k0}_${k1}`) || null;
        if (fv !== (proj.game[k0]?.[k1] ?? null)) {
          ((data.game ??= {})[k0] ??= {})[k1] = fv ? parseInt(fv) : null;
        }
      }
    }

    // check for updates to image
    const box_image = fdata.get('box_image');
    if (box_image.name !== '') {
      data.image = box_image.name;
    }
    else if (fdata.get('box_image_clear') === 'true') {
      data.image = null;
    }

    // submit changes only if there are some
    if (Object.keys(data).length > 0) {

      const token = getCookie('token');

      if (data.image) {
        data.image = box_image.name;

        try {
          await client.addImage(
            box_image.name,
            box_image,
            box_image.type,
            token
          );
          error = null;
        }
        catch (err) {
          error = err;
          return;
        }
      }

      try {
        await client.updateProject(data, token);
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
    }

    edit = false;
    editing = false;
  }

  init();
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

#box_image_none {
  display: none;
  font-style: italic;
  background-color: #dee2e6;
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

@media only screen and (min-width: 768px) {
  #box_image {
    max-width: 240px;
  }
}
</style>

<!-- TODO: disable submit buttons when there are no changes -->

{#if error}
<ErrorBox {error} />
{/if}
<div class="my-2 p-2 border rounded clearfix bg-light">
{#if edit}
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
        <input type="hidden" name="box_image_clear" value="">
        <input id="box_image_input" type="file" name="box_image" accept="image/png, image/jpeg, image/svg+xml, image/webp, image/avif" on:change={selectImage}>
      </div>
      <div class="row">
        <div class="col-12">
          <label for="game_title_input" class="form-label">Title</label>
          <input id="game_title_input" type="text" name="game_title" class="form-control" required value={proj.game.title}>
        </div>
        <div class="col-12">
          <input id="game_title_sort_key_checkbox" type="checkbox" name="has_game_title_sort_key" class="form-check-input" bind:checked={use_sort_key} on:change={toggleSortKey}>
          <label for="game_title_sort_key_checkbox" class="form-check-label">Add Title Sort Key</label>
        </div>
        {#if use_sort_key}
        <div class="col-12">
          <label for="game_title_sort_key_input" class="form-label">Title Sort Key</label>
          <input id="game_title_sort_key_input" type="text" name="game_title_sort_key" class="form-control" required value={sort_key}>
        </div>
        {:else}
         <input id="game_title_sort_key_input" type="hidden" name="game_title_sort_key" class="form-control" required value={proj.game.title_sort_key}>
        {/if}
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
          <input id="game_players_min_input" type="text" name="game_players_min" class="form-control" value={proj.game.players?.min ?? ''}>
        </div>
        <div class="col-3">
          <label for="game_players_max_input" class="form-label">Maximum Players</label>
          <input id="game_players_max_input" type="text" name="game_players_max" class="form-control" value={proj.game.players?.max ?? ''}>
        </div>
        <div class="col-3">
          <label for="game_length_min_input" class="form-label">Minimum Length</label>
          <input id="game_length_min_input" type="text" name="game_length_min" class="form-control" value={proj.game.length?.min ?? ''}>
        </div>
        <div class="col-3">
          <label for="game_length_max_input" class="form-label">Maximum Length</label>
          <input id="game_length_max_input" type="text" name="game_length_max" class="form-control" value={proj.game.length?.max ?? ''}>
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
{:else}
  <div class="m-3">
    <div class="row mb-3">
      <div class="col-md-auto text-center mb-2" class:no_image={!box_img}>
        <img id="box_image" class="rounded border" src={box_img} alt="box cover">
        <div id="box_image_none" class="rounded border">
          <div>no image</div>
        </div>
      </div>
      <div class="col">
        <h1 class="">
          {proj.game.title}
          <button class="edit_button" class:is_editable={!editing && user_is_owner()} type="button" on:click={startEdit}>
            <svg class="svg-icon edit_icon"><use xlink:href="#pencil"></use></svg>
          </button>
        </h1>
        <div class="d-flex flex-wrap gap-3 h5 fw-normal">
          <div>
            <svg class="svg-icon"><use xlink:href="#industry"></use></svg>
            {#if proj.game.publisher}
            <a href="">{proj.game.publisher}</a>{#if proj.game.publisher}, {/if}
            {/if}
            {#if proj.game.year}
            <a href="">{proj.game.year}</a>
            {/if}
          </div>
          <div><svg class="svg-icon"><use xlink:href="#user-group"></use></svg> <a href="">{players_slug}</a></div>
          <div><svg class="svg-icon"><use xlink:href="#clock"></use></svg> <a href="">{length_slug}</a></div>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <svg class="align-self-center svg-icon"><use xlink:href="#tags"></use></svg>
          <ul class="d-flex flex-wrap list-unstyled gap-3 mb-0">
            {#each proj.tags as tag}
            <li><a href="">{tag.replace(':', ': ')}</a></li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
    <p class="mb-0">{proj.description}</p>
  </div>
{/if}
</div>
