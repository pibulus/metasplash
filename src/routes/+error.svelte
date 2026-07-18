<script>
  import { page } from "$app/stores";
  import { Mascot } from "$lib/components/mascot";
  import PageLayout from "$lib/components/layout/PageLayout.svelte";
  import { theme } from "$lib";
</script>

<PageLayout appName="metasplash">
  <div class="flex w-full flex-col items-center gap-5 text-center">
    <div class="mascot-slot h-40 w-40 sm:h-44 sm:w-44">
      <Mascot
        character="documentghost"
        eyes="steady"
        accessory="none"
        theme={$theme}
        ariaLabel="metasplash — page not found"
      />
    </div>

    <h1 class="text-2xl font-extrabold" style="color: var(--ds-ink, #2a2233);">
      {$page.status === 404 ? "Nothing tagged here" : "Something slipped"}
    </h1>
    <p class="max-w-xs text-sm" style="color: #8b8194;">
      {$page.status === 404
        ? "That page doesn't exist — the file you're after never made it in."
        : ($page.error?.message ?? "metasplash hit a snag. Try again.")}
    </p>

    <a
      href="/"
      class="mt-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:scale-105"
      style="background: var(--ds-primary-color, #10b981);"
    >
      Back to metasplash
    </a>
  </div>
</PageLayout>
