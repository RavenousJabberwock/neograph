/**
 * help-content.ts — Context-sensitive help text for every panel.
 * ------------------------------------------------------------------
 * The help system is "Math on Keys"–style: each section explains what
 * the panel does, the math behind it, the meaning of each key/control,
 * and a worked example. Content is plain data so it's easy to extend.
 *
 * Adding help for a new panel:
 *   1. Add a `PanelKey` entry to HELP below.
 *   2. Fill in summary / concepts / keys / examples / tips.
 *   3. (Optional) link related panels via `related`.
 * ------------------------------------------------------------------
 */
import type { PanelKey } from "./store";

export interface KeyEntry {
  /** Button/menu label as the user sees it. */
  key: string;
  /** Plain-English description of what it does. */
  what: string;
  /** Optional formal definition / formula. */
  math?: string;
}

export interface ConceptEntry {
  title: string;
  body: string;
  /** Optional LaTeX-ish formula rendered in monospace. */
  formula?: string;
}

export interface HelpSection {
  title: string;
  /** One-line tagline shown under the title. */
  tagline: string;
  /** A short paragraph orienting the user. */
  summary: string;
  /** Background math concepts ("Math on Keys" pages). */
  concepts: ConceptEntry[];
  /** Per-control explanations. */
  keys: KeyEntry[];
  /** Worked examples. */
  examples: { input: string; result: string; note?: string }[];
  /** Pro tips / edge cases. */
  tips?: string[];
  /** Related panel keys for cross-linking. */
  related?: PanelKey[];
  /** Optional Academy lesson id this panel maps to (deep-link). */
  academy?: string;
  /** Optional list of further Academy lessons to suggest. */
  furtherAcademy?: string[];
}

// ─── Help registry ─────────────────────────────────────────────────────────
export const HELP: Record<PanelKey, HelpSection> = {
  calc: {
    title: "Calculator",
    tagline: "Scientific expression engine with ANS chaining.",
    summary:
      "A free-form expression calculator powered by math.js. Anything you can type as a math expression evaluates; results are pushed to `ans` and stored in history.",
    concepts: [
      {
        title: "Operator precedence",
        body: "Parentheses → exponentiation (right-assoc) → unary − → ×/÷/% → + and −. Use parens when in doubt; `-2^2` parses as `-(2^2) = -4`.",
        formula: "( ) → ^ → ± → × ÷ → + −",
      },
      {
        title: "ANS variable",
        body: "Every successful evaluation stores its numeric result in `ans`. Reference it in the next expression to chain calculations without retyping.",
        formula: "ans = previous_result",
      },
      {
        title: "Implicit multiplication",
        body: "math.js requires an explicit `*` between identifiers (e.g. `2*x`, not `2x`). Constants like `pi` and `e` are recognized symbols.",
      },
    ],
    keys: [
      { key: "EXE / Enter", what: "Evaluate the current expression and push to history." },
      { key: "ANS", what: "Insert the previous result.", math: "ans" },
      { key: "sin cos tan", what: "Trig functions; argument in radians by default.", math: "sin(θ), cos(θ), tan(θ)" },
      { key: "log / ln", what: "Common log (base 10) and natural log (base e).", math: "log₁₀(x), ln(x)" },
      { key: "^ or **", what: "Exponentiation.", math: "a^b" },
      { key: "!", what: "Factorial (gamma-extended for non-integers).", math: "n! = Γ(n+1)" },
    ],
    examples: [
      { input: "sin(pi/4)^2 + cos(pi/4)^2", result: "1", note: "Pythagorean identity." },
      { input: "ans * 2 + 1", result: "uses previous result", note: "ANS chaining." },
      { input: "log(1000)", result: "3" },
    ],
    tips: [
      "Wrap negatives before powers: `(-2)^2 = 4` vs `-2^2 = -4`.",
      "Use Ctrl+K to focus this panel from anywhere.",
    ],
    related: ["graph", "cas", "terminal"],
  },

  graph: {
    title: "Graph Engine",
    tagline: "Explicit, parametric, polar, and implicit 2D plotting.",
    summary:
      "Live function plotter with pan/zoom, sliders (a, b, c, d), and synchronization with the calculator. Every redraw is rAF-throttled to maintain 60 fps.",
    concepts: [
      {
        title: "Explicit form  y = f(x)",
        body: "Samples f(x) over the visible x-range and connects points. Discontinuities are skipped when f(x) → ±∞ or NaN.",
        formula: "y = f(x), x ∈ [xMin, xMax]",
      },
      {
        title: "Parametric form  (x(t), y(t))",
        body: "Both coordinates are functions of a parameter t over a chosen interval. Useful for circles, Lissajous figures, and spirals.",
        formula: "x = x(t), y = y(t), t ∈ [tMin, tMax]",
      },
      {
        title: "Polar form  r = f(θ)",
        body: "Radius as a function of angle. Internally converted to (r·cos θ, r·sin θ).",
        formula: "x = r(θ)·cos θ,  y = r(θ)·sin θ",
      },
      {
        title: "Sliders a, b, c, d",
        body: "Real-valued parameters injected into the math scope. Edit any expression to use them, e.g. `a*sin(b*x + c) + d`, then drag the sliders for live morphing.",
      },
    ],
    keys: [
      { key: "+ Plot", what: "Append a new curve with an auto-assigned color." },
      { key: "↶ / ↷", what: "Undo / redo plot edits (also Ctrl+Z / Ctrl+Y)." },
      { key: "Reset view", what: "Restore the default viewport (−10..10 both axes)." },
      { key: "Enable toggle", what: "Hide a curve without deleting it." },
    ],
    examples: [
      { input: "a*sin(b*x)", result: "Drag sliders a, b to morph.", note: "Amplitude × frequency." },
      { input: "exp(-x^2/2)/sqrt(2*pi)", result: "Standard normal PDF." },
    ],
    tips: [
      "Heavy expressions? Increase the viewport rather than reduce sample count — sampling is adaptive.",
      "Use the Workspace panel's 'SNAP GRAPH' to use the current view as the calculator wallpaper.",
    ],
    related: ["table", "plot3d", "gsolve", "numerics"],
  },

  plot3d: {
    title: "3D Surface",
    tagline: "z = f(x, y) rendered as a wireframe surface.",
    summary:
      "Evaluates a scalar field over a uniform x-y grid and projects it to 2D with an isometric / perspective camera. Useful for visualizing multivariable calculus.",
    concepts: [
      {
        title: "Surface as height field",
        body: "Each (x, y) maps to a single height z = f(x, y). The mesh density controls smoothness vs render cost.",
        formula: "z = f(x, y),  (x, y) ∈ [xMin, xMax] × [yMin, yMax]",
      },
      {
        title: "Partial derivatives",
        body: "Slope along x and y axes: ∂f/∂x and ∂f/∂y. The gradient ∇f = (∂f/∂x, ∂f/∂y) points uphill on the surface.",
        formula: "∇f = (∂f/∂x, ∂f/∂y)",
      },
    ],
    keys: [
      { key: "Resolution", what: "Grid samples per axis. n² evaluations total — keep modest." },
      { key: "Camera angle", what: "Orbital rotation around z-axis." },
    ],
    examples: [
      { input: "sin(sqrt(x^2+y^2))", result: "Ripple / radial wave." },
      { input: "x^2 - y^2", result: "Saddle point at origin." },
    ],
    related: ["graph", "cas"],
  },

  table: {
    title: "Table View",
    tagline: "Tabulate f(x) over a range.",
    summary:
      "Generates an ordered (x, f(x)) table for any enabled curve. Adjust start, end, and step. Mirrors the casio fx-style numeric table.",
    concepts: [
      {
        title: "Sampling",
        body: "Values are evaluated at xₖ = start + k·step. A small step gives a finer table at the cost of more rows.",
        formula: "xₖ = start + k·Δx,  k = 0, 1, … , ⌊(end−start)/Δx⌋",
      },
    ],
    keys: [
      { key: "Start / End / Step", what: "Define the sampled x-domain." },
      { key: "Curve selector", what: "Pick which plot to tabulate." },
    ],
    examples: [{ input: "sin(x), [0, π], Δ=π/6", result: "Common trig reference table." }],
    related: ["graph"],
  },

  cas: {
    title: "Computer Algebra (CAS)",
    tagline: "Symbolic simplify / expand / derivative / integral.",
    summary:
      "Wraps math.js's symbolic engine. Manipulates expressions algebraically rather than numerically.",
    concepts: [
      {
        title: "Derivative",
        body: "d/dx of an expression. Sum, product, chain, and quotient rules are applied automatically.",
        formula: "d/dx [f·g] = f'g + fg'",
      },
      {
        title: "Indefinite integral (when supported)",
        body: "Antiderivative ∫f dx. Closed-form coverage is limited — fall back to the Numerics panel for definite integrals.",
        formula: "∫ f(x) dx = F(x) + C",
      },
      {
        title: "Simplification",
        body: "Algebraic identities (a²−b² = (a−b)(a+b), trig identities, log rules) collapse expressions to canonical form.",
      },
    ],
    keys: [
      { key: "simplify", what: "Reduce to canonical form." },
      { key: "expand", what: "Distribute products of sums." },
      { key: "derivative(expr, var)", what: "Symbolic derivative w.r.t. var." },
    ],
    examples: [
      { input: "derivative(\"sin(x^2)\", \"x\")", result: "2x·cos(x²)" },
      { input: "simplify(\"(x^2 - 1)/(x - 1)\")", result: "x + 1  (x ≠ 1)" },
    ],
    related: ["calc", "numerics", "graph"],
  },

  numerics: {
    title: "Numerical Methods",
    tagline: "Root finding, quadrature, and ODE integration.",
    summary:
      "Numerical toolbox for problems with no closed form. Bisection / secant for roots, adaptive Simpson for integrals, RK4 for ODEs.",
    concepts: [
      {
        title: "Root finding — bisection",
        body: "Repeatedly halve an interval [a, b] where f(a) and f(b) have opposite signs. Converges linearly but is unconditionally safe.",
        formula: "f(a)·f(b) < 0  ⇒  ∃ root in (a, b)",
      },
      {
        title: "Adaptive Simpson",
        body: "Approximates ∫f dx by fitting parabolas; refines subintervals where the estimate disagrees.",
        formula: "∫ₐᵇ f ≈ (b−a)/6 · [f(a) + 4f((a+b)/2) + f(b)]",
      },
      {
        title: "RK4 — 4th order Runge–Kutta",
        body: "Single-step ODE integrator with global error O(h⁴). Solves y' = f(t, y), y(t₀) = y₀.",
        formula: "yₙ₊₁ = yₙ + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)",
      },
    ],
    keys: [
      { key: "Root", what: "Find x with f(x) = 0 in a bracket." },
      { key: "Integrate", what: "Definite integral ∫ₐᵇ f(x) dx." },
      { key: "ODE", what: "March y' = f(t, y) from t₀ to t₁." },
    ],
    examples: [
      { input: "root: cos(x) − x, [0, 1]", result: "≈ 0.7390851" },
      { input: "∫₀¹ e^{−x²} dx", result: "≈ 0.7468241" },
    ],
    tips: ["Bracket the root: ensure f(a) and f(b) have opposite signs."],
    related: ["cas", "graph"],
  },

  ide: {
    title: "IDE (multi-language)",
    tagline: "Real in-browser runtimes: Python, JS, R, Symbolic CAS, LOGO, BASIC.",
    summary:
      "Lightweight scratchpad that executes scripts in-browser and exposes the graph bridge. Python (Pyodide) and R (WebR) lazy-load on first RUN; everything else is instant. Treat it like a programmable function key.",
    concepts: [
      {
        title: "Graph bridge",
        body: "Scripts call `graph.add(expr)`, `graph.list()`, `graph.setView(…)`, `graph.clear()` to manipulate the Graph window from code. In Python, `graph.*` returns a JsProxy — call `.to_py()` to iterate or index.",
      },
      {
        title: "Lazy runtimes",
        body: "Pyodide (~15 MB) downloads on first Python run; WebR (~25 MB) on first R run. Both cache in the browser for the session.",
      },
      {
        title: "Symbolic mode",
        body: "Mathematica-flavor head syntax (`Sin[x]`, `D[…]`, `Integrate[…]`) rewritten onto mathjs. Definite integrals are numeric (Simpson-ish); symbolic derivatives are exact.",
      },
    ],
    keys: [
      { key: "RUN", what: "Execute the current buffer in the selected language." },
      { key: "Language dropdown", what: "Switch interpreter (buffer auto-swaps to that language's sample)." },
      { key: "GRAPH", what: "Dump the current graph state (viewport + plot list) to the output pane." },
    ],
    examples: [{ input: "graph.add('sin(x)*x')", result: "Adds curve to Graph window." }],
    related: ["graph", "terminal"],
  },

  paint: {
    title: "Paint / Canvas",
    tagline: "Quick raster sketchpad.",
    summary: "A pressure-agnostic doodling surface for notes and explanations.",
    concepts: [{ title: "Pixel coordinates", body: "(0, 0) is top-left; y grows downward — opposite of math convention." }],
    keys: [
      { key: "Brush", what: "Pick stroke size and color." },
      { key: "Clear", what: "Wipe the canvas." },
    ],
    examples: [{ input: "—", result: "Freehand sketch." }],
  },

  stats: {
    title: "Stats / Regression / Tests",
    tagline: "Descriptive stats, regressions, and hypothesis tests.",
    summary:
      "Powered by jStat. Enter a dataset and pick a model (linear, polynomial, exponential) or a test (t-test, χ², ANOVA).",
    concepts: [
      {
        title: "Linear regression",
        body: "Least-squares line minimizing Σ(yᵢ − (a·xᵢ + b))².",
        formula: "a = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²,   b = ȳ − a·x̄",
      },
      {
        title: "Coefficient of determination R²",
        body: "Fraction of variance explained by the model. 1 = perfect fit, 0 = no better than mean.",
        formula: "R² = 1 − SS_res / SS_tot",
      },
      {
        title: "Student's t-test",
        body: "Compares means assuming approximately normal data. p < α (commonly 0.05) ⇒ reject H₀.",
        formula: "t = (x̄ − μ₀) / (s / √n)",
      },
    ],
    keys: [
      { key: "Fit", what: "Compute coefficients and R² for the selected model." },
      { key: "Test", what: "Run a hypothesis test and report p-value." },
    ],
    examples: [{ input: "x = 1..5, y = 2,4,5,4,5", result: "y ≈ 0.6·x + 2.2,  R² ≈ 0.45" }],
    related: ["graph", "numerics"],
  },

  matrix: {
    title: "Matrix Decomposition",
    tagline: "RREF, determinant, inverse, eigen, LU, QR, SVD.",
    summary: "Linear algebra workbench. Edit a matrix in the grid then pick an operation.",
    concepts: [
      {
        title: "Determinant",
        body: "Scalar that captures signed volume scaling. det A = 0 ⇔ A is singular (non-invertible).",
        formula: "det(AB) = det A · det B",
      },
      {
        title: "Eigenvalues / eigenvectors",
        body: "Av = λv. Eigenvalues are the roots of det(A − λI) = 0.",
        formula: "Av = λv,  v ≠ 0",
      },
      {
        title: "SVD",
        body: "A = UΣVᵀ. Singular values σᵢ on Σ's diagonal; condition number = σ_max / σ_min.",
        formula: "A = UΣVᵀ",
      },
    ],
    keys: [
      { key: "RREF", what: "Reduced row-echelon form (Gauss-Jordan)." },
      { key: "Inv", what: "Inverse; errors if det = 0." },
      { key: "Eig", what: "Eigenvalues / eigenvectors." },
    ],
    examples: [{ input: "[[1,2],[3,4]]", result: "det = −2, eigvals = {−0.372, 5.372}" }],
    related: ["stats"],
  },

  gsolve: {
    title: "G-Solve",
    tagline: "Casio-style graph analyzers: root, max/min, intersect, ∫.",
    summary: "Reads the current Graph window and locates features of interest interactively.",
    concepts: [
      {
        title: "Root",
        body: "Where f(x) = 0. Bracketing is done on the visible viewport using sign changes.",
      },
      {
        title: "Extremum",
        body: "Local max where f'(x) = 0 and f''(x) < 0 (vice versa for min).",
        formula: "f'(x*) = 0,  f''(x*) < 0  ⇒ local max at x*",
      },
    ],
    keys: [
      { key: "Root", what: "Find a zero of the selected curve." },
      { key: "Max / Min", what: "Local extremum within view." },
      { key: "∫", what: "Definite integral between two cursor x-positions." },
    ],
    examples: [{ input: "x^3 − x on [−2, 2]", result: "roots at −1, 0, 1." }],
    related: ["graph", "numerics"],
  },

  constants: {
    title: "Physical Constants",
    tagline: "CODATA-style reference with units.",
    summary: "Click to push a constant into the calculator input.",
    concepts: [
      {
        title: "Units",
        body: "Values are in SI base units unless noted. Always carry units through derivations.",
      },
    ],
    keys: [{ key: "Insert", what: "Append the numeric value to the calculator buffer." }],
    examples: [{ input: "c", result: "2.99792458 × 10⁸ m/s" }],
  },

  terminal: {
    title: "Terminal",
    tagline: "REPL with calculator + filesystem-style commands.",
    summary:
      "Type expressions to evaluate, or commands like `plot`, `clear`, `help`. Results stream into a scrollback buffer.",
    concepts: [
      {
        title: "Pipes (planned)",
        body: "Most commands print only; chain via copy/paste for now.",
      },
    ],
    keys: [
      { key: "help", what: "List available commands." },
      { key: "plot expr", what: "Add a curve to the Graph window from the prompt." },
      { key: "clear", what: "Wipe the scrollback." },
    ],
    examples: [{ input: "plot sin(x)*x", result: "Curve added." }],
    related: ["calc", "ide"],
  },

  radio: {
    title: "Internet Radio",
    tagline: "Background focus feeds. Plays through panel close.",
    summary:
      "Curated SomaFM streams plus any custom MP3/AAC/Icecast URL you add. The <audio> element lives in the provider, so closing the panel does not stop the music — a mini transport appears at the bottom-right of the screen.",
    concepts: [
      {
        title: "Why MP3/AAC over Icecast",
        body: "Browsers support these natively without a media-source pipeline. Some servers block CORS for cross-origin playback — if a stream errors, try a different host.",
      },
    ],
    keys: [
      { key: "Play / Pause", what: "Toggle playback. Survives panel close." },
      { key: "Add URL", what: "Save a custom feed locally." },
      { key: "Volume / Mute", what: "Per-session, persisted in localStorage." },
    ],
    examples: [{ input: "Add SomaFM Indie Pop", result: "https://ice1.somafm.com/indiepop-128-mp3" }],
  },

  notepad: {
    title: "Notepad",
    tagline: "Tabbed plain-text editor.",
    summary: "Multi-tab editor with localStorage persistence. The README and quickstart load on first open.",
    keys: [
      { key: "+", what: "New tab." },
      { key: "×", what: "Close tab (with confirm if unsaved)." },
    ],
    concepts: [{ title: "Markdown", body: "Notes are stored as plain text. Rendering is up to the future." }],
    examples: [{ input: "—", result: "Free-form notes." }],
  },

  workspace: {
    title: "Workspace",
    tagline: "Save/load layouts, swap wallpaper, toggle panels.",
    summary:
      "Central control room: name and save the current panel layout, change the calculator wallpaper, or import a plot snapshot as the background.",
    keys: [
      { key: "NEW / SAVE / LOAD", what: "Manage named workspaces in localStorage." },
      { key: "JSON / OPEN", what: "Export / import the entire workstation state to a JSON file." },
      { key: "SNAP GRAPH", what: "Capture the current Graph window as the calculator wallpaper." },
      { key: "PANELS", what: "Show/hide each window." },
    ],
    examples: [{ input: "Save 'study'", result: "Stores current visible windows + wallpaper." }],
    concepts: [],
  },

  academy: {
    title: "Academy",
    tagline: "K–Postgrad math curriculum with practice problems.",
    summary:
      "A self-contained learning track that explains the mathematics behind every panel — from place value through real analysis. Each lesson includes worked theory and checkable exercises; progress is stored locally.",
    concepts: [
      {
        title: "Spaced practice",
        body: "Mix easy and hard lessons in the same sitting. The brain consolidates better when topics interleave than when one topic is drilled to exhaustion.",
      },
      {
        title: "Active recall",
        body: "Attempt every exercise before peeking at the explanation. The retrieval effort, not the reading, is what builds durable memory.",
      },
      {
        title: "From concrete to abstract",
        body: "The curriculum is ordered so each stage rests on the previous one. If a lesson feels opaque, drop back two stages and rebuild the foundation.",
      },
    ],
    keys: [
      { key: "Stages rail", what: "Pick a grade band (K–5 → Postgrad)." },
      { key: "Lessons rail", what: "Choose a topic; green dot = all exercises passed." },
      { key: "CHECK", what: "Grade your answer (numeric tolerance / symbolic equality / multiple choice)." },
      { key: "HINT", what: "Reveal a nudge without spoiling the full explanation." },
      { key: "RETRY", what: "Clear the verdict and try again." },
    ],
    examples: [
      { input: "Calculus I → 'The derivative'", result: "Definition, rules, and 3 practice problems." },
      { input: "Linear Algebra → 'SVD'", result: "Decomposition, Eckart–Young, dimension drill." },
    ],
    tips: [
      "Open Academy from any panel's help — the suggested lesson jumps you to the relevant topic.",
      "Exercises accept arithmetic (e.g. '1/2' or 'sqrt(2)') as numeric answers.",
    ],
    related: ["calc", "cas", "graph", "numerics", "matrix", "stats"],
  },
};

// ─── Cross-links: tie each panel to an Academy lesson when appropriate ───
HELP.calc.academy      = "alg-quadratic";
HELP.calc.furtherAcademy = ["pre-linear-eq", "alg-exp-log"];
HELP.graph.academy     = "pre-functions";
HELP.graph.furtherAcademy = ["trig-unit-circle", "cal1-applications"];
HELP.plot3d.academy    = "cal3-partials";
HELP.plot3d.furtherAcademy = ["cal3-double-integrals"];
HELP.table.academy     = "pre-functions";
HELP.cas.academy       = "cal1-derivative";
HELP.cas.furtherAcademy = ["alg-poly-factor", "cal1-integral"];
HELP.numerics.academy  = "num-newton";
HELP.numerics.furtherAcademy = ["cal1-integral", "ode-first-order", "num-fft"];
HELP.ide.academy       = "disc-induction";
HELP.stats.academy     = "prob-distributions";
HELP.stats.furtherAcademy = ["prob-basics", "prob-hypothesis"];
HELP.matrix.academy    = "la-matmul";
HELP.matrix.furtherAcademy = ["la-determinant", "la-eigen", "la-svd", "ode-linear-systems"];
HELP.gsolve.academy    = "cal1-applications";
HELP.constants.academy = "prob-distributions";
HELP.terminal.academy  = "disc-modular";
HELP.notepad.academy   = "disc-induction";
HELP.workspace.academy = "k5-place-value";
