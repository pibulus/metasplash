<script>
  // Shared modal shell — Esc + backdrop + × close, soft mint surface, spring-in.
  import { createEventDispatcher } from "svelte";

  export let open = false;
  export let title = "";
  export let icon = "";

  const dispatch = createEventDispatcher();
  const close = () => dispatch("close");

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }
</script>

<svelte:window on:keydown={open ? onKeydown : undefined} />

{#if open}
  <div class="overlay" role="presentation" on:click={close}>
    <div
      class="box"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabindex="-1"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <button class="x" on:click={close} aria-label="Close">×</button>
      {#if title}
        <header class="head">
          {#if icon}<span class="ico" aria-hidden="true">{icon}</span>{/if}
          <h2>{title}</h2>
        </header>
      {/if}
      <div class="body"><slot /></div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(16, 32, 26, 0.4);
    backdrop-filter: blur(3px);
    animation: fade 0.18s ease-out;
  }
  .box {
    position: relative;
    width: 100%;
    max-width: 400px;
    max-height: 86vh;
    overflow-y: auto;
    border-radius: 24px;
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: linear-gradient(135deg, #f3fdf7, var(--ds-bg, #e7faf0));
    box-shadow: 0 24px 64px rgba(16, 60, 40, 0.22);
    padding: 1.6rem 1.5rem 1.35rem;
    /* spring-in (Comeau linear()) */
    animation: pop 0.5s
      linear(0, 0.4 7%, 1.05 18%, 1.12 24%, 0.97 47%, 1.005 70%, 1);
  }
  .x {
    position: absolute;
    top: 0.7rem;
    right: 1rem;
    font-size: 1.5rem;
    line-height: 1;
    color: #9fb3a8;
    transition: color 0.15s ease;
  }
  .x:hover {
    color: var(--ds-ink, #16352a);
  }
  .head {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
  .ico {
    font-size: 1.5rem;
  }
  .head h2 {
    font-size: 1.3rem;
    font-weight: 900;
    letter-spacing: -0.01em;
    color: var(--ds-ink, #16352a);
  }
  .body {
    color: #3c5249;
    font-size: 0.95rem;
    line-height: 1.55;
  }
  @keyframes fade {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .box {
      animation: none;
    }
  }
</style>
