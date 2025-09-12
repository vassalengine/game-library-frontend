<script>
  import markdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/+esm';
  import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.6/+esm';
  import { getCookie } from './lib/util.js';

  import Client from './lib/client.js';

  import Header from './Header.svelte';
  import Footer from './Footer.svelte';
  import ErrorBox from './ErrorBox.svelte';
  import UserChip from './UserChip.svelte';

  export let current_version;
  export let news_link;
  export let base_url;
  export let user_info;
  export let gls_url;
  export let discourse_url;
  export let ums_url;
  export let returnto;

  const client = new Client(
    gls_url,
    ums_url,
    null,
    getCookie('token'),
    getCookie('refresh')
  );

  let flags = null;
  let error = null;

  client.getFlags()
    .then((f) => flags = f.flags)
    .catch((err) => error = err);

  function mdInit() {
    const defaults = {
      html: false,
      xhtmlOut: false,
      breaks: false,
      langPrefix: 'language-',
      linkify: true,
      typographer: true,
  //    highlight: doHighlight
    };

    const md = markdownIt(defaults);

    return md;
  }

  const md = mdInit();

  function replyTitle(flag) {
    return encodeURIComponent(`Flag for project ${flag.project}`);
  }

  function replyBody(flag) {
    let flag_type;
    let message;

    switch (flag.flag) {
    case "inappropriate":
      flag_type = `an ${flag.flag}`;
      break;
    case "spam":
      flag_type = `a ${flag.flag}`;
      break;
    case "illegal":
      flag_type = `an ${flag.flag}`;
      break;
    case "other":
      flag_type = `a`;
      break;
    }

    const proj_url = `${window.location.origin}${base_url}/projects/${flag.slug}`;

    switch (flag.flag) {
    case "inappropriate":
    case "spam":
      message = `You raised ${flag_type} flag on project [${flag.project}](${proj_url}). Thanks for your report.`
      break;
    case "illegal":
    case "other":
      message = `You raised ${flag_type} flag on project [${flag.project}](${proj_url}):

> ${flag.message.replaceAll("\n", "\n> ")}

Thanks for your report.`
      break;
    }

    return encodeURIComponent(message);
  }

</script>

<style>

tr:nth-child(even) {
  border-bottom: 1px solid black;
}

</style>

<svelte:head>
  <title>Admin - Flags - Module Library - Vassal</title>
</svelte:head>

<Header {base_url} {user_info} {discourse_url} {ums_url} {returnto} {current_version} {news_link} />

<main class="container px-5 mb-5">
  {#if error}
  <ErrorBox error={error} />
  {/if}

  <table>
    <thead>
      <tr>
        <th>Project</th>
        <th>Reporter</th>
        <th>Type</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
    {#if flags !== null}
    {#each flags as flag}
      <tr>
        <td><a href="{base_url}/projects/{flag.slug}">{flag.project}</a></td>
        <td>
          <a href="{discourse_url}/new-message?username={flag.flagged_by}&title={replyTitle(flag)}&body={replyBody(flag)}" aria-label="Reply"><svg class="svg-icon"><use xlink:href="#reply"></use></svg></a>
          <UserChip {ums_url} username={flag.flagged_by} size=24 />
        </td>
        <td>{flag.flag}</td>
        <td>{flag.flagged_at.replace(/\.[0-9]+Z/, "").replace("T", " ")}</td>
      </tr>
      <tr>
        <td colspan="4">{@html flag.message ? DOMPurify.sanitize(md.render(flag.message)) : ""}</td>
      </tr>
    {/each}
    {/if}
    </tbody>
  </table>
</main>

<div class="svg-sprites">
  <div class="fontawesome">
    <svg xmlns="http://www.w3.org/2000/svg">
      <symbol id="reply" viewBox="0 0 512 512">
      <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
        <path d="M205 34.8c11.5 5.1 19 16.6 19 29.2l0 64 112 0c97.2 0 176 78.8 176 176c0 113.3-81.5 163.9-100.2 174.1c-2.5 1.4-5.3 1.9-8.1 1.9c-10.9 0-19.7-8.9-19.7-19.7c0-7.5 4.3-14.4 9.8-19.5c9.4-8.8 22.2-26.4 22.2-56.7c0-53-43-96-96-96l-96 0 0 64c0 12.6-7.4 24.1-19 29.2s-25 3-34.4-5.4l-160-144C3.9 225.7 0 217.1 0 208s3.9-17.7 10.6-23.8l160-144c9.4-8.5 22.9-10.6 34.4-5.4z"/>
      </symbol>
    </svg>
  </div>
</div>

<Footer/>
