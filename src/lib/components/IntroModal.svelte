<script>
  // metasplash intro / onboarding — first-visit welcome + reopenable.
  // Built fresh to the shared SKELETON: warm-dark blurred backdrop (tap-to-close),
  // spring-in open + animate-out close (closing flag held before unmount),
  // 44px circular X (top-right 1rem, scale-hover, focus ring), centred card
  // above 640px → docked bottom-sheet below it. prefers-reduced-motion = instant.
  // SKIN stays 100% metasplash: mint→teal document-ghost, "tag ya art" voice.
  import { createEventDispatcher } from "svelte";
  import ThemeMascot from "./ThemeMascot.svelte";
  import { theme } from "$lib";

  export let open = false;

  const dispatch = createEventDispatcher();
  let closing = false;

  function requestClose() {
    if (closing) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      dispatch("close");
      return;
    }
    closing = true;
    setTimeout(() => {
      closing = false;
      dispatch("close");
    }, 220);
  }

  function onKeydown(e) {
    if (e.key === "Escape") requestClose();
  }
</script>

<svelte:window on:keydown={open ? onKeydown : undefined} />

{#if open}
  <div
    class="overlay"
    class:closing
    role="presentation"
    on:click={requestClose}
  >
    <div
      class="box"
      class:closing
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      tabindex="-1"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <button class="x" on:click={requestClose} aria-label="Close intro">
        <span aria-hidden="true">×</span>
      </button>

      <div class="mascot-slot" aria-hidden="true">
        <ThemeMascot theme={$theme} size="92px" />
      </div>

      <h2 id="intro-title">Tag ya art.</h2>
      <p class="lede">
        Stamp your <strong>name, copyright &amp; socials</strong> onto your own work
        before you share it — so the file carries who made it, wherever it lands.
      </p>

      <ul class="points">
        <li>
          <span class="b">✦</span> Photos get EXIF, audio gets ID3 — written
          <strong>losslessly</strong>. Your pixels and samples stay untouched.
        </li>
        <li>
          <span class="b">✦</span> All in your browser. Nothing uploads, nothing
          is tracked.
        </li>
        <li>
          <span class="b">✦</span> Save your details as a preset once, stamp them
          on everything after with a click.
        </li>
      </ul>

      <button class="cta" on:click={requestClose}>Let's sign it 🔖</button>
    </div>
  </div>
{/if}

<style>
  /* ── Backdrop: warm-dark ~45% + blur, tap-to-close ───────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: rgba(16, 32, 26, 0.45);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    animation: backdrop-in 0.18s ease-out;
  }
  .overlay.closing {
    animation: backdrop-out 0.22s ease-in forwards;
  }

  /* ── Frame: centred card above 640px ─────────────────────────────── */
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
    padding: 1.9rem 1.5rem 1.5rem;
    text-align: center;
    /* spring-in (Comeau linear()) */
    animation: pop-in 0.5s
      linear(0, 0.4 7%, 1.05 18%, 1.12 24%, 0.97 47%, 1.005 70%, 1);
  }
  .box.closing {
    animation: pop-out 0.22s cubic-bezier(0.4, 0, 1, 0.6) forwards;
  }

  /* ── X button: 44px circular, top-right 1rem, scale-hover, focus ring */
  .x {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 1.5rem;
    line-height: 1;
    color: #9fb3a8;
    background: rgba(255, 255, 255, 0.6);
    transition:
      color 0.15s ease,
      transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.15s ease;
  }
  .x:hover {
    color: var(--ds-ink, #16352a);
    background: rgba(255, 255, 255, 0.95);
    transform: scale(1.08);
  }
  .x:active {
    transform: scale(0.92);
  }
  .x:focus-visible {
    outline: 2px solid var(--ds-primary-color, #5fc99a);
    outline-offset: 2px;
  }

  /* ── Mascot slot ─────────────────────────────────────────────────── */
  .mascot-slot {
    display: flex;
    justify-content: center;
    margin-bottom: 0.6rem;
    filter: drop-shadow(0 6px 14px rgba(16, 60, 40, 0.18));
  }

  /* ── Copy ────────────────────────────────────────────────────────── */
  h2 {
    font-size: 1.5rem;
    font-weight: 900;
    letter-spacing: -0.015em;
    color: var(--ds-ink, #16352a);
    margin-bottom: 0.5rem;
  }
  .lede {
    font-size: 0.95rem;
    line-height: 1.55;
    color: #3c5249;
    margin-bottom: 1.1rem;
  }
  .points {
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    text-align: left;
    margin-bottom: 1.3rem;
  }
  .points li {
    display: flex;
    gap: 0.5rem;
    font-size: 0.86rem;
    line-height: 1.45;
    color: #3c5249;
  }
  .b {
    flex-shrink: 0;
    color: var(--ds-primary-color, #5fc99a);
    font-weight: 800;
  }

  .cta {
    width: 100%;
    border-radius: 999px;
    padding: 0.7rem 1.1rem;
    font-size: 1rem;
    font-weight: 800;
    color: #fff;
    background: var(--ds-primary-color, #5fc99a);
    box-shadow: 0 6px 18px rgba(var(--ds-primary-color-rgb, 95, 201, 154), 0.35);
    transition:
      background 0.15s ease,
      transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .cta:hover {
    transform: translateY(-1px);
  }
  .cta:active {
    transform: scale(0.96);
  }
  .cta:focus-visible {
    outline: 2px solid var(--ds-accent-color, #ea7a2c);
    outline-offset: 2px;
  }

  /* ── Mobile bottom-sheet below 640px ─────────────────────────────── */
  @media (max-width: 639px) {
    .overlay {
      align-items: flex-end;
      padding: 0;
    }
    .box {
      max-width: 100%;
      max-height: 92vh;
      border-radius: 24px 24px 0 0;
      padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
      animation: sheet-in 0.34s
        linear(0, 0.4 7%, 1.05 18%, 1.12 24%, 0.97 47%, 1.005 70%, 1);
    }
    .box.closing {
      animation: sheet-out 0.22s cubic-bezier(0.4, 0, 1, 0.6) forwards;
    }
  }

  /* ── Keyframes ───────────────────────────────────────────────────── */
  @keyframes backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes backdrop-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  @keyframes pop-in {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes pop-out {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.94);
    }
  }
  @keyframes sheet-in {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
  @keyframes sheet-out {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .overlay,
    .overlay.closing,
    .box,
    .box.closing,
    .x,
    .cta {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
