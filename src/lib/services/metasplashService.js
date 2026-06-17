// ===================================================================
// METASPLASH SERVICE — Client-Side Metadata Writer ("tag ya art")
// ===================================================================
//
// The inverse of metaflush: instead of stripping metadata, this *writes* it.
// Stamp your name, copyright, socials, and credits onto your own work, losslessly,
// 100% in the browser. Nothing is uploaded.
//
// v1 scope (the clean 80/20 write paths — see BUILD.md):
//   • JPEG  → EXIF (piexifjs)            Artist, Copyright, Caption, Date
//   • MP3   → ID3v2 (browser-id3-writer) Artist, Title, Album, Year, Copyright, URL, Comment
// v1.1: PNG/WebP (XMP/tEXt chunks), FLAC (flac-tagger), full IPTC/XMP for
// URL/Credit/Keywords, and a visible-watermark mode (watermarkjs). Heavy libs
// are dynamically imported so they only load for the type you actually drop.

export function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// What kind of file did they drop? Drives which form fields we show.
export function kindOf(file) {
  const n = (file?.name || "").toLowerCase();
  const t = file?.type || "";
  if (t === "image/jpeg" || /\.jpe?g$/.test(n)) return "image-jpeg";
  if (t.startsWith("audio/") || /\.(mp3|m4a)$/.test(n)) return "audio-id3";
  // recognised-but-not-yet-writable (so we can tell the user honestly)
  if (t === "image/png" || /\.png$/.test(n)) return "image-png";
  if (t === "image/webp" || /\.webp$/.test(n)) return "image-webp";
  if (/\.flac$/.test(n)) return "audio-flac";
  return "unknown";
}

// The fields each kind supports, with prefill-from-existing where we can read it.
export const IMAGE_FIELDS = [
  { key: "artist", label: "Artist / Author", placeholder: "Your name" },
  { key: "copyright", label: "Copyright", placeholder: "© 2026 Your Name" },
  { key: "caption", label: "Caption", placeholder: "What is this?" },
  { key: "date", label: "Date", placeholder: "YYYY:MM:DD HH:MM:SS" },
];

export const AUDIO_FIELDS = [
  { key: "artist", label: "Artist", placeholder: "Your name / band" },
  { key: "title", label: "Title", placeholder: "Track title" },
  { key: "album", label: "Album", placeholder: "Album / release" },
  { key: "year", label: "Year", placeholder: "2026" },
  { key: "copyright", label: "Copyright", placeholder: "© 2026 Your Name" },
  { key: "url", label: "URL", placeholder: "https://you.example" },
  { key: "comment", label: "Comment", placeholder: "Anything else" },
];

// ── Read existing tags so the form can prefill (best-effort, never throws) ──
export async function readExistingTags(file) {
  const kind = kindOf(file);
  try {
    if (kind === "image-jpeg") {
      const piexif = (await import("piexifjs")).default;
      const dataUrl = await fileToDataUrl(file);
      const exif = piexif.load(dataUrl);
      const z = exif["0th"] || {};
      const ex = exif["Exif"] || {};
      return {
        artist: z[piexif.ImageIFD.Artist] || "",
        copyright: z[piexif.ImageIFD.Copyright] || "",
        caption: z[piexif.ImageIFD.ImageDescription] || "",
        date:
          ex[piexif.ExifIFD.DateTimeOriginal] ||
          z[piexif.ImageIFD.DateTime] ||
          "",
      };
    }
  } catch {
    /* no readable tags — start blank */
  }
  return {};
}

// ── Write EXIF into a JPEG (lossless: only the APP1 segment is replaced) ──
async function writeJpegExif(file, fields) {
  const piexif = (await import("piexifjs")).default;
  const dataUrl = await fileToDataUrl(file);

  // start from existing EXIF so we don't clobber tags we don't touch
  let exif;
  try {
    exif = piexif.load(dataUrl);
  } catch {
    exif = { "0th": {}, Exif: {}, GPS: {}, "1st": {}, thumbnail: null };
  }
  exif["0th"] = exif["0th"] || {};
  exif["Exif"] = exif["Exif"] || {};

  if (fields.artist) exif["0th"][piexif.ImageIFD.Artist] = fields.artist;
  if (fields.copyright)
    exif["0th"][piexif.ImageIFD.Copyright] = fields.copyright;
  if (fields.caption)
    exif["0th"][piexif.ImageIFD.ImageDescription] = fields.caption;
  if (fields.date) {
    exif["0th"][piexif.ImageIFD.DateTime] = fields.date;
    exif["Exif"][piexif.ExifIFD.DateTimeOriginal] = fields.date;
  }

  const exifBytes = piexif.dump(exif);
  const newDataUrl = piexif.insert(exifBytes, dataUrl);
  const blob = dataUrlToBlob(newDataUrl);
  return { blob, type: "image/jpeg", note: "EXIF stamped" };
}

// ── Write ID3v2 tags into an MP3 (the lib rebuilds the tag frame, lossless audio) ──
async function writeMp3Id3(file, fields) {
  const { ID3Writer } = await import("browser-id3-writer");
  const buffer = await file.arrayBuffer();
  const writer = new ID3Writer(buffer);
  if (fields.artist) writer.setFrame("TPE1", [fields.artist]);
  if (fields.title) writer.setFrame("TIT2", fields.title);
  if (fields.album) writer.setFrame("TALB", fields.album);
  if (fields.year) writer.setFrame("TYER", String(fields.year));
  if (fields.copyright) writer.setFrame("TCOP", fields.copyright);
  if (fields.url) writer.setFrame("WPAY", fields.url);
  if (fields.comment)
    writer.setFrame("COMM", {
      description: "",
      text: fields.comment,
      language: "eng",
    });
  writer.addTag();
  const blob = writer.getBlob();
  return { blob, type: "audio/mpeg", note: "ID3 tags written" };
}

function result(blob, name, type, inputSize, note = "") {
  return {
    blob,
    name,
    type,
    inputSize,
    outputSize: blob.size,
    note,
  };
}

// Stamp the chosen fields onto a single file. Returns a result, or throws with
// a friendly message for unsupported types.
export async function splashFileMetadata(file, fields) {
  const kind = kindOf(file);
  const inputSize = file.size;
  let out;

  if (kind === "image-jpeg") {
    out = await writeJpegExif(file, fields);
  } else if (kind === "audio-id3") {
    out = await writeMp3Id3(file, fields);
  } else if (kind === "image-png" || kind === "image-webp") {
    throw new Error(
      "PNG/WebP tagging is coming soon — convert to JPEG to tag it today.",
    );
  } else if (kind === "audio-flac") {
    throw new Error("FLAC tagging is coming soon — MP3 works today.");
  } else {
    throw new Error("metasplash tags photos (JPEG) and audio (MP3) for now.");
  }

  // photo.jpg -> photo.tagged.jpg
  const dot = file.name.lastIndexOf(".");
  const newName =
    dot !== -1
      ? file.name.slice(0, dot) + ".tagged" + file.name.slice(dot)
      : file.name + ".tagged";

  return result(out.blob, newName, out.type, inputSize, out.note);
}

// ── helpers ──
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl) {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] || "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
