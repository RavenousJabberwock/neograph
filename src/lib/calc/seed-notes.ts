/**
 * seed-notes.ts
 * ------------------------------------------------------------------
 * Bundled markdown documents that the Notepad panel pre-loads the
 * FIRST time a user opens it (i.e. when no `lvbl_notepad_v1` key
 * exists in localStorage yet). Edit / extend this array to ship
 * additional reference docs out of the box.
 *
 * Imported as `?raw` so the file content lives in the JS bundle and
 * survives in fully-offline / static deploys.
 * ------------------------------------------------------------------
 */
import readme from "../../../README.md?raw";

export interface SeedTab { name: string; content: string }

const QUICKSTART = `# neoGraph · Quickstart

Welcome to the Λ-Workstation. Here's a 60-second tour.

## Windows
- Drag the titlebar to move, drag the corner to resize, double-click to minimise.
- Toggle any panel from the top bar or the left **Workspace** sidebar.
- Double-click a notepad tab name to rename it. \`Ctrl/⌘+N\` for a new tab.
- On a \`.md\` tab, click the eye icon to flip between source and rendered preview.

## Try this

1. **Graph + IDE** — pop **Graph**, then **IDE**, pick Python, and run:

       graph.add("sin(a*x) + cos(b*x)")
       graph.setView(-6.28, 6.28, -2, 2)

   Use the a / b / c / d sliders inside **Graph** to animate parameters live.

2. **Terminal** — \`help\`, then try \`= 2 * pi * 5^2\` or \`plot tan(x)\`. Register
   your own command from any IDE script:

       window.lambda.registerCommand({ name, help, run })

3. **CAS** — \`solve(x^2 - 5x + 6, x)\` or \`integrate(sin(x)^2, x)\`.

4. **Matrix** — try **SVD** on \`[[1,2],[3,4],[5,6]]\` or **eigen** on a 3×3.

5. **Academy** — open the **Academy** panel for 100+ lessons from K-arithmetic
   through analysis. Each lesson includes worked examples, exercises with
   feedback, and curated external links (Khan Academy, MIT OCW, OpenStax,
   3Blue1Brown, …) for deeper study.

6. **Theme** — Workspace sidebar → THEME. Pick a preset (SYNTHWAVE, MATRIX,
   PAPER LIGHT, …) or override individual colors. Drop an image URL or upload
   a file in WALLPAPER to skin the whole desktop.

## Save / load
- Workspace sidebar → **Save / Load** exports your entire workstation
  (windows, plots, theme, wallpaper) as a JSON file.
- Notepad tabs, layout, theme, and wallpaper also autosave to localStorage
  under the \`lvbl_*\` keys. Clear those to factory-reset.

## Offline
\`neograph-offline.html\` is a single-file build you can double-click without a
server — handy when the network is down.

Happy crunching. — Λ
`;

export const SEED_TABS: SeedTab[] = [
  { name: "README.md", content: readme as string },
  { name: "quickstart.md", content: QUICKSTART },
];
