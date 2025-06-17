<script>

  export let current_version;
  export let news_link;
  export let base_url;
  export let user_info;
  export let gls_url;
  export let discourse_url;
  export let ums_url;
  export let returnto;

  import { getCookie } from '../public/gl/js/util.js';

  import Client from '../public/gl/js/client.js';

  import Header from './Header.svelte';
  import ErrorBox from './ErrorBox.svelte';

  let error = null;

  const client = new Client(
    gls_url,
    ums_url,
    null,
    getCookie('token'),
    getCookie('refresh')
  );

  async function submitEdit(event) {
    error = null;

    const fdata = new FormData(event.target);

    const pname = fdata.get('project_name')
    if (pname) {
      const data = {
        description: "",
        tags: [],
        game: {
          title: pname,
          title_sort_key: pname,
          publisher: "",
          year: "",
          players: {
            min: null,
            max: null
          },
          length: {
            min: null,
            max: null
          }
        },
        readme: ""
      };

      client.project = pname;

      try {
        await client.createProject(data);
        error = null;
      }
      catch (err) {
        error = err;
        return;
      }

      // redirect to the new project page
      window.location.replace(`${base_url}/projects/${pname}`);
    }
  }

  function validateProjectName(event) {

  }

  function cancelEdit(event) {

  }

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

<div id="new_project_content">

{#if error}
  <ErrorBox {error} />
{/if}

  <div class="my-2 pb-2">
    <h2>
      <svg class="svg-icon"><use xlink:href="#person-digging"></use></svg>
      Create Project
    </h2>

{#if user_info}
    <div class="container">
      <div class="row">
        <form action="" on:submit|preventDefault={submitEdit}>
          <label for="project_name_input" class="form-label">Project name</label>
          <input id="project_name_input" type="text" name="project_name" class="form-control" required on:input={validateProjectName}>
          <button class="btn btn-primary p-1 mx-1 rounded-0" type="submit"><svg class="svg-icon"><use xlink:href="#check"></use></svg></button>
          <button class="btn btn-primary p-1 mx-1 rounded-0" type="button" on:click={cancelEdit}><svg class="svg-icon"><use xlink:href="#xmark"></use></svg></button>
        </form>
      </div>
    </div>
{:else}
<ErrorBox error={"Log in to create a project."} />
{/if}

  </div>
</div>

</main>
