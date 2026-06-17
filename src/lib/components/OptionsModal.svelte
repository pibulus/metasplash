<script>
  import Modal from "./Modal.svelte";
  import ThemeMascot from "./ThemeMascot.svelte";
  import { theme, applyTheme } from "$lib";
  import { THEME_LIST } from "$lib/constants.js";
  import {
    presets,
    savePreset,
    deletePreset,
    presetSummary,
  } from "$lib/services/presetsService.js";
  import { createEventDispatcher } from "svelte";

  export let open = false;
  // the fields currently in the tag form, so "save current" can capture them
  export let currentFields = {};

  const dispatch = createEventDispatcher();

  let newName = "";
  let justSaved = false;

  $: hasCurrent = Object.values(currentFields || {}).some(
    (v) => v && String(v).trim(),
  );

  function save() {
    if (savePreset(newName, currentFields)) {
      newName = "";
      justSaved = true;
      setTimeout(() => (justSaved = false), 1200);
    }
  }

  function apply(p) {
    dispatch("applyPreset", p.fields);
    dispatch("close");
  }
</script>

<Modal {open} title="Options" icon="🔖" on:close>
  <div class="rows">
    <!-- Saved presets -->
    <section class="block">
      <span class="label">Your presets</span>

      <div class="save-row" class:saved={justSaved}>
        <input
          type="text"
          bind:value={newName}
          placeholder="name this preset…"
          aria-label="Preset name"
          on:keydown={(e) => e.key === "Enter" && save()}
        />
        <button
          class="save"
          on:click={save}
          disabled={!hasCurrent}
          title={hasCurrent
            ? "Save the tags you're editing"
            : "Fill in some tags first"}
        >
          {justSaved ? "saved ✓" : "save current"}
        </button>
      </div>

      {#if $presets.length}
        <ul class="presets">
          {#each $presets as p (p.name)}
            <li>
              <button class="apply" on:click={() => apply(p)}>
                <span class="p-name">{p.name}</span>
                <span class="p-sum">{presetSummary(p)}</span>
              </button>
              <button
                class="del"
                aria-label={`Delete ${p.name}`}
                on:click={() => deletePreset(p.name)}>×</button
              >
            </li>
          {/each}
        </ul>
      {:else}
        <p class="empty">
          Fill the tag form, then save your name / copyright / socials here — one
          click to stamp them on everything after.
        </p>
      {/if}
    </section>

    <!-- Vibe -->
    <section class="block">
      <span class="label">Vibe</span>
      <div class="vibes" role="group" aria-label="Theme">
        {#each THEME_LIST as t}
          <button
            class="vibe"
            class:on={$theme === t.id}
            title={t.label}
            aria-label="{t.label} vibe"
            aria-pressed={$theme === t.id}
            on:click={() => applyTheme(t.id)}
          >
            <span class="vibe-art"><ThemeMascot theme={t.id} size="38px" /></span>
            <span class="vibe-name">{t.label}</span>
            {#if $theme === t.id}<span class="vibe-check" aria-hidden="true">✓</span>{/if}
          </button>
        {/each}
      </div>
    </section>
  </div>
</Modal>

<style>
  .rows {
    display: flex;
    flex-direction: column;
    gap: 1.3rem;
  }
  .block {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .label {
    font-weight: 800;
    color: var(--ds-ink, #16352a);
  }

  .save-row {
    display: flex;
    gap: 0.5rem;
  }
  .save-row input {
    flex: 1;
    min-width: 0;
    border-radius: 12px;
    border: 2px solid rgba(0, 0, 0, 0.12);
    padding: 0.45rem 0.7rem;
    font-size: 0.9rem;
    background: #fff;
  }
  .save-row input:focus {
    outline: none;
    border-color: var(--ds-primary-color, #5fc99a);
  }
  .save {
    flex-shrink: 0;
    border-radius: 999px;
    background: var(--ds-primary-color, #5fc99a);
    padding: 0.45rem 0.85rem;
    font-size: 0.82rem;
    font-weight: 800;
    color: #16352a;
    transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .save:active {
    transform: scale(0.94);
  }
  .save:disabled {
    opacity: 0.45;
  }
  /* a happy spring when a preset is saved */
  .save-row.saved .save {
    animation: pop 0.5s linear(0, 0.4 7%, 1.15 22%, 0.96 47%, 1.01 70%, 1);
  }
  @keyframes pop {
    0%,
    100% {
      transform: scale(1);
    }
  }

  .presets {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .presets li {
    display: flex;
    align-items: stretch;
    gap: 0.4rem;
  }
  .apply {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.1rem;
    border-radius: 12px;
    border: 2px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.6);
    padding: 0.5rem 0.7rem;
    text-align: left;
    transition:
      transform 0.12s ease,
      border-color 0.12s ease;
  }
  .apply:hover {
    border-color: var(--ds-primary-color, #5fc99a);
    transform: translateY(-1px);
  }
  .p-name {
    font-weight: 800;
    font-size: 0.9rem;
    color: var(--ds-ink, #16352a);
  }
  .p-sum {
    font-size: 0.72rem;
    color: #7c9389;
  }
  .del {
    flex-shrink: 0;
    width: 2rem;
    border-radius: 12px;
    border: 2px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.4);
    font-size: 1.1rem;
    font-weight: 800;
    color: #b08;
    color: #c4756f;
  }
  .del:hover {
    background: #fdecea;
  }
  .empty {
    font-size: 0.82rem;
    color: #7c9389;
    line-height: 1.5;
  }

  .vibes {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  .vibe {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    padding: 0.55rem 0.25rem 0.45rem;
    border-radius: 14px;
    border: 2px solid rgba(0, 0, 0, 0.08);
    background: rgba(255, 255, 255, 0.55);
    transition:
      transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
      border-color 0.15s ease;
  }
  .vibe:hover {
    transform: translateY(-2px);
  }
  .vibe.on {
    border-color: var(--ds-primary-color, #5fc99a);
    box-shadow: 0 0 0 2px rgba(95, 201, 154, 0.35);
  }
  .vibe-art {
    line-height: 0;
    transition: transform 0.2s ease;
  }
  .vibe:hover .vibe-art {
    transform: scale(1.08);
  }
  .vibe-name {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--ds-ink, #16352a);
  }
  .vibe-check {
    position: absolute;
    top: -6px;
    right: -6px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--ds-primary-color, #5fc99a);
    color: #16352a;
    font-size: 0.65rem;
    font-weight: 800;
  }

  @media (prefers-reduced-motion: reduce) {
    .save,
    .vibe,
    .vibe-art,
    .apply,
    .save-row.saved .save {
      transition: none;
      animation: none;
    }
    .vibe:hover,
    .vibe:hover .vibe-art,
    .apply:hover {
      transform: none;
    }
  }
</style>
