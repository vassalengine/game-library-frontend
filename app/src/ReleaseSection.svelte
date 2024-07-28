<script>
  import { formatSizeWithUnit, intlFormatDistance } from '../public/gl/js/util.js';
  import UserChip from './UserChip.svelte';

  export let ums_url;

  export let release;
  export let current = false;

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  function formatRequires(r) {
    if (r === '') {
      return 'Unknown';
    }

    return r.replace('>=', '≥').replace('<=', '≤');
  }

</script>

<style>
/* Release pills */

.current_release {
  background-color: #008800;
}

.release {
  background-color: #bbbbbb;
}
</style>

<li class="d-flex flex-wrap align-items-center p-1 my-2 gap-2">
  <div class="badge rounded-pill fs-5" class:current_release={current} class:release={!current}>{release.version}</div>
  <div><a href={release.url}>{release.filename}</a></div>
  <div class="d-flex flex-wrap gap-2">
    <div>
      By <UserChip {ums_url} username={release.published_by} size=24 />
    </div>
    <div>
      <svg class="svg-icon"><use xlink:href="#weight-hanging"></use></svg>
      {formatSizeWithUnit(release.size)}
    </div>
    <div>
      <svg class="svg-icon"><use xlink:href="#vassal-bw"></use></svg>
      {formatRequires(release.requires)}
    </div>
    <time datetime={release.published_at}>
      <svg class="svg-icon"><use xlink:href="#calendar-days"></use></svg>
      {intlFormatDistance(rtf, new Date(release.published_at), new Date())}
    </time>
  </div>
</li>
