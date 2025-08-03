<script>
  export let base_url;
  export let proj;
  export let rtf;
  export let now;

  import { intlFormatDistance } from './lib/util.js';
</script>

<li class="my-1">
  <div class="p-2 border rounded d-flex flex-wrap">
    <div class="me-auto">
      <div>
        <a class="fs-5 fw-bolder" href="{`${base_url}/projects/${proj.slug}`}">{proj.game.title}</a>
      </div>
      <div>{proj.name}</div>
      <div>{proj.description}</div>
    </div>
    <div class="ms-auto">
<!--
      <div>
        <svg class="svg-icon"><use xlink:href="#arrow-down-to-bracket"></use></svg>
        All-Time:
      </div>
      <div>
        <svg class="svg-icon"><use xlink:href="#arrow-down-to-bracket"></use></svg>
        Recent:
      </div>
-->
      <div>
        <svg class="svg-icon"><use xlink:href="#arrows-rotate"></use></svg>
        Updated {intlFormatDistance(rtf, new Date(proj.modified_at), now)}
      </div>
    </div>
  </div>
</li>
