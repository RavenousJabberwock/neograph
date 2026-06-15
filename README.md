# neoGraph · Λ-Workstation

A cyberpunk-styled, multi-window, **programmable scientific graphing calculator** that runs entirely
in the browser. Built on TanStack Start + React 19 + Vite, themed with Tailwind v4 design tokens.

> *"Postgrad math in a synthwave window manager."*

Use neoGraph live at https://neograph.lovable.app/

---

## ✦ Feature matrix

| Domain | Panels / Tools |
| --- | --- |
| **Numeric** | Calculator (history, ANS, deg/rad, vintage CRT mode), Constants library |
| **Symbolic** | CAS panel — solve, expand, factor, differentiate, integrate, Taylor series, step trace, KaTeX rendering |
| **Graphing** | 2D engine — explicit, parametric, polar, **implicit (marching squares)**, **slope fields**, **vector fields**, parameter sliders (a,b,c,d), trace, G-Solve |
| **3D** | Wireframe surface plotter z = f(x,y), orthographic projection |
| **Linear algebra** | RREF, determinant, inverse, **eigenvalues / eigenvectors**, **SVD**, **LU / QR / Cholesky**, null & column space |
| **Calculus numerics** | RK45 (Dormand-Prince) ODEs, adaptive Simpson quadrature, Newton + Brent root finders, numerical limits |
| **Statistics** | 10 distributions, hypothesis tests (t, ANOVA, χ²), linear / multivariate / logistic regression |
| **Programming** | IDE with **Python (Pyodide)**, JS, LOGO turtle, BASIC/TI-BASIC, plus simulated C/C++/R/Mathematica. Scripts can read/write the graph via the `graph` bridge |
| **Terminal** | `/dev/neograph` shell with extensible command registry, history, `lambda.registerCommand()` from scripts |
| **Utility** | Tabbed Notepad (find/replace, .txt I/O, persistence), MS-Paint board, Internet Radio (SomaFM focus feeds), customizable Wallpaper (presets, snapped graph, imported plot) |

---

## ✦ Quick start

```bash
bun install
bun run dev          # http://localhost:8080
```

The home route `/` boots the entire workstation. Every panel is a draggable, resizable
floating window — toggle them from the top bar or the left **Workspace** sidebar.

### First-launch tips

1. Open the **Workspace** sidebar (top-left panel icon) to manage layout & wallpaper.
2. Pop the **Graph** window, then open **IDE** and run:
   ```python
   graph.add("sin(a*x) + cos(b*x)")
   graph.setView(-6, 6)
   ```
   Twist the a/b sliders in **Graph** to animate.
3. Try the **Terminal**: `help`, then `= 2*pi*r` style expressions, or
   `plot sin(x)`.
4. The **Notepad** auto-seeds with this README on first open.

---

## ✦ Architecture

```
src/
├─ routes/
│  ├─ __root.tsx          # SSR shell
│  └─ index.tsx           # Workstation — registers all panels
├─ components/calc/       # One file per panel + FloatingWindow chrome
│  ├─ CalculatorPanel.tsx
│  ├─ GraphPanel.tsx      # 2D engine (explicit/parametric/polar/implicit/fields)
│  ├─ Plot3DPanel.tsx
│  ├─ CasPanel.tsx        # nerdamer + KaTeX
│  ├─ MatrixPanel.tsx     # ml-matrix decompositions
│  ├─ StatsPanel.tsx      # jstat distributions & tests
│  ├─ NumericsPanel.tsx   # ODE / ∫ / root finders
│  ├─ IdePanel.tsx        # Pyodide + JS + LOGO + BASIC
│  ├─ TerminalPanel.tsx   # /dev/neograph
│  ├─ NotepadPanel.tsx    # Tabbed editor, README seed
│  ├─ RadioPanel.tsx      # SomaFM streams
│  ├─ PaintPanel.tsx, GSolvePanel.tsx, ConstantsPanel.tsx, …
│  └─ FloatingWindow.tsx  # drag / resize / z-stack chrome
├─ lib/calc/
│  ├─ store.tsx           # Single context: plots, viewport, windows, wallpaper, graphParams
│  ├─ math.ts             # Expression eval, PlotKind, ANS, deg/rad helpers
│  ├─ numerics.ts         # RK45, adaptive Simpson, Brent, Newton, limits
│  ├─ bridge.ts           # graph.add/list/setView/snapshot — used by IDE scripts
│  ├─ interpreters.ts     # LOGO + BASIC mini-runtimes
│  ├─ commands.ts         # Terminal command registry (extensible)
│  ├─ latex.ts            # KaTeX wrapper
│  └─ wallpaper.ts        # Background presets + image wallpapers
└─ styles.css             # Design tokens (cyberpunk palette, neon glows)
```

### Design system

All colors / gradients / shadows are semantic tokens in `src/styles.css`. Never hardcode hex
values in component code — use `var(--color-primary)`, `neon-text`, `pill-btn`, etc.

### Extending

* **Add a panel**: create `src/components/calc/MyPanel.tsx`, add a `PanelKey` in `store.tsx`,
  register it in `PANELS` (`src/routes/index.tsx`) and the sidebar's toggle list.
* **Add a terminal command**: `import { registerCommand } from "@/lib/calc/commands"`
  and call `registerCommand({ name, help, run: ctx => ctx.print("hi") })`.
  Also reachable at runtime via `window.lambda.registerCommand`.
* **Add a graph plot kind**: extend `PlotKind` in `math.ts` and add a renderer branch
  in `GraphPanel.tsx`'s draw loop.
* **Persistent state**: window positions, notepad tabs, and wallpaper are stored under the
  `lvbl_*` keys in `localStorage`.

---

## ✦ Keyboard shortcuts (Notepad)

| Combo | Action |
| --- | --- |
| ⌘/Ctrl + N | New tab |
| ⌘/Ctrl + S | Download active tab as .txt |
| ⌘/Ctrl + F | Find / replace |
| Tab | Insert two spaces |
| Double-click tab | Rename file |

---

## ✦ Tech

* **TanStack Start v1** (file-based routing, server functions)
* **React 19** + **Vite 7**
* **Tailwind v4** via native `@import` in `styles.css`
* **Pyodide** (Python in browser), **nerdamer** (CAS), **ml-matrix**, **jstat**, **KaTeX**

---

## ✦ License

MIT — synthwave the math, share the source.
