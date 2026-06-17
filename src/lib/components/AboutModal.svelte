<script>
  import Modal from "./Modal.svelte";
  export let open = false;
</script>

<Modal {open} title="About metasplash" icon="💦" on:close>
  <div class="about">
    <p>
      <strong>Tag ya art.</strong> Stamp your name, copyright, and socials onto your
      own work before you share it — so the file carries who made it, wherever it
      goes. metaflush strips metadata; metasplash <em>signs</em> it.
    </p>
    <ul>
      <li>
        <span class="b">✦</span> Photos get EXIF, audio gets ID3 — written
        <strong>losslessly</strong> (your pixels and samples are untouched).
      </li>
      <li>
        <span class="b">✦</span> It all happens in your browser. Nothing is uploaded,
        nothing is tracked.
      </li>
      <li>
        <span class="b">✦</span> Save your details as a preset once, stamp them on
        everything after with a click.
      </li>
    </ul>
    <p class="quote">"Sign your work."</p>
    <p class="sig">
      Made with 🖊️ in Melbourne ·
      <a
        href="https://github.com/pibulus"
        target="_blank"
        rel="noopener noreferrer">Pablo / Pibulus</a
      >
    </p>
  </div>
</Modal>

<style>
  .about {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
  }
  .about ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .about li {
    display: flex;
    gap: 0.5rem;
    font-size: 0.88rem;
  }
  .b {
    color: var(--ds-primary-color, #5fc99a);
    font-weight: 800;
  }
  .quote {
    border-left: 4px solid var(--ds-primary-color, #5fc99a);
    padding-left: 0.8rem;
    font-style: italic;
    font-weight: 700;
    color: #4a7c63;
  }
  .sig {
    font-size: 0.72rem;
    color: #7c9389;
  }
  .sig a {
    text-decoration: underline;
  }
</style>
