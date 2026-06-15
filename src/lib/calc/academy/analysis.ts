import type { Lesson } from "./types";

export const analysis: Lesson[] = [
  {
    id: "an-sequences",
    title: "Sequences of real numbers",
    summary: "Convergence, monotone & bounded, Cauchy.",
    body: `A sequence \`(aₙ)\` **converges** to \`L\` iff
\`∀ε>0  ∃N  ∀n ≥ N: |aₙ − L| < ε\`.

* Bounded + monotone ⇒ convergent (in ℝ).
* Every convergent sequence is Cauchy; in ℝ the converse also holds — ℝ is
  **complete**.`,
    exercises: [
      { q: "Limit of aₙ = (n+1)/n.", kind: "numeric", answer: 1, explain: "1 + 1/n → 1." },
      { q: "Is aₙ = (−1)ⁿ convergent? yes=1/no=0.", kind: "numeric", answer: 0,
        explain: "Oscillates." },
    ],
  },
  {
    id: "an-epsilon-delta",
    title: "ε–δ continuity",
    summary: "The precise definition with a model proof.",
    body: `\`f: ℝ → ℝ\` is continuous at \`a\` iff
$$\\forall \\varepsilon > 0\\ \\exists \\delta > 0:\\ |x - a| < \\delta \\Rightarrow |f(x) - f(a)| < \\varepsilon.$$

**Model proof** that \`f(x) = 2x + 1\` is continuous at every \`a\`: given
\`ε > 0\`, choose \`δ = ε/2\`. Then \`|x − a| < δ ⇒ |f(x) − f(a)| = 2|x − a| < ε\`.

**Uniform continuity** demands one \`δ\` for the whole domain
(Heine–Cantor: continuous + compact ⇒ uniform).`,
    exercises: [
      { q: "f(x)=3x, ε=0.6 → smallest workable δ?",
        kind: "numeric", answer: 0.2, explain: "δ = ε/3." },
      { q: "Continuous on compact set ⇒ uniformly continuous? 1=yes/0=no",
        kind: "numeric", answer: 1, explain: "Heine–Cantor." },
    ],
  },
  {
    id: "an-series",
    title: "Series convergence tests",
    summary: "Comparison, ratio, root, integral, alternating.",
    body: `Workhorses:

* **Comparison**: \`0 ≤ aₙ ≤ bₙ\` with \`Σ bₙ\` convergent ⇒ \`Σ aₙ\` convergent.
* **Ratio**: \`L = lim |aₙ₊₁/aₙ|\`; L<1 abs conv, L>1 div, L=1 inconclusive.
* **Root**: \`L = lim ⁿ√|aₙ|\`; same trichotomy.
* **Integral test**: for \`f\` positive decreasing, \`Σ f(n)\` ≈ \`∫ f\`.
* **Alternating series**: \`Σ (−1)ⁿ aₙ\` converges if \`aₙ ↓ 0\`.`,
    exercises: [
      { q: "Σ 1/n² converges? 1/0.", kind: "numeric", answer: 1, explain: "p-series p=2." },
      { q: "Σ (−1)ⁿ/n converges? 1/0.", kind: "numeric", answer: 1, explain: "Alternating, aₙ↓0." },
    ],
  },
  {
    id: "an-complex-cr",
    title: "Complex analysis: Cauchy–Riemann",
    summary: "When a complex function is differentiable.",
    body: `Write \`f(z) = u(x, y) + i v(x, y)\` with \`z = x + iy\`.
\`f\` is **holomorphic** on an open set iff \`u, v\` are real-differentiable
there and satisfy

$$\\partial_x u = \\partial_y v, \\qquad \\partial_y u = -\\partial_x v.$$

Consequence: \`u\` and \`v\` are **harmonic** (satisfy \`Δφ = 0\`).`,
    exercises: [
      { q: "Is f(z)=z̄ holomorphic?",
        kind: "choice", choices: ["Yes", "No"], correct: 1,
        explain: "Cauchy–Riemann fails." },
    ],
  },
  {
    id: "an-measure",
    title: "Measure theory & Lebesgue integral (intro)",
    summary: "Why the Riemann integral isn't enough.",
    body: `Lebesgue measure assigns a "size" to (most) subsets of ℝⁿ. The
**Lebesgue integral** sums over level sets — it makes interchanging limits
and integrals (monotone convergence, dominated convergence) tractable, and
integrates functions Riemann can't (e.g. the Dirichlet function).`,
    exercises: [
      { q: "Lebesgue measure of {x ∈ ℚ : 0 ≤ x ≤ 1} ?",
        kind: "numeric", answer: 0,
        explain: "Countable sets have measure 0." },
    ],
  },
];
