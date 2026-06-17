<script>
  import { Mascot } from "$lib/components/mascot";
  import PageLayout from "$lib/components/layout/PageLayout.svelte";
  import AnimatedTitle from "$lib/components/AnimatedTitle.svelte";
  import FooterComponent from "$lib/components/FooterComponent.svelte";
  import OptionsModal from "$lib/components/OptionsModal.svelte";
  import AboutModal from "$lib/components/AboutModal.svelte";
  import {
    splashFileMetadata,
    readExistingTags,
    kindOf,
    IMAGE_FIELDS,
    AUDIO_FIELDS,
    formatBytes,
    downloadBlob,
  } from "$lib/services/metasplashService.js";
  import { theme, applyTheme } from "$lib";
  import { THEME_LIST } from "$lib/constants.js";

  let mascot;
  let dragOver = false;
  let busy = false;
  let error = "";
  let showOptions = false;
  let showAbout = false;

  // flow: idle → form (file picked, editing tags) → done (tagged, downloadable)
  let phase = "idle";
  /** @type {File|null} */
  let file = null;
  let kind = "unknown";
  let fields = {};
  /** @type {{name,blob,type,inputSize,outputSize,note}|null} */
  let tagged = null;

  // Session history — tagged files stay re-downloadable until reload (the blobs
  // live in memory; localStorage can't hold MB-sized files, so this is honest).
  /** @type {Array<{name,blob,type,outputSize}>} */
  let session = [];

  $: fieldDefs = kind === "audio-id3" ? AUDIO_FIELDS : IMAGE_FIELDS;

  async function handleFile(f) {
    error = "";
    tagged = null;
    file = f;
    kind = kindOf(f);

    if (kind === "image-png" || kind === "image-webp") {
      error = "PNG/WebP tagging is coming soon — convert to JPEG to tag it today.";
      phase = "idle";
      return;
    }
    if (kind === "audio-flac") {
      error = "FLAC tagging is coming soon — MP3 works today.";
      phase = "idle";
      return;
    }
    if (kind === "unknown") {
      error = "metasplash tags photos (JPEG) and audio (MP3) for now.";
      phase = "idle";
      return;
    }

    busy = true;
    mascot?.startThinking();
    fields = await readExistingTags(f); // prefill from any existing tags
    busy = false;
    mascot?.stopThinking();
    phase = "form";
  }

  async function applyTags() {
    if (!file) return;
    error = "";
    busy = true;
    mascot?.startThinking();
    try {
      tagged = await splashFileMetadata(file, fields);
      session = [
        { name: tagged.name, blob: tagged.blob, type: tagged.type, outputSize: tagged.outputSize },
        ...session,
      ];
      mascot?.react(12);
      phase = "done";
    } catch (e) {
      error = e.message;
    }
    busy = false;
    mascot?.stopThinking();
  }

  function applyPreset(newFields) {
    fields = { ...fields, ...newFields };
  }

  function reset() {
    phase = "idle";
    file = null;
    tagged = null;
    fields = {};
    error = "";
  }

  function onDrop(e) {
    e.preventDefault();
    dragOver = false;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }
  function onPick(e) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = "";
  }
</script>

<PageLayout>
  <div class="flex w-full flex-col items-center gap-5">
    <div class="mascot-slot">
      <Mascot
        bind:this={mascot}
        character="documentghost"
        accessory="none"
        theme={$theme}
        {busy}
        ariaLabel="metasplash — choose a file"
        on:activate={() => document.getElementById("file-input")?.click()}
      />
    </div>

    <AnimatedTitle
      title="metasplash"
      subtitle="Tag ya art. Stamp your name, copyright & socials onto your work before you ship it — photos and audio, 100% in your browser."
    />

    {#if phase === "idle"}
      <!-- Drop zone -->
      <label
        for="file-input"
        class="drop"
        class:drop-over={dragOver}
        class:drop-busy={busy}
        on:dragover|preventDefault={() => (dragOver = true)}
        on:dragleave={() => (dragOver = false)}
        on:drop={onDrop}
      >
        <input
          id="file-input"
          type="file"
          accept="image/jpeg,audio/mpeg,.jpg,.jpeg,.mp3"
          class="sr-only"
          aria-label="Choose a file to tag"
          on:change={onPick}
        />
        {#if busy}
          <span class="drop-text">Reading…</span>
        {:else}
          <span class="drop-text">Drop your work here</span>
          <span class="drop-sub">a photo (JPEG) or a track (MP3) · nothing leaves your device</span>
        {/if}
      </label>
    {/if}

    {#if error}
      <p class="error">{error}</p>
    {/if}

    {#if phase === "form" && file}
      <!-- Tag form — prefilled from existing tags, fields adapt to file type -->
      <div class="card">
        <p class="card-head">
          Tagging <strong>{file.name}</strong>
          <span class="kind">{kind === "audio-id3" ? "audio · ID3" : "photo · EXIF"}</span>
        </p>
        <div class="fields">
          {#each fieldDefs as f}
            <label class="field">
              <span class="field-label">{f.label}</span>
              <input
                type="text"
                bind:value={fields[f.key]}
                placeholder={f.placeholder}
                autocomplete="off"
                spellcheck="false"
              />
            </label>
          {/each}
        </div>
        <div class="actions">
          <button class="ghost" on:click={reset}>cancel</button>
          <button class="primary" on:click={applyTags} disabled={busy}>
            {busy ? "Stamping…" : "Tag it 🔖"}
          </button>
        </div>
      </div>
    {/if}

    {#if phase === "done" && tagged}
      <div class="card done">
        <p class="card-head">Tagged! ✨</p>
        <p class="done-meta">
          {tagged.name}
          <span class="muted"
            >· {formatBytes(tagged.inputSize)} → {formatBytes(tagged.outputSize)} · {tagged.note}</span
          >
        </p>
        <div class="actions">
          <button class="ghost" on:click={reset}>tag another</button>
          <button class="primary" on:click={() => downloadBlob(tagged.blob, tagged.name)}>
            Download
          </button>
        </div>
      </div>
    {/if}

    <!-- Session history — re-download anything tagged this visit -->
    {#if session.length}
      <details class="history" open>
        <summary>Tagged this session ({session.length})</summary>
        <ul>
          {#each session as h, i (h.name + i)}
            <li>
              <span class="h-name" title={h.name}>{h.name}</span>
              <span class="h-size">{formatBytes(h.outputSize)}</span>
              <button class="h-dl" on:click={() => downloadBlob(h.blob, h.name)}>
                ↓
              </button>
            </li>
          {/each}
        </ul>
        <p class="history-note">stays here until you reload — files live in memory, never uploaded</p>
      </details>
    {/if}

    <!-- Theme switcher -->
    <div class="themes" role="group" aria-label="Theme">
      {#each THEME_LIST as t}
        <button
          class="theme-dot theme-{t.id}"
          class:on={$theme === t.id}
          title={t.label}
          aria-label={t.label}
          aria-pressed={$theme === t.id}
          on:click={() => applyTheme(t.id)}
        ></button>
      {/each}
    </div>
  </div>

  <svelte:fragment slot="footer-buttons">
    <FooterComponent
      on:showAbout={() => (showAbout = true)}
      on:showOptions={() => (showOptions = true)}
    />
  </svelte:fragment>
</PageLayout>

<AboutModal open={showAbout} on:close={() => (showAbout = false)} />
<OptionsModal
  open={showOptions}
  currentFields={fields}
  on:applyPreset={(e) => applyPreset(e.detail)}
  on:close={() => (showOptions = false)}
/>

<style>
  .mascot-slot {
    width: 168px;
    height: 168px;
  }

  .drop {
    position: relative;
    width: 100%;
    min-height: 150px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    cursor: pointer;
    border-radius: 24px;
    border: 4px dashed rgba(var(--ds-primary-color-rgb, 245, 158, 66), 0.4);
    background: rgba(255, 255, 255, 0.5);
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      transform 0.15s ease;
  }
  .drop:hover {
    border-color: rgba(var(--ds-primary-color-rgb, 245, 158, 66), 0.7);
  }
  .drop:active {
    transform: scale(0.985);
  }
  .drop-over {
    border-color: var(--ds-primary-color, #f59e42);
    background: rgba(var(--ds-primary-color-rgb, 245, 158, 66), 0.1);
    transform: scale(1.01);
  }
  .drop-busy {
    border-style: solid;
  }
  .drop-text {
    font-size: 1.2rem;
    font-weight: 800;
    color: var(--ds-ink, #2a2233);
  }
  .drop-sub {
    font-size: 0.82rem;
    color: #8b8194;
    text-align: center;
  }

  .error {
    border-radius: 0.75rem;
    border: 2px solid #fca5a5;
    background: #fef2f2;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #dc2626;
    text-align: center;
  }

  .card {
    width: 100%;
    border-radius: 20px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    background: #fff;
    padding: 1.1rem 1.15rem;
  }
  .card-head {
    font-weight: 800;
    color: var(--ds-ink, #2a2233);
    margin-bottom: 0.85rem;
  }
  .card-head .kind {
    display: inline-block;
    margin-left: 0.5rem;
    font-size: 0.7rem;
    font-weight: 700;
    color: #9b9199;
  }
  .fields {
    display: flex;
    flex-direction: column;
    gap: 0.7rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .field-label {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: #8b8194;
  }
  .field input {
    width: 100%;
    border-radius: 12px;
    border: 2px solid rgba(0, 0, 0, 0.12);
    padding: 0.55rem 0.7rem;
    font-size: 0.95rem;
    color: var(--ds-ink, #2a2233);
    background: #fff;
  }
  .field input:focus {
    outline: none;
    border-color: var(--ds-primary-color, #f59e42);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 1rem;
  }
  .primary,
  .ghost {
    border-radius: 999px;
    padding: 0.5rem 1.1rem;
    font-size: 0.9rem;
    font-weight: 800;
    transition:
      background 0.15s ease,
      transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .primary {
    background: var(--ds-primary-color, #f59e42);
    color: #fff;
  }
  .primary:active {
    transform: scale(0.94);
  }
  .primary:disabled {
    opacity: 0.6;
  }
  .ghost {
    color: #8b8194;
  }

  .done .card-head {
    color: var(--ds-accent-color, #ea7a2c);
  }
  .done-meta {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--ds-ink, #2a2233);
  }
  .done-meta .muted {
    font-weight: 500;
    color: #9b9199;
  }

  /* Session history — re-download list */
  .history {
    width: 100%;
    font-size: 0.85rem;
  }
  .history summary {
    cursor: pointer;
    font-weight: 700;
    color: #4a7c63;
    padding: 0.3rem 0.25rem;
    user-select: none;
  }
  .history ul {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.4rem 0 0.2rem;
  }
  .history li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border-radius: 12px;
    border: 2px solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.6);
    padding: 0.4rem 0.6rem;
  }
  .h-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 700;
    color: var(--ds-ink, #16352a);
  }
  .h-size {
    flex-shrink: 0;
    font-size: 0.75rem;
    color: #9b9199;
  }
  .h-dl {
    flex-shrink: 0;
    width: 1.9rem;
    height: 1.9rem;
    border-radius: 999px;
    background: var(--ds-primary-color, #5fc99a);
    color: #16352a;
    font-weight: 900;
    transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .h-dl:active {
    transform: scale(0.9);
  }
  .history-note {
    margin-top: 0.4rem;
    font-size: 0.72rem;
    color: #9bb0a6;
    text-align: center;
  }

  .themes {
    display: flex;
    gap: 0.6rem;
    margin-top: 0.5rem;
  }
  .theme-dot {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: 3px solid rgba(0, 0, 0, 0.12);
    cursor: pointer;
    transition:
      transform 0.12s ease,
      border-color 0.12s ease;
  }
  .theme-dot:hover {
    transform: scale(1.12);
  }
  .theme-dot.on {
    border-color: rgba(0, 0, 0, 0.55);
    transform: scale(1.12);
  }
  .theme-clean {
    background: linear-gradient(135deg, #f59e42, #fbbf24);
  }
  .theme-porcelain {
    background: linear-gradient(135deg, #38bdf8, #22d3ee);
  }
  .theme-kraft {
    background: linear-gradient(135deg, #a8a29e, #d6c7a1);
  }
  .theme-lavender {
    background: linear-gradient(135deg, #c084fc, #e879f9);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .drop,
    .drop:active,
    .drop-over,
    .primary:active,
    .theme-dot,
    .theme-dot:hover {
      transition: none;
      transform: none;
    }
  }
</style>
