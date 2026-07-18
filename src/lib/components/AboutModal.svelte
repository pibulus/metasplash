<script>
  // metasplash about — opened via the footer's showAbout event.
  // Converged to the shared SKELETON (matches IntroModal): warm-dark blurred
  // backdrop (tap-to-close), spring-in open + animate-out close (closing flag
  // held before unmount), 44px circular X (top-right 1rem, scale-hover, focus
  // ring), centred floating card at every breakpoint.
  // prefers-reduced-motion = instant. Real document-ghost mascot, no 💦 emoji.
  // SKIN stays 100% metasplash: mint→teal, "tag ya art" / "sign your work" voice.
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
    // Matches the 180ms close animation in this file's <style>.
    setTimeout(() => {
      closing = false;
      dispatch("close");
    }, 180);
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
      aria-labelledby="about-title"
      tabindex="-1"
      on:click|stopPropagation
      on:keydown|stopPropagation
    >
      <button class="x" on:click={requestClose} aria-label="Close about">
        <span aria-hidden="true">×</span>
      </button>

      <div class="mascot-slot" aria-hidden="true">
        <ThemeMascot theme={$theme} size="92px" />
      </div>

      <h2 id="about-title">About metasplash</h2>
      <p class="lede">
        <strong>Tag ya art.</strong> Stamp your name, copyright, and socials
        onto your own work before you share it — so the file carries who made
        it, wherever it goes. metaflush strips metadata; metasplash
        <em>signs</em> it.
      </p>

      <ul class="points">
        <li>
          <span class="b">✦</span> Photos get EXIF, audio gets ID3 — written
          <strong>losslessly</strong>. Your pixels and samples stay untouched.
        </li>
        <li>
          <span class="b">✦</span> It all happens in your browser. Nothing is uploaded,
          nothing is tracked.
        </li>
        <li>
          <span class="b">✦</span> Save your details as a preset once, stamp them
          on everything after with a click.
        </li>
      </ul>

      <p class="quote">"Sign your work."</p>

      <p class="local">
        🔒 Runs fully in your browser. Your files never leave your device.
      </p>

      <nav class="links" aria-label="Links">
        <a
          class="link"
          href="https://github.com/pibulus"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="link-ico" aria-hidden="true">⌥</span> GitHub
        </a>
        <a
          class="link"
          href="https://ko-fi.com/madebypablo"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="link-ico" aria-hidden="true">☕</span> Ko-fi
        </a>
      </nav>

      <p class="sig">
        Made with 🖊️ in Melbourne ·
        <a
          href="https://github.com/pibulus"
          target="_blank"
          rel="noopener noreferrer">Pablo / Pibulus</a
        >
      </p>
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
    animation: backdrop-out 0.18s ease-out forwards;
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
    /* Rise with one small overshoot (the 1.06 ease) — family reference motion. */
    animation: pop-in 0.28s cubic-bezier(0.16, 0.84, 0.24, 1.06);
  }
  .box.closing {
    animation: pop-out 0.18s cubic-bezier(0.4, 0, 0.24, 1) forwards;
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
    margin-bottom: 1.1rem;
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
  .quote {
    border-left: 4px solid var(--ds-primary-color, #5fc99a);
    padding-left: 0.8rem;
    text-align: left;
    font-style: italic;
    font-weight: 700;
    color: #4a7c63;
    margin-bottom: 1rem;
  }
  .local {
    font-size: 0.78rem;
    line-height: 1.45;
    color: #7c9389;
    margin-bottom: 1rem;
  }

  /* ── Link set: ~44px tap targets ─────────────────────────────────── */
  .links {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
  }
  .link {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 44px;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.86rem;
    font-weight: 700;
    color: var(--ds-ink, #16352a);
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.06);
    transition:
      transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.15s ease;
  }
  .link:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
  }
  .link:active {
    transform: scale(0.96);
  }
  .link:focus-visible {
    outline: 2px solid var(--ds-primary-color, #5fc99a);
    outline-offset: 2px;
  }
  .link-ico {
    color: var(--ds-primary-color, #5fc99a);
    font-weight: 800;
  }

  .sig {
    font-size: 0.72rem;
    color: #7c9389;
  }
  .sig a {
    text-decoration: underline;
  }

  /* Centered floating card at every breakpoint — no mobile bottom sheet. */

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
  /* Rise with one small overshoot (the 1.06 ease), no rotation. */
  @keyframes pop-in {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.96);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @keyframes pop-out {
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
    .box.closing,
    .x,
    .link {
      animation: none !important;
      transition: none !important;
    }
  }
</style>
