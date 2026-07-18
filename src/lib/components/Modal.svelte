<script>
  // Shared modal shell — Esc + backdrop + × close, soft mint surface, spring-in.
  import { createEventDispatcher } from "svelte";

  export let open = false;
  export let title = "";
  export let icon = "";

  const dispatch = createEventDispatcher();

  let closing = false;

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Close-out animation: hold a closing flag, then dispatch after the exit
  // anim finishes (instant when reduced-motion is requested). Matches the
  // family pattern in corruptor/cryptkeep/dr_shrink.
  function close() {
    if (closing) return;
    if (prefersReducedMotion()) {
      dispatch("close");
      return;
    }
    closing = true;
    // Matches the 180ms close animation in this file's <style>.
    setTimeout(() => {
      closing = false;
      dispatch("close");
    }, 180);
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }
</script>

<svelte:window on:keydown={open ? onKeydown : undefined} />

{#if open}
  <div class="overlay" class:closing role="presentation" on:click={close}>
    <div
      class="box"
      class:closing
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
  .overlay.closing {
    animation: fadeOut 0.18s ease-out forwards;
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
    /* Rise with one small overshoot (the 1.06 ease) — family reference motion. */
    animation: pop 0.28s cubic-bezier(0.16, 0.84, 0.24, 1.06);
  }
  .box.closing {
    animation: popOut 0.18s cubic-bezier(0.4, 0, 0.24, 1) forwards;
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
    /* keep the title clear of the absolute close X */
    padding-right: 2.5rem;
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
  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  @keyframes pop {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes popOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(8px) scale(0.97);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .overlay.closing,
    .box,
    .box.closing {
      animation: none;
    }
  }
</style>
