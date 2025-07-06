<script>
  import { onMount } from 'svelte';

  export let pkg;

  export let packages;
  export let submitEdit;
  export let cancelEdit;

  let pkg_names;
  let pkg_sort_keys;

  function startEdit() {
    pkg_names = new Set(packages.map((p) => p.name));
    pkg_sort_keys = new Set(packages.map((p) => p.sort_key));
  }

  onMount(startEdit);

  function validatePackageName(event) {
    event.target.setCustomValidity(
      pkg_names.has(event.target.value) ?
        "Package already exists" : ""
    );
  }

  function validatePackageSortKey(event) {
    let message = "";

    const sk = Number(event.target.value);
    if (!Number.isInteger(sk)) {
      message = "Sort key is not an integer";
    }

    if (pkg_sort_keys.has(sk)) {
      message = "Sort key already exists";
    }

    event.target.setCustomValidity(message);
  }
</script>

<div class="package_tmpl_top border rounded p-3 my-2">
  <form action="" on:submit|preventDefault={submitEdit}>
    <svg class="svg-icon"><use xlink:href="#cube"></use></svg>
    <label for="package_name_input" class="form-label">Package name</label>
    <input id="package_name_input" type="text" name="package_name" class="package_tmpl_name form-control" required on:input={validatePackageName} value={pkg?.name ?? ""}>
    <label for="sort_key_input" class="form-label">Package sort key</label>
    <input id="sort_key_input" type="number" min={Number.MIN_SAFE_INTEGER} max={Number.MAX_SAFE_INTEGER} step="1" name="sort_key" class="package_tmpl_name form-control" required on:input={validatePackageSortKey} value={pkg?.sort_key ?? ""}>
    <button class="btn btn-primary p-1 mx-1 rounded-0" type="submit"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
    <button class="btn btn-primary p-1 mx-1 rounded-0" type="button" on:click={cancelEdit}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
  </form>
</div>
