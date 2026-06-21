<script>
  import { createEventDispatcher, onDestroy } from "svelte";

  const dispatch = createEventDispatcher();
  const btn =
    "footer-nav-button btn btn-ghost btn-sm !h-[44px] !min-h-[44px] min-w-11 px-1.5 py-2 text-xs text-gray-600 shadow-none transition-colors duration-150 focus-visible:ring-0 sm:px-3 sm:text-sm";
  let shareStatus = "";
  let timer = null;

  onDestroy(() => timer && clearTimeout(timer));

  function setStatus(msg) {
    if (timer) clearTimeout(timer);
    shareStatus = msg;
    timer = setTimeout(() => ((shareStatus = ""), (timer = null)), 2500);
  }

  async function shareApp() {
    const url =
      typeof window !== "undefined" ? window.location.href : "https://metasplash.app";
    const data = {
      title: "metasplash",
      text: "Tag ya art — stamp your name, copyright & socials onto your work, in your browser.",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setStatus("Shared metasplash");
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setStatus("Link copied");
      } else {
        setStatus("Share unavailable");
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      setStatus("Try again");
    }
  }
</script>

<nav class="flex items-center space-x-1 sm:space-x-2" aria-label="metasplash footer">
  <button type="button" class={btn} on:click={() => dispatch("showIntro")}>
    Intro
  </button>
  <button type="button" class={btn} on:click={() => dispatch("showAbout")}>
    About
  </button>
  <button type="button" class={btn} on:click={() => dispatch("showOptions")}>
    Options
  </button>
  <button type="button" class={btn} on:click={shareApp} aria-label="Share metasplash">
    Share
  </button>
  <span class="sr-only" role="status" aria-live="polite">{shareStatus}</span>
</nav>

<style>
  .footer-nav-button {
    border-radius: 0.75rem;
  }
  .footer-nav-button:hover {
    background-color: var(
      --footer-button-hover-bg,
      rgba(var(--ds-primary-color-rgb, 147, 51, 234), 0.12)
    );
    color: var(--footer-button-hover-color, var(--ds-accent-color, #c026d3));
  }
  .footer-nav-button:focus-visible {
    outline: 2px solid
      var(
        --footer-focus-ring,
        rgba(var(--ds-primary-color-rgb, 147, 51, 234), 0.55)
      );
    outline-offset: 2px;
    background-color: var(
      --footer-button-hover-bg,
      rgba(var(--ds-primary-color-rgb, 147, 51, 234), 0.14)
    );
    color: var(--footer-button-hover-color, var(--ds-accent-color, #c026d3));
  }
</style>
