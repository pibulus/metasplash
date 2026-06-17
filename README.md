# metasplash 💦

**Tag ya art.** Drop a photo or track on the mascot and stamp your name, copyright,
socials, and credits onto it — **losslessly** (no re-encode), 100% in your browser.
Nothing is uploaded. The inverse of [metaflush](https://github.com/pibulus/metaflush):
metaflush strips metadata, metasplash _signs_ it.

## Why

Artists, photographers, and musicians want to claim their work before they post or
send it. metasplash writes that ownership in — your name in the EXIF, your copyright in
the ID3 — so the file carries it wherever it goes. Not "fake the location"; _sign your
work._

## What you can tag (v1)

- **Photos (JPEG)** → EXIF: Artist, Copyright, Caption, Date
- **Audio (MP3)** → ID3v2: Artist, Title, Album, Year, Copyright, URL, Comment

Drop → the form prefills from any tags already on the file → edit → download the
tagged copy (`name.tagged.jpg`).

## Roadmap (v1.1)

- PNG/WebP tagging (XMP / `tEXt` chunks) and FLAC (Vorbis comments via `flac-tagger`)
- Full IPTC/XMP so Credit / URL / Keywords land in their proper fields
- A **visible watermark** mode (burn a signature onto the image) via `watermarkjs`
- Contributor: batch-tag a whole album/shoot, saved presets, import/export tag sets

## Stack

SvelteKit · Svelte 5 · Tailwind + DaisyUI · `@sveltejs/adapter-node`.
Core: `src/lib/services/metasplashService.js` — `piexifjs` (EXIF write) +
`browser-id3-writer` (ID3 write), both client-side, lazy-loaded.
Living mascot via the [softstack-mascot](https://github.com/pibulus/softstack-mascot) kit.

## Dev

```bash
npm install
npm run dev      # http://localhost:3006
npm run build
npm run check
```

## Themes

Four themes (Ink / Wash / Canvas / Neon) via `html[data-theme]` + CSS vars.

## Status

Scaffolded from the metaflush mold (see `BUILD.md` for the clone+swap). Core EXIF/ID3
write verified — exiftool reads the stamped tags back. Still to do before launch: a
paint/stamp mascot (currently the toiletroll placeholder), the icon + og-image set,
the About/Options modal suite, and the v1.1 reach above.

## Deploy

Self-hosted on a Raspberry Pi (`pibulus-os` `deploy_app.sh` node-build pattern).
Target domain: **metasplash.app** (port 3006 dev).

---

Part of the drag-into-mascot micro-app family: DrShrink (shrink) · metaflush (scrub) ·
cryptkeep (lock) · **metasplash (tag)**.
