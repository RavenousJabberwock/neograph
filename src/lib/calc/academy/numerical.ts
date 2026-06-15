import type { Lesson } from "./types";

export const numerical: Lesson[] = [
  {
    id: "num-floating",
    title: "Floating point & error",
    summary: "Rounding error, cancellation, conditioning.",
    body: `IEEE-754 doubles store ≈ 16 significant decimal digits. Two
recurring failure modes:

* **Cancellation**: subtracting nearly-equal numbers wipes out significant
  digits. Rearrange to avoid it (e.g. compute \`√(x²+1) − x\` as
  \`1/(√(x²+1) + x)\`).
* **Stiffness / conditioning**: small input perturbations produce huge
  output changes when the **condition number** is large.

A correctly designed algorithm is **stable** (errors don't blow up
relative to the input perturbation).`,
    exercises: [
      { q: "0.1 + 0.2 in IEEE-754 doubles exactly equals 0.3? 1/0.",
        kind: "numeric", answer: 0,
        explain: "0.1 has no exact binary expansion." },
    ],
  },
  {
    id: "num-bisection",
    title: "Bisection method",
    summary: "Guaranteed convergence for sign-change roots.",
    body: `If \`f\` is continuous and \`f(a)·f(b) < 0\`, a root lies in
\`[a, b]\`. Halve the interval, keep the side where the sign changes.

* Each step gains one bit of accuracy.
* No derivatives required.
* Linear convergence — slow but bulletproof. Combine with Newton for
  speed once close.`,
    exercises: [
      { q: "Steps to shrink [0, 1] to width ≤ 1e-3 (ceil log₂(1000)).",
        kind: "numeric", answer: 10, explain: "2¹⁰ = 1024." },
    ],
    related: ["numerics"],
  },
  {
    id: "num-newton",
    title: "Newton's method",
    summary: "Quadratic convergence near a simple root.",
    body: `Given differentiable \`f\` and \`x₀\`, iterate

$$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}.$$

Near a simple root \`x*\` (where \`f'(x*) ≠ 0\`) convergence is
**quadratic** — correct digits roughly double per step.

Pitfalls: division by zero at \`f'(xₙ) = 0\`; divergence from a poor
seed; slow on multiple roots (use modified Newton or bisection fallback).`,
    exercises: [
      { q: "Newton on f=x²−2 from x₀=1. One step gives x₁?",
        kind: "numeric", answer: 1.5, explain: "1 − (1−2)/(2·1) = 1.5." },
      { q: "Order of Newton's convergence near a simple root.",
        kind: "numeric", answer: 2, explain: "Quadratic." },
    ],
    related: ["numerics"],
  },
  {
    id: "num-linear-solve",
    title: "Solving linear systems",
    summary: "LU, Cholesky, conditioning.",
    body: `Direct factorisations:

* **LU** with partial pivoting: \`PA = LU\`. \`O(n³)\` setup, \`O(n²)\`
  for each new \`b\`.
* **Cholesky** when \`A\` is symmetric positive-definite: \`A = LLᵀ\`.
  Half the cost of LU.

The system is **ill-conditioned** when \`κ(A) = σ_max/σ_min\` is huge —
small \`b\` perturbations produce wild \`x\` changes.`,
    exercises: [
      { q: "Cost (flops) of solving Ax=b for new b after LU factorisation?",
        kind: "choice", choices: ["O(n)", "O(n²)", "O(n³)"], correct: 1,
        explain: "Two triangular solves." },
    ],
  },
  {
    id: "num-quadrature",
    title: "Quadrature: trapezoid, Simpson, Gauss",
    summary: "Numerical integration.",
    body: `**Trapezoid rule**: \`(h/2)(f(a) + 2 Σ f(xᵢ) + f(b))\` — O(h²)
error.

**Simpson's rule**: fits parabolas to triples of points; O(h⁴) error if
\`f ∈ C⁴\`.

**Gaussian quadrature** picks nodes and weights to integrate polynomials
up to degree \`2n − 1\` exactly with \`n\` points — the best you can do
without knowing the integrand's structure.`,
    exercises: [
      { q: "Simpson's rule on f=x² over [0,1] with one panel — exact answer?",
        kind: "numeric", answer: 0.3333, tol: 1e-3,
        explain: "Simpson is exact for polynomials up to degree 3." },
    ],
  },
  {
    id: "num-fft",
    title: "Discrete Fourier Transform",
    summary: "Frequency decomposition; O(n log n) via FFT.",
    body: `For \`x ∈ ℂⁿ\`, the DFT is

$$X_k = \\sum_{j=0}^{n-1} x_j\\,\\omega^{jk},\\quad \\omega = e^{-2\\pi i/n}.$$

The **Fast Fourier Transform** computes it in \`O(n log n)\` by recursive
halving (Cooley–Tukey). Underpins signal processing, polynomial
multiplication, and PDE solvers.`,
    exercises: [
      { q: "Naive DFT cost for n=1024 ≈ n²?", kind: "numeric", answer: 1048576,
        explain: "1024²." },
      { q: "FFT cost in n log₂ n for n=1024?", kind: "numeric", answer: 10240,
        explain: "1024 · 10." },
    ],
  },
  {
    id: "num-practice-1",
    kind: "practice",
    title: "Practice set · numerical methods mixed",
    summary: "6 mixed problems.",
    body: ``,
    exercises: [
      { q: "Bisection iterations to reduce error by factor 1024.",
        kind: "numeric", answer: 10, explain: "2¹⁰." },
      { q: "Newton converges quadratically. Order?", kind: "numeric", answer: 2, explain: "p=2." },
      { q: "Cholesky requires what property?",
        kind: "choice", choices: ["any square", "symmetric", "symmetric positive-definite"],
        correct: 2, explain: "SPD." },
      { q: "Trapezoid error order in h.", kind: "numeric", answer: 2, explain: "O(h²)." },
      { q: "Condition number is small ⇒ … (well/ill conditioned).  Enter 1=well, 0=ill.",
        kind: "numeric", answer: 1, explain: "Small κ → well." },
      { q: "FFT speedup over naive at n=2²⁰ (round to integer ×).",
        kind: "numeric", answer: 52429, tol: 1000,
        explain: "n / log₂ n = 2²⁰ / 20 ≈ 52 429." },
    ],
  },
];
