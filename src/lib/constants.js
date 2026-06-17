// metasplash constants
// NOTE: theme *ids* are inherited from the mold (clean/porcelain/kraft/lavender)
// so the mascot gradient engine + theme-variables.css keep working untouched.
// Only the labels are rebranded for the "tag ya art" voice. Renaming the ids is
// a v1.1 polish (touches ~17 mascot-engine files) — not worth the churn now.

export const THEMES = {
  CLEAN: "clean", // default — warm signature "Ink"
  PORCELAIN: "porcelain", // cool "Wash"
  KRAFT: "kraft", // organic "Canvas"
  LAVENDER: "lavender", // bright "Neon"
};

export const THEME_LIST = [
  { id: THEMES.CLEAN, label: "Ink" },
  { id: THEMES.PORCELAIN, label: "Wash" },
  { id: THEMES.KRAFT, label: "Canvas" },
  { id: THEMES.LAVENDER, label: "Neon" },
];

export const DEFAULT_THEME = THEMES.CLEAN;

export const STORAGE_KEYS = {
  THEME: "metasplash-theme",
};
