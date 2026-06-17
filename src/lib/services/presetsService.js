// ===================================================================
// PRESETS — saved tag sets ("My studio" → Artist + © + socials), persisted.
// ===================================================================
// Tag fields are tiny text, so localStorage is the perfect home: your presets
// survive across visits forever. (The tagged *files* don't live here — those
// are session-only, held in memory; see the page's session history.)

import { writable } from "svelte/store";
import { browser } from "$app/environment";

const KEY = "metasplash-presets";
const MAX = 12;

function load() {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export const presets = writable(load());

function persist(list) {
  presets.set(list);
  if (browser) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* quota / private mode — keep the in-memory copy */
    }
  }
}

/** Save the current fields as a named preset (dedupes by name, newest first). */
export function savePreset(name, fields) {
  const clean = (name || "").trim() || "Untitled";
  // only keep non-empty fields
  const kept = Object.fromEntries(
    Object.entries(fields || {}).filter(([, v]) => v && String(v).trim()),
  );
  if (!Object.keys(kept).length) return false;
  let list = load().filter((p) => p.name !== clean);
  list.unshift({ name: clean, fields: kept });
  if (list.length > MAX) list = list.slice(0, MAX);
  persist(list);
  return true;
}

export function deletePreset(name) {
  persist(load().filter((p) => p.name !== name));
}

/** A short human summary of which fields a preset carries. */
export function presetSummary(preset) {
  const labels = {
    artist: "Artist",
    copyright: "©",
    caption: "Caption",
    date: "Date",
    title: "Title",
    album: "Album",
    year: "Year",
    url: "URL",
    comment: "Comment",
  };
  return Object.keys(preset.fields || {})
    .map((k) => labels[k] || k)
    .join(" · ");
}
