<script>
  export let base_url;
  export let user_info;
  export let discourse_url;
  export let ums_url;
  export let returnto;
  export let current_version;
  export let news_link;
</script>

<style>

#current_user button img.avatar {
  width: 2em;
  height: 2em;
  margin: 0.2em;
}

.avatar {
  border-radius: 50%;
}

</style>

<!-- nav -->

<header class="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between px-2 py-2">

  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.min.js" integrity="sha384-7qAoOXltbVP82dhxHAUje59V5r2YsVfBafyUDxEdApLPmcdhBPg1DKg1ERo0BZlK" crossorigin="anonymous"></script>

  <a href="/" class="d-flex align-items-center col-md-3 mb-2 mb-md-0 text-dark text-decoration-none">
    <img class="wordmark" src="/images/wordmark-path.svg" width="529" height="180" alt="Vassal">
  </a>

  <ul class="nav col-12 col-md-auto mb-2 justify-content-center align-items-center mb-md-0">
    {#if !user_info}
    <li id="sign_up_user"><a class="btn btn-primary p-1 mx-1 rounded-0" href="{discourse_url}/signup" role="button">Sign Up</a></li>
    <li id="login_user"><a class="btn btn-primary p-1 mx-1 rounded-0" href="{ums_url}/sso/login?returnto={returnto}" role="button"><svg class="svg-icon"><use xlink:href="#user"></use></svg> Log In</a></li>
    {/if}
    <li><a class="nav-link px-2 link-dark" href="/about.html"><svg class="svg-icon"><use xlink:href="#info-circle"></use></svg> About</a></li>
    <li><a class="nav-link px-2 link-dark" href="https://discord.gg/GDdfq9AkfM"><svg class="svg-icon"><use xlink:href="#fab-discord"></use></svg> Chat</a></li>
    <li><a class="nav-link px-2 link-dark" href="https://forum.vassalengine.org"><svg class="svg-icon"><use xlink:href="#landmark"></use></svg> Forum</a></li>
    <li><a class="nav-link px-2 link-dark" href="{base_url}/projects"><svg class="svg-icon"><use xlink:href="#chess-knight"></use></svg> Modules</a></li>
<!-- TODO: update doc link -->
    <li><a class="nav-link px-2 link-dark" href="https://forum.vassalengine.org/c/documentation/18"><svg class="svg-icon"><use xlink:href="#book-open"></use></svg> Documentation</a></li>
    <li><a class="nav-link px-2 link-dark" href="https://forum.vassalengine.org/c/news/17"><svg class="svg-icon"><use xlink:href="#bullhorn"></use></svg> News</a></li>
    {#if user_info}
    <li id="current_user" class="nav-item dropdown">
      <button id="userDropdown" class="nav-link p-0 link-dark" data-bs-toggle="dropdown" aria-expanded="false">
        <img id="userAvatar" class="avatar" title="{user_info.name}" src="{user_info.avatar_url}" alt="">
      </button>
      <ul class="dropdown-menu" aria-labelledby="userDropdown">
        <li><a id="userProfile" class="dropdown-item" href="{discourse_url}/u/{user_info.username}"><svg class="svg-icon"><use xlink:href="#user"></use></svg> Profile</a></li>
        <li><a id="userLogout" class="dropdown-item" href="{ums_url}/sso/logout?returnto={returnto}"><svg class="svg-icon"><use xlink:href="#right-from-bracket"></use></svg> Log Out</a></li>
      </ul>
    </li>
    {/if}
  </ul>
</header>

<div id="alert-bar" class="text-center">
  <h5 class="py-3">We've moved to the new module library. See <a class="link-light" href="{news_link}">here</a> for details.</h5>
</div>
