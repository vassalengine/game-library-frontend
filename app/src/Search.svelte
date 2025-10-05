<script>
  let {
    base_url,
    query = "",
    message = null,
  } = $props();

  function normalizeWhitespace(s) {
    return s.split(/\s+/).filter(s => s.length > 0).join(' ');
  }
 
  function cleanupSearch(event) {
    event.formData.set('q', normalizeWhitespace(event.formData.get('q')));
  }
</script>

<nav class="d-flex flex-wrap align-items-center my-3">
  <form class="mx-md-2 my-1 flex-grow-1 order-md-1" action="{base_url}/projects" onformdata={cleanupSearch}>
    <input class="form-control" type="search" name="q" placeholder="Search..." value={query} required>
  </form>
  <div class="w-100 d-md-none"></div>
{#if message}
  {@render message()}
{:else}
  <div class="d-lg-block d-none w-25 order-md-0"></div>
{/if}
  <div class="ms-auto mx-1 my-1 pe-0 order-md-2">
    <a href="{base_url}/projects">Browse All Projects</a>
  </div>
</nav>
