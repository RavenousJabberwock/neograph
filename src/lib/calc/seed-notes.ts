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
- Drag the titlebar to move, drag the corner to resize.
- Double-click a tab name here to rename it. Ctrl/⌘+N for a new tab.
- Toggle any panel from the top bar or the left "Workspace" sidebar.

## Try this
1. Open **Graph**, then **IDE**, pick Python, and run:
       graph.add("sin(a*x) + cos(b*x)")
       graph.setView(-2*3.14159, 2*3.14159)
   Use the a / b / c / d sliders inside Graph to animate parameters.

2. Open **Terminal** and try:
       help
       = 2 * pi * 5^2
       plot tan(x)
   You can add your own commands from any IDE script via
       window.lambda.registerCommand({ name, help, run })

3. Open **CAS** and try:  solve(x^2 - 5x + 6, x)   or   integrate(sin(x)^2, x)

4. Open **Matrix** and try **SVD** on  [[1,2],[3,4],[5,6]].

## Persistence
Your notepad tabs, window layout, and wallpaper are saved to localStorage
under the lvbl_* keys. Clear those to factory-reset.

Happy crunching. — Λ
`;

export const SEED_TABS: SeedTab[] = [
  { name: "README.md", content: readme as string },
  { name: "quickstart.md", content: QUICKSTART },
];
