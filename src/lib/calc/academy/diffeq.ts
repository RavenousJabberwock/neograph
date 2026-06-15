import type { Lesson } from "./types";

export const diffeq: Lesson[] = [
  {
    id: "ode-first-order",
    title: "First-order ODEs",
    summary: "Separable and linear equations.",
    body: `**Separable**: if \`y' = g(x) h(y)\`, rearrange

$$\\int \\frac{dy}{h(y)} = \\int g(x)\\,dx.$$

**Linear**: \`y' + p(x) y = q(x)\`. Multiply by integrating factor
\`μ(x) = exp(∫ p dx)\`; the LHS becomes \`(μ y)'\`. Then integrate.`,
    exercises: [
      { q: "y' = y, y(0)=1.  y(1)?", kind: "numeric", answer: 2.71828, tol: 1e-3,
        explain: "y = eˣ." },
      { q: "y' + 2y = 0, y(0)=3.  y(1)?", kind: "numeric", answer: 0.40601, tol: 1e-3,
        explain: "y = 3 e⁻²ˣ." },
      { q: "y' = x, y(0)=0.  y(2)?", kind: "numeric", answer: 2,
        explain: "y = x²/2." },
    ],
    related: ["numerics"],
  },
  {
    id: "ode-second-order",
    title: "Linear constant-coefficient 2nd-order ODEs",
    summary: "Characteristic roots & damped oscillators.",
    body: `For \`y'' + b y' + c y = 0\` try \`y = e^{rt}\`. The
**characteristic equation** is \`r² + b r + c = 0\` with roots \`r₁, r₂\`:

* Distinct real → \`y = C₁ e^{r₁ t} + C₂ e^{r₂ t}\`.
* Repeated     → \`y = (C₁ + C₂ t) e^{r t}\`.
* Complex \`α ± iβ\` → \`y = e^{α t}(C₁ cos βt + C₂ sin βt)\`.

Damped harmonic oscillator: \`m x'' + c x' + k x = 0\` → over/critical/under-damped
depending on discriminant.`,
    exercises: [
      { q: "y'' − y = 0, characteristic roots ±?", kind: "numeric", answer: 1,
        explain: "r² = 1 → ±1; positive root is 1." },
      { q: "y'' + y = 0 has solutions of what form?",
        kind: "choice", choices: ["e^x", "sin & cos", "polynomials", "diverges"], correct: 1,
        explain: "r = ±i." },
    ],
  },
  {
    id: "ode-linear-systems",
    title: "Linear systems via eigenvalues",
    summary: "x' = A x.  Modes and stability.",
    body: `Solutions of \`x' = A x\` decompose into modes \`e^{λᵢ t} vᵢ\`
where \`(λᵢ, vᵢ)\` are eigenpairs of \`A\`. Stability of the origin:

* All \`Re(λᵢ) < 0\`: asymptotically stable.
* Any \`Re(λᵢ) > 0\`: unstable.
* Pure imaginary: center (closed orbits).`,
    exercises: [
      { q: "x' = [[0,1],[−1,0]] x. Origin is …",
        kind: "choice", choices: ["sink", "source", "center", "saddle"], correct: 2,
        explain: "λ = ±i." },
      { q: "x' = [[−1,0],[0,−2]] x. Origin is …",
        kind: "choice", choices: ["sink", "source", "saddle"], correct: 0,
        explain: "Both eigenvalues negative." },
    ],
    related: ["matrix", "numerics"],
  },
  {
    id: "ode-numerics",
    title: "Numerical methods: Euler & RK4",
    summary: "Discretise time, march forward.",
    body: `**Forward Euler**:  \`y_{n+1} = y_n + h · f(t_n, y_n)\`.
Order-1 accuracy; cheap but unstable for stiff problems.

**RK4** weights four slope samples per step:
\`\`\`
k₁ = f(t, y)
k₂ = f(t + h/2, y + (h/2) k₁)
k₃ = f(t + h/2, y + (h/2) k₂)
k₄ = f(t + h,   y + h k₃)
y_{n+1} = y_n + (h/6)(k₁ + 2k₂ + 2k₃ + k₄)
\`\`\`
Order-4 accuracy for one extra evaluation per dimension per step.`,
    exercises: [
      { q: "Euler step on y' = y, y(0)=1, h=0.1. y(0.1)?", kind: "numeric", answer: 1.1,
        explain: "1 + 0.1·1." },
    ],
    related: ["numerics"],
  },
  {
    id: "ode-practice-1",
    kind: "practice",
    title: "Practice set · ODEs mixed",
    summary: "6 problems across the chapter.",
    body: ``,
    exercises: [
      { q: "y' = ky, doubling time if k = ln 2.", kind: "numeric", answer: 1, explain: "y = e^{kt} doubles at t=1." },
      { q: "y'' + 4y = 0. Period of oscillation.", kind: "numeric", answer: 3.1416, tol: 1e-3,
        explain: "ω = 2 → T = π." },
      { q: "Solve y' − y = 0, y(0)=5. y(2) (3 d.p.).",
        kind: "numeric", answer: 36.945, tol: 0.05, explain: "5 e²." },
      { q: "Damping: discriminant > 0 means …",
        kind: "choice", choices: ["over", "critical", "under"], correct: 0,
        explain: "Two distinct real roots → over-damped." },
      { q: "Order of RK4.", kind: "numeric", answer: 4, explain: "Local error O(h⁵), global O(h⁴)." },
      { q: "Euler step on y' = −y, y(0)=1, h=0.5. y(0.5)?", kind: "numeric", answer: 0.5,
        explain: "1 + 0.5·(−1)." },
    ],
  },
];
