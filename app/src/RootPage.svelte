<script>


  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  let {
    current_version,
    news_link,
    base_url,
    user_info,
    discourse_url,
    ums_url,
    returnto
  } = $props();
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

<div>

<h1>Welcome to the Module Library</h1>

<p>The Module Library is a central repository for players, designers, and publishers to store or access Vassal modules and related files. Read on for an overview of its structure and some examples.</p>

<h2>Concepts</h2>

<ul>

<li>Pages are projects.</li>

<li>Projects contain packages.</li>

<li>Packages contain releases.</li>

<li>Releases contain files.</li>

<li>Packages have names.</li>

<li>Releases have version numbers.</li>

<li>Release version numbers follow the <a href="https://semver.org">Semantic Versioning</a> format, which is <code>x.y.z</code> for normal releases.</li>

<li>A newly-uploaded module file must have a version number matching the release it is in.</li>

<li>Projects have owners, and are editable by their owners only.</li>

<li>Project owners can add and remove owners, including themselves.</li>

</ul>

<p>For greater detail, see the <a href="https://forum.vassalengine.org/t/how-to-upload-modules-to-the-game-library/85586">library documentation</a>.</p>

<p>If you are working with a module that was on a page in the old module library which contained multiple competing modules for the same game, including but not limited to <a href="https://forum.vassalengine.org/t/switching-to-the-new-module-library/85164/17">modules listed here</a>, <b>PLEASE CONSULT WITH THE SITE ADMINS BEFORE PROCEEDING</b> by posting in the <a href="https://forum.vassalengine.org/c/site-feedback/2">forum</a>.</p>

<h2>Examples</h2>

<ul>
<li>
<p>You want to upload version 0.5.0 of the module <code>battle_for_foo.vmod</code>. Your project already has a package containing the 0.4.0 release of that module.</p>
<p><b>DO</b> create a release in the existing package with version number 0.5.0 and add the new file to that release.</p>

<p><b>DON'T</b> create a new package. A package is intended to contain all the releases of a single module.</p>
</li>

<li>
<p>A game has multiple distinct modules covering the game, maintaned by different people.</p>

<p><b>DO</b> create a project for each group maintaining a module.</p>

<p><b>DON'T</b> put competing modules for one game into the same project.</p>
</li>

<li>
<p>A game has multiple distinct modules for <em>different parts of the game</em>. E.g., an SPI quad, or a game covering serveral American Civil War battles each on their own map. These modules are maintained by the same people and are not alternative modules for the same game.</p>

<p><b>DO</b> create a package within one project for each module.</p>

<p><b>DON'T</b> create a project for each module.</p>
</li>
</ul>

</div>

</main>

<Footer/>
