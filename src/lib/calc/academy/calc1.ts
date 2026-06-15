import type { Lesson } from "./types";

/** Single-variable calculus: limits, derivatives, applications, integrals,
 *  techniques of integration, sequences/series. */
export const calc1: Lesson[] = [
  {
    id: "cal1-limits",
    title: "Limits and continuity",
    summary: "The ε–δ idea, intuitively.",
    body: `\`lim_{x→a} f(x) = L\` means: we can make \`f(x)\` as close to
\`L\` as we like by choosing \`x\` sufficiently close (but not equal) to
\`a\`. Formally,

$$\\forall \\varepsilon > 0\\ \\exists \\delta > 0:\\ 0 < |x - a| < \\delta \\Rightarrow |f(x) - L| < \\varepsilon.$$

\`f\` is **continuous at a** iff \`lim_{x→a} f(x) = f(a)\`.

Useful limit:  \`lim_{x→0} sin x / x = 1\`.

**Indeterminate forms** (0/0, ∞/∞, 0·∞, ∞−∞, …) require work: factor,
rationalise, or use L'Hôpital later.`,
    exercises: [
      { q: "lim_{x→0} sin(3x)/x", kind: "numeric", answer: 3,
        explain: "= 3·sin(3x)/(3x) → 3·1." },
      { q: "lim_{x→2} (x²−4)/(x−2)", kind: "numeric", answer: 4,
        explain: "Cancel: x + 2 → 4." },
      { q: "Continuous at 0:  f(x)=|x|?",
        kind: "choice", choices: ["Yes", "No"], correct: 0,
        explain: "Both one-sided limits equal 0 = f(0)." },
      { q: "lim_{x→∞} (3x² − 1)/(x² + x).", kind: "numeric", answer: 3,
        explain: "Divide top & bottom by x²: → 3." },
    ],
    related: ["graph", "cas"],
  },
  {
    id: "cal1-derivative",
    title: "The derivative",
    summary: "Definition and the differentiation rules.",
    body: `Instantaneous rate of change:

$$f'(x) = \\lim_{h \\to 0}\\frac{f(x+h) - f(x)}{h}.$$

Core rules:

| rule       | formula                                   |
|------------|-------------------------------------------|
| constant   | (c)' = 0                                  |
| power      | (xⁿ)' = n xⁿ⁻¹                            |
| sum        | (f + g)' = f' + g'                        |
| product    | (fg)' = f'g + f g'                        |
| quotient   | (f/g)' = (f'g − f g') / g²                 |
| chain      | (f(g(x)))' = f'(g(x)) · g'(x)             |
| exp / log  | (eˣ)' = eˣ,  (ln x)' = 1/x                |
| trig       | (sin x)' = cos x, (cos x)' = −sin x        |

**Implicit differentiation** treats \`y\` as a function of \`x\` and
differentiates both sides of an equation, then solves for \`dy/dx\`.`,
    exercises: [
      { q: "d/dx[x³] at x=2", kind: "numeric", answer: 12, explain: "3x² = 12." },
      { q: "d/dx[sin(x²)] at x=0", kind: "numeric", answer: 0, explain: "cos(0)·0 = 0." },
      { q: "d/dx[x · eˣ]",
        kind: "choice", choices: ["eˣ", "x eˣ", "(1+x) eˣ", "(x−1) eˣ"], correct: 2,
        explain: "Product rule." },
      { q: "d/dx[ln(3x)] at x=1", kind: "numeric", answer: 1,
        explain: "= 3/(3x) = 1/x." },
      { q: "Implicit: x² + y² = 25. dy/dx at (3, 4)?", kind: "numeric", answer: -0.75,
        explain: "2x + 2y y' = 0 → y' = −x/y = −3/4." },
    ],
    related: ["cas", "numerics", "graph"],
  },
  {
    id: "cal1-applications",
    title: "Applications of the derivative",
    summary: "Extrema, related rates, linear approximation, L'Hôpital.",
    body: `**Critical points**: \`f'(x) = 0\` or undefined. Classify with
the second derivative or a sign chart.

**Linear approximation** near \`a\`:
\`f(x) ≈ f(a) + f'(a)(x − a)\`.

**Related rates**: differentiate an implicit relation with respect to
time, plug in known rates.

**L'Hôpital**: if \`f/g\` is \`0/0\` or \`∞/∞\` and \`f'/g'\` has a limit,
then \`lim f/g = lim f'/g'\`.`,
    exercises: [
      { q: "Local min of f(x)=x² − 6x + 11 at x = ?", kind: "numeric", answer: 3,
        explain: "f'=2x−6=0; f''=2>0." },
      { q: "Linearise √x near 100, eval at 101 (3 d.p.).",
        kind: "numeric", answer: 10.05, tol: 1e-3,
        explain: "L(x)=10 + (1/20)(x−100)." },
      { q: "lim_{x→0} (1 − cos x)/x²", kind: "numeric", answer: 0.5, tol: 1e-3,
        explain: "L'Hôpital twice: sin x/(2x) → cos x / 2 → 1/2." },
    ],
  },
  {
    id: "cal1-integral",
    title: "The definite integral",
    summary: "Riemann sums, FTC, substitution.",
    body: `Definite integral as signed area:

$$\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty}\\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x.$$

**Fundamental Theorem of Calculus**: if \`F' = f\` on \`[a, b]\`,

$$\\int_a^b f(x)\\,dx = F(b) - F(a).$$

**u-substitution**: if \`u = g(x)\`, then \`du = g'(x) dx\`, so
\`∫ f(g(x)) g'(x) dx = ∫ f(u) du\`.`,
    exercises: [
      { q: "∫₀¹ x² dx", kind: "numeric", answer: 0.3333, tol: 1e-3, explain: "x³/3 from 0 to 1." },
      { q: "∫₀^π sin x dx", kind: "numeric", answer: 2, explain: "−cos π + cos 0." },
      { q: "∫ 2x cos(x²) dx (no C)", kind: "expression", answer: "sin(x^2)",
        explain: "u = x²." },
      { q: "∫₁ᵉ (1/x) dx", kind: "numeric", answer: 1, explain: "ln e − ln 1 = 1." },
    ],
    related: ["numerics", "cas"],
  },
  {
    id: "cal1-techniques",
    title: "Techniques: parts, partial fractions, trig",
    summary: "When substitution alone isn't enough.",
    body: `**Integration by parts**:  \`∫ u dv = u v − ∫ v du\`. Pick \`u\`
to differentiate to something simpler (LIATE heuristic: Log, Inverse trig,
Algebraic, Trig, Exponential).

**Partial fractions** decompose \`p(x)/q(x)\` into simpler ratios once
\`q\` is factored over the reals.

**Trig substitution**: \`√(a² − x²) → x = a sin θ\`, \`√(a² + x²) → x = a tan θ\`,
\`√(x² − a²) → x = a sec θ\`.`,
    exercises: [
      { q: "∫ x eˣ dx, no C.  At x=1 equals?", kind: "numeric", answer: 0,
        explain: "= (x−1)eˣ; at x=1 → 0." },
      { q: "∫ 1/(x² − 1) dx = (1/2) ln|(x−1)/(x+1)|.  Coefficient (1/2)? Enter 0.5.",
        kind: "numeric", answer: 0.5, explain: "Partial fractions gives 1/2." },
    ],
    related: ["cas"],
  },
  {
    id: "cal1-series",
    title: "Sequences & series of numbers",
    summary: "Convergence tests, power series, Taylor.",
    body: `An infinite series \`Σ aₙ\` converges if its partial sums have a
limit. Quick tests:

* **n-th term**: if \`aₙ ⛒→ 0\`, diverges.
* **Geometric**: converges iff \`|r| < 1\`, sum \`a/(1−r)\`.
* **p-series \`Σ 1/nᵖ\`**: converges iff \`p > 1\`.
* **Ratio test**: if \`L = lim |aₙ₊₁/aₙ|\`, converges absolutely if
  \`L < 1\`, diverges if \`L > 1\`.

**Taylor series** of an analytic \`f\` about \`a\`:
$$f(x) = \\sum_{n=0}^{\\infty}\\frac{f^{(n)}(a)}{n!}(x-a)^{n}.$$`,
    exercises: [
      { q: "Σ_{n=1}^{∞} 1/n² (3 d.p.)", kind: "numeric", answer: 1.645, tol: 1e-3,
        explain: "π²/6." },
      { q: "Σ (2/3)ⁿ from n=0", kind: "numeric", answer: 3, explain: "1/(1 − 2/3)." },
      { q: "Taylor of eˣ at 0: 2nd-degree poly at x=1.", kind: "numeric", answer: 2.5,
        explain: "1 + 1 + 1/2 = 2.5." },
    ],
  },
  {
    id: "cal1-practice-1",
    kind: "practice",
    title: "Practice set · single-variable calculus",
    summary: "10 mixed limits / derivatives / integrals.",
    body: `Mix of techniques; if you stall, name the rule before you push
ahead with calculation.`,
    exercises: [
      { q: "lim_{x→0} (eˣ − 1)/x", kind: "numeric", answer: 1, explain: "L'Hôpital or Taylor." },
      { q: "d/dx[x⁵] at x=1", kind: "numeric", answer: 5, explain: "5x⁴." },
      { q: "d/dx[cos(2x)] at x=0", kind: "numeric", answer: 0, explain: "−2 sin 0." },
      { q: "∫₀¹ 3x² dx", kind: "numeric", answer: 1, explain: "x³." },
      { q: "∫₀² (x+1) dx", kind: "numeric", answer: 4, explain: "x²/2 + x → 2 + 2." },
      { q: "Critical x of f=x³ − 3x", kind: "numeric", answer: 1,
        explain: "f'=3x²−3=0; positive critical = 1." },
      { q: "d²/dx²[sin x] at x=0", kind: "numeric", answer: 0, explain: "−sin 0." },
      { q: "lim_{x→∞} (ln x)/x", kind: "numeric", answer: 0, explain: "Logs lose to powers." },
      { q: "Antiderivative of 1/(1+x²)?  Enter at x=1.",
        kind: "numeric", answer: 0.7854, tol: 1e-3,
        explain: "arctan 1 = π/4." },
      { q: "Avg value of f=x on [0,4]?", kind: "numeric", answer: 2,
        explain: "(1/4)·∫₀⁴ x dx = 8/4." },
    ],
  },
];
