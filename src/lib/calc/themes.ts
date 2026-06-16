/**
 * Theme presets. Each theme is a map of CSS custom-property → value. They
 * are applied by writing onto document.documentElement.style; the "noir"
 * preset is the as-shipped look in styles.css, so it clears overrides.
 *
 * Themes can be selected from the Workspace sidebar; a "custom" theme lets
 * the user pick colors directly. The active theme persists with the layout
 * and is included in saved workspaces / exported JSON.
 */

export type ThemeVars = Record<string, string>;

export interface Theme {
  name: string;          // identifier, e.g. "synthwave" or "custom"
  label: string;         // display label
  vars: ThemeVars;       // CSS var overrides (empty = use defaults)
}

// Keys that the custom-theme editor lets the user change. Keep in sync with
// the inputs rendered in WorkspaceSidebar.
export const CUSTOM_KEYS = [
  "--background",
  "--foreground",
  "--primary",
  "--accent",
  "--cyan",
  "--amber",
  "--magenta",
  "--border-strong",
  "--grid",
] as const;

export const THEMES: Record<string, Theme> = {
  noir: {
    name: "noir",
    label: "NEON NOIR",
    vars: {}, // defaults
  },
  synthwave: {
    name: "synthwave",
    label: "SYNTHWAVE",
    vars: {
      "--background":     "#1a0a2e",
      "--foreground":     "#f5e6ff",
      "--primary":        "#ff5cf0",
      "--accent":         "#ffb86b",
      "--cyan":           "#9af7ff",
      "--amber":          "#ffb86b",
      "--magenta":        "#ff5cf0",
      "--border-strong":  "#ff5cf099",
      "--grid":           "#ff5cf033",
    },
  },
  matrix: {
    name: "matrix",
    label: "MATRIX",
    vars: {
      "--background":     "#04140a",
      "--foreground":     "#c8ffd4",
      "--primary":        "#39ff7a",
      "--accent":         "#a8ff60",
      "--cyan":           "#39ff7a",
      "--amber":          "#a8ff60",
      "--magenta":        "#5cffb0",
      "--border-strong":  "#39ff7a88",
      "--grid":           "#39ff7a22",
    },
  },
  solar: {
    name: "solar",
    label: "SOLAR FLARE",
    vars: {
      "--background":     "#1a0f04",
      "--foreground":     "#fff1d6",
      "--primary":        "#ffb347",
      "--accent":         "#ff6b3d",
      "--cyan":           "#ffd479",
      "--amber":          "#ffb347",
      "--magenta":        "#ff6b3d",
      "--border-strong":  "#ffb34788",
      "--grid":           "#ffb34722",
    },
  },
  ice: {
    name: "ice",
    label: "ARCTIC ICE",
    vars: {
      "--background":     "#0a1422",
      "--foreground":     "#e6f6ff",
      "--primary":        "#7fdcff",
      "--accent":         "#b6e8ff",
      "--cyan":           "#7fdcff",
      "--amber":          "#cfe9ff",
      "--magenta":        "#9fb8ff",
      "--border-strong":  "#7fdcff88",
      "--grid":           "#7fdcff22",
    },
  },
  paper: {
    name: "paper",
    label: "PAPER LIGHT",
    vars: {
      "--background":     "#f6f2e8",
      "--foreground":     "#1a1a1a",
      "--primary":        "#1f6feb",
      "--accent":         "#d97706",
      "--cyan":           "#0e7490",
      "--amber":          "#b45309",
      "--magenta":        "#9333ea",
      "--border-strong":  "#1f6feb55",
      "--grid":           "#1a1a1a22",
    },
  },
};

export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Clear any previously injected overrides for known keys first.
  for (const k of CUSTOM_KEYS) root.style.removeProperty(k);
  for (const [k, v] of Object.entries(theme.vars)) {
    root.style.setProperty(k, v);
  }
}

export function isTheme(x: unknown): x is Theme {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.name === "string" && typeof o.label === "string" && !!o.vars && typeof o.vars === "object";
}
