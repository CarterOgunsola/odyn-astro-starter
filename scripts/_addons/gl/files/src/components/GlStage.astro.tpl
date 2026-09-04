<div class="gl-stage" data-gl-stage transition:persist="gl-stage" aria-hidden="true">
  <canvas></canvas>
</div>

<style lang="scss">
  .gl-stage {
    --z-stage: -1;
    position: fixed;
    inset: 0;
    z-index: var(--z-stage);
    pointer-events: none;
    canvas {
      display: block;
      inline-size: 100%;
      block-size: 100%;
    }
  }
  :global(html[data-gl="off"]) .gl-stage {
    display: none;
  }
</style>

<style is:global>
  [data-gl="plane"][data-gl-ready] {
    visibility: hidden;
  }
</style>
