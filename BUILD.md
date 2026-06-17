# metasplash 💦 — build-out plan

> **Tag ya art.** Stamp your name, copyright, socials, and credits onto your work
> before you send it into the world — photos, audio, whatever. Losslessly, 100% in
> your browser. metaflush _strips_ metadata; metasplash _signs_ it.

The pitch isn't "edit EXIF" (niche) and it definitely isn't "fake where this was
taken" (sketchy). It's **claim your work** — the thing every artist/musician/photographer
low-key wants before they post or send a file. Warm, creator-friendly, on-brand.

Cheapest app in the family to build: **it's metaflush with one service swapped.**
~95% of the code copies over unchanged.

---

## Vibe & framing

- Voice: "This is mine. Hands off. Here's where to find me." Proud, a little cheeky,
  creator-solidarity ("software is politics" energy — artists owning their work).
- Tagline candidates: _"Tag ya art."_ · _"Sign your work."_ · _"Stamp it. Claim it. Ship it."_
- Mascot idea (from iconmakeit): a little paint-splat / spray-can / rubber-stamp guy.
- The "one fun option": a 🎲 that fills in playful defaults, or a "make it loud"
  toggle that also burns a _visible_ watermark (see v1.1).

## What you can tag

- **Images** (jpg/png/webp) → EXIF/IPTC/XMP: Artist, Copyright, Credit, Caption,
  Contact/URL, Keywords, Date.
- **Audio** (mp3/m4a/flac) → ID3 tags: Artist, Title, Album, Year, Copyright,
  Comment, URL. _(This is the angle that makes it more than "EXIF editor" — musicians
  tagging tracks before they share is a real, frequent need.)_
- Same drop-anything family UX; the form adapts to the file type.

---

## The big idea: copy metaflush wholesale, swap one file

metaflush is a complete SoftStack app. Of its ~38 source files, **only TWO are
metaflush-specific** — the rest is the shared kit (mascot, shell, themes, ui, layout).

### Step 1 — clone metaflush

```bash
cp -r ~/Projects/active/apps/metaflush ~/Projects/active/apps/metasplash
cd ~/Projects/active/apps/metasplash
rm -rf .git node_modules build .svelte-kit data
```

### Step 2 — copy unchanged ✅

The whole shared kit comes over as-is: `mascot/**` (swap art only), `ui/**`,
`layout/PageLayout`, `FooterComponent`, `AnimatedTitle`, `lib/index.js` (theme store),
`theme-variables.css`, `app.css`, and all the config (vite/svelte/eslint/postcss/jsconfig).

### Step 3 — the ONE real swap: the service 🔧

`metadataService.js` (strips segments) → `metasplashService.js` (writes them). Same
parsing, inverse op:

- **Images / EXIF (80/20):** use **`piexifjs`** — tiny, browser, JPEG EXIF read+write
  (`piexif.load` to prefill, `piexif.insert` to write). Lazy-load it. PNG/WebP tagging
  is a v1.1 (write `tEXt`/XMP chunks).
- **Audio / ID3:** use **`browser-id3-writer`** (writes ID3v2 to mp3, tiny) +
  read existing tags to prefill. Lazy-load.
- **Lossless** — rewrite the metadata segments/frames, never touch the pixels/samples.
- Mirror metaflush's function shape so the page barely changes:
  `splashFileMetadata(file, fields) -> { blob, name, type, inputSize, outputSize, note }`.

### Step 4 — the page: drop → tag form → download 🖊️

Instead of "drop → auto-clean", it's "drop → **edit form prefilled from existing
tags** → apply → download." Form fields adapt to file type (photo fields vs track
fields). Drop-zone, mascot, history, sounds, modals, supporter all carry over.

### Step 5 — rebrand (names, copy, art) 🎨

- Names/meta: `metaflush`→`metasplash` in package.json (dev port → **3006**), app.html
  (title/og/canonical → metasplash.app/theme-color), PageLayout title, footer,
  AnimatedTitle, constants STORAGE_KEYS (`metasplash-*`), service header.
- New mascot art in `mascot/art/` (paint-splat/spray-can); drop the toiletroll; set
  default `character` + `defineMascotThemes` palette.
- ⚠️ Keep `build.assetsInlineLimit` excluding `mascot/art/*.svg` (the small-SVG inline
  bug — already fixed in the copied config).
- Icons via `rsvg-convert` (NOT ImageMagick — no SVG gradients). dr_shrink has the recipe.

### Step 6 — wire, verify, ship

- `npm install` (+ `piexifjs`, `browser-id3-writer`), `npm run check` (0 errors), dev :3006
- Verify: tag a JPEG's Artist/Copyright → `exiftool` shows the tags present; tag an
  mp3's artist/title → it reads back in a player. (Inverse of metaflush's verification.)
- `git init` + `gh repo create pibulus/metasplash --private --source=. --push`
- Deploy: `metasplash)` case in Pi `deploy_app.sh` (free port via `ss -tlnp` — 9016
  was a hidden service!), systemd unit, cloudflared → metasplash.app (register on
  Porkbun → Cloudflare).

---

## Contributor unlock (mirror DrShrink's "more control")

Free = tag the common fields, one file at a time. Contributor =

- **batch-tag a whole drop** (album of tracks / shoot of photos in one go)
- **saved presets** — your studio's copyright block / socials, one click
- **visible watermark** option (burn a signature onto the image, not just metadata)
- import/export tag sets

## v1.1+ ideas

- **Visible watermark** for images (a real "tag ya art" flex — corner signature/logo).
- PNG/WebP XMP tagging, more ID3 frames, cover-art embedding for audio.
- "Receipt" — a little card showing what you stamped.

## Status

📁 Folder + this doc only. Not scaffolded yet. Ranks below Corruptor (pure fun) and
shipping the already-built siblings, but it's a ~half-day build and a genuinely good
creator tool once reframed as "tag/sign your art." Part of the drag-into-mascot family.
