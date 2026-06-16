# neoGraph · Λ-Workstation

A cyberpunk-styled, multi-window, **programmable scientific graphing calculator + math academy**
that runs entirely in the browser. Built on TanStack Start + React 19 + Vite, themed with
Tailwind v4 design tokens.

> *"K-through-postgrad math in a synthwave window manager."*

Live: **https://neograph.lovable.app/** · Offline: download `neograph-offline.html` and
double-click — no server, no install.

---

## ✦ Feature matrix

| Domain | Panels / Tools |
| --- | --- |
| **Numeric** | Calculator (history, ANS chain, deg/rad, vintage CRT mode), Constants library |
| **Symbolic** | CAS panel — solve, expand, factor, differentiate, integrate, Taylor series, step trace, KaTeX rendering |
| **Graphing** | 2D engine — explicit, parametric, polar, **implicit (marching squares)**, **slope fields**, **vector fields**, parameter sliders (a,b,c,d), trace, G-Solve, plot undo/redo |
| **3D** | Wireframe surface plotter z = f(x,y), orthographic projection |
| **Linear algebra** | RREF, determinant, inverse, **eigenvalues / eigenvectors**, **SVD**, **LU / QR / Cholesky**, null & column space |
| **Calculus numerics** | RK45 (Dormand-Prince) ODEs, adaptive Simpson quadrature, Newton + Brent root finders, numerical limits, Taylor series, polynomial roots (Aberth) |
| **Statistics** | 10 distributions, hypothesis tests (t, ANOVA, χ²), linear / multivariate / logistic regression |
| **Programming** | IDE with **Python (Pyodide)**, JavaScript, **R (WebR · WASM)**, **Symbolic (mathjs CAS-flavor)**, LOGO turtle, BASIC / TI-BASIC. All runtimes are real (Pyodide & WebR lazy-load on first use). Scripts read/write the graph via the `graph` bridge |
| **Terminal** | `/dev/neograph` shell with extensible command registry, history, `lambda.registerCommand()` from scripts |
| **Academy** | 14 stages · **100+ lessons** from K-arithmetic through analysis, abstract algebra & numerical methods, with worked examples, exercises, and curated free reading / video links |
| **Utility** | Tabbed **Notepad with live Markdown rendering** (find/replace, .md/.txt I/O, autosave), MS-Paint board, Internet Radio (SomaFM focus feeds) |
| **Aesthetic** | **6 built-in themes** + custom color overrides, workstation-wide wallpaper (presets, image URL, local upload), saved in workspace JSON |

---

## ✦ Quick start

```bash
bun install
bun run dev          # http://localhost:8080
```

The home route `/` boots the entire workstation. Every panel is a draggable, resizable
floating window — toggle them from the top bar or the left **Workspace** sidebar.

### Offline build

`neograph-offline.html` in the project root is a fully self-contained single-file
distribution of the calculator + grapher + notepad. No build step, no network
(after first load of the mathjs CDN). Use it as a backup when your network is down
or to share the tool by email.

### First-launch tips

1. Open the **Workspace** sidebar (top-left) to manage layout, theme, and wallpaper.
   Try `SYNTHWAVE` or `MATRIX` themes; drop your own image URL for a custom desktop.
2. Pop the **Graph** window, then open **IDE** and run:
   ```python
   graph.add("sin(a*x) + cos(b*x)")
   graph.setView(-6, 6, -2, 2)
   ```
   Twist the a / b sliders in **Graph** to animate.
3. Try the **Terminal**: `help`, then `= 2*pi*r` style expressions, or `plot sin(x)`.
4. Open the **Academy** for structured lessons — pick a stage (e.g. *Algebra I–II*),
   work through the examples, then click *Practice* to get exercises with feedback.
5. The **Notepad** auto-seeds with this README and a quickstart. Toggle the eye icon
   on a `.md` tab to flip between source and rendered preview.

---

## ✦ Architecture

```
src/
├─ routes/
│  ├─ __root.tsx                # SSR shell
│  └─ index.tsx                 # Workstation — registers all panels
├─ components/calc/             # One file per panel + FloatingWindow chrome
│  ├─ CalculatorPanel.tsx
│  ├─ GraphPanel.tsx            # 2D engine (explicit/parametric/polar/implicit/fields)
│  ├─ Plot3DPanel.tsx
│  ├─ CasPanel.tsx              # nerdamer + KaTeX
│  ├─ MatrixPanel.tsx           # ml-matrix decompositions
│  ├─ StatsPanel.tsx            # jstat distributions & tests
│  ├─ NumericsPanel.tsx         # ODE / ∫ / root finders / limits / Taylor
│  ├─ IdePanel.tsx              # Pyodide + WebR + JS + Symbolic + LOGO + BASIC, lazy-load progress UI
│  ├─ TerminalPanel.tsx         # /dev/neograph
│  ├─ NotepadPanel.tsx          # Tabbed editor, .md preview, seed docs
│  ├─ AcademyPanel.tsx          # Curriculum browser, exercises, resource links
│  ├─ RadioPanel.tsx            # SomaFM streams
│  ├─ WorkspaceSidebar.tsx      # Layout, theme picker, wallpaper, save/load JSON
│  ├─ PaintPanel.tsx, GSolvePanel.tsx, ConstantsPanel.tsx, …
│  └─ FloatingWindow.tsx        # drag / resize / z-stack chrome (ref-cleaned)
├─ lib/calc/
│  ├─ store.tsx                 # Single context: plots, viewport, windows, theme, wallpaper, params
│  ├─ math.ts                   # Expression eval, PlotKind, ANS, deg/rad helpers
│  ├─ numerics.ts               # RK45, adaptive Simpson, Brent, Newton, limits, Aberth roots
│  ├─ bridge.ts                 # graph.add/list/setView/snapshot — used by IDE scripts
│  ├─ interpreters.ts           # LOGO + BASIC + Symbolic (Mathematica-flavor over mathjs) mini-runtimes
│  ├─ commands.ts               # Terminal command registry (extensible)
│  ├─ themes.ts                 # 6 palettes + custom-color machinery
│  ├─ markdown.ts               # Notepad markdown renderer
│  ├─ latex.ts                  # KaTeX wrapper
│  ├─ wallpaper.ts              # Background presets
│  └─ academy/
│     ├─ index.ts               # Stage registry
│     ├─ types.ts               # Stage / Lesson / Exercise schema
│     ├─ resources.ts           # Curated external links per stage
│     └─ {early,pre-algebra,algebra,trig,precalc,calc1,multivar,linalg,
│         probstats,diffeq,discrete,analysis,abstract,numerical}.ts
└─ styles.css                   # Design tokens (cyberpunk palette, neon glows)

neograph-offline.html           # Standalone single-file build
```

### Design system

All colors / gradients / shadows are semantic tokens in `src/styles.css` driven by
`src/lib/calc/themes.ts`. Never hardcode hex values in component code — use
`var(--color-primary)`, `neon-text`, `pill-btn`, etc., so theme switching applies
everywhere instantly.

### Extending

* **Add a panel**: create `src/components/calc/MyPanel.tsx`, add a `PanelKey` in
  `store.tsx`, register it in `PANELS` (`src/routes/index.tsx`) and the sidebar
  toggle list.
* **Add a terminal command**: `import { registerCommand } from "@/lib/calc/commands"`
  and call `registerCommand({ name, help, run: ctx => ctx.print("hi") })`. Also
  reachable at runtime via `window.lambda.registerCommand`.
* **Add a graph plot kind**: extend `PlotKind` in `math.ts` and add a renderer
  branch in `GraphPanel.tsx`'s draw loop.
* **Add an academy lesson**: append a `Lesson` to the appropriate
  `src/lib/calc/academy/<stage>.ts` module — the UI renders automatically. Add
  per-lesson `resources: Resource[]` to override the stage default links.
* **Add a theme**: drop a new palette into `src/lib/calc/themes.ts` `THEMES` map.
* **Persistent state**: window positions, notepad tabs, theme, and wallpaper are
  stored under `lvbl_*` keys in `localStorage`. Full workstation snapshots
  export/import as JSON via the Workspace sidebar.

---

## ✦ Academy curriculum

| Stage | Band | Lessons |
| --- | --- | --- |
| Foundations              | K–5         | 10 |
| Pre-Algebra              | Gr 6–8      | 12 |
| Algebra I–II             | Gr 9–10     | 10 |
| Trigonometry             | Gr 10–11    |  8 |
| Precalculus              | Gr 11–12    |  7 |
| Single-Variable Calculus | Yr 1        |  7 |
| Multivariable Calculus   | Yr 2        |  5 |
| Linear Algebra           | Yr 2        |  9 |
| Probability & Statistics | Yr 2–3      |  7 |
| Differential Equations   | Yr 3        |  5 |
| Discrete Math            | Yr 2–3      |  7 |
| Analysis                 | Yr 4 / Grad |  5 |
| Abstract Algebra         | Yr 4 / Grad |  3 |
| Numerical Methods        | Grad        |  7 |

Every lesson links to free reading & video material from OpenStax, Khan Academy,
MIT OCW, Paul's Online Math Notes, 3Blue1Brown, Professor Leonard, NIST DLMF, AoPS,
etc. See `src/lib/calc/academy/resources.ts` — maintainers should re-verify links
quarterly (link rot is the only ongoing maintenance cost of this module).

---

## ✦ Keyboard shortcuts (Notepad)

| Combo | Action |
| --- | --- |
| ⌘/Ctrl + N        | New tab |
| ⌘/Ctrl + S        | Download active tab as .txt / .md |
| ⌘/Ctrl + F        | Find / replace |
| Tab               | Insert two spaces |
| Double-click tab  | Rename file |
| Eye icon          | Toggle markdown preview (`.md` tabs) |

---

## ✦ Tech

* **TanStack Start v1** (file-based routing, server functions)
* **React 19** + **Vite 7**
* **Tailwind v4** via native `@import` in `styles.css`
* **Pyodide** (Python in browser, lazy-loaded with progress UI), **WebR** (real R via r-wasm.org, lazy-loaded),
  **nerdamer** (CAS), **mathjs**, **ml-matrix**, **jstat**, **KaTeX**

---

## ✦ License

MIT — synthwave the math, share the source.
