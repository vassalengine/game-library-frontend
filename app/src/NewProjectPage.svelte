<script>

  export let current_version;
  export let news_link;
  export let base_url;
  export let user_info;
  export let gls_url;
  export let discourse_url;
  export let ums_url;
  export let returnto;

</script>


<svelte:head>
  <title>Module Library - Vassal</title>
</svelte:head>

<Header {base_url} {user_info} {discourse_url} {ums_url} {returnto} {current_version} {news_link} />

<main class="container px-5 mb-5">

<nav class="d-flex flex-wrap align-items-center my-3">
  <div class="d-lg-block d-none w-25"></div>
  <form class="mx-md-2 my-1 flex-grow-1" action="{base_url}/projects">
    <input class="form-control" id="search" type="search" name="q" placeholder="Search...">
  </form>
  <div class="w-100 d-md-none"></div>
  <div class="ms-auto mx-1 my-1 pe-0">
    <a href="{base_url}/projects">Browse All Projects</a>
  </div>
</nav>

<div id="new_project">


</div>

</main>
