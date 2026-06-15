import type { Lesson } from "./types";

export const probstats: Lesson[] = [
  {
    id: "prob-basics",
    title: "Probability axioms & combinatorics",
    summary: "Sample spaces, counting, conditional, Bayes.",
    body: `Kolmogorov axioms: \`P(A) ≥ 0\`, \`P(Ω) = 1\`, countable
additivity for disjoint events.

Counting tools:
\`\`\`
permutations:  P(n,k) = n!/(n−k)!
combinations:  C(n,k) = n!/(k!(n−k)!)
\`\`\`

Conditional:  \`P(A|B) = P(A ∩ B)/P(B)\`.

**Bayes' theorem**:
$$P(A\\mid B) = \\frac{P(B\\mid A)\\,P(A)}{P(B)}.$$`,
    exercises: [
      { q: "C(52, 5)?", kind: "numeric", answer: 2598960, explain: "52!/(5!·47!)." },
      { q: "P(heart | red), standard deck.", kind: "numeric", answer: 0.5,
        explain: "13/26." },
      { q: "P(2 sixes in 2 fair dice).", kind: "numeric", answer: 0.0278, tol: 1e-3,
        explain: "1/36." },
      { q: "Disease 1 %, test 99 % accurate. P(disease | + test)?  (3 d.p.)",
        kind: "numeric", answer: 0.5, tol: 0.02,
        explain: "Bayes: 0.99·0.01 / (0.99·0.01 + 0.01·0.99) = 0.5." },
    ],
    related: ["stats"],
  },
  {
    id: "prob-rvs",
    title: "Random variables; expectation & variance",
    summary: "E[X], Var(X), linearity.",
    body: `For discrete X with pmf \`p(x)\`:

\`\`\`
E[X] = Σ x p(x)         Var(X) = E[X²] − (E[X])²
\`\`\`

Continuous: replace sums with integrals over the pdf.

Linearity:  \`E[aX + bY] = a E[X] + b E[Y]\`, always.
\`Var(aX) = a² Var(X)\`. Independent X,Y: \`Var(X+Y) = Var X + Var Y\`.`,
    exercises: [
      { q: "E[X] for fair die.", kind: "numeric", answer: 3.5, explain: "Average of 1..6." },
      { q: "Var of fair die (2 d.p.).", kind: "numeric", answer: 2.92, tol: 0.02,
        explain: "= 91/6 − (3.5)² = 35/12 ≈ 2.917." },
    ],
  },
  {
    id: "prob-distributions",
    title: "Discrete & continuous distributions",
    summary: "Bernoulli, Binomial, Poisson, Normal, Exponential.",
    body: `Common probability laws:

| name        | pmf / pdf                                       | mean   | variance |
|-------------|--------------------------------------------------|--------|----------|
| Bernoulli(p)| P(1)=p, P(0)=1−p                                  | p      | p(1−p)   |
| Binomial(n,p)| C(n,k) pᵏ(1−p)ⁿ⁻ᵏ                                | n p    | n p(1−p) |
| Poisson(λ)  | e⁻λ λᵏ/k!                                         | λ      | λ        |
| Normal(μ,σ²)| (1/√(2πσ²)) exp(−(x−μ)²/(2σ²))                    | μ      | σ²       |
| Exponential(λ)| λ e⁻λx, x ≥ 0                                   | 1/λ    | 1/λ²     |`,
    exercises: [
      { q: "X ~ Binomial(10, 0.5). E[X]?", kind: "numeric", answer: 5, explain: "n p." },
      { q: "Z ~ N(0,1). P(Z ≤ 0)?", kind: "numeric", answer: 0.5, explain: "Symmetric." },
      { q: "Exp(λ=2). Mean?", kind: "numeric", answer: 0.5, explain: "1/λ." },
      { q: "P(X=2) for Poisson(λ=1) (3 d.p.)", kind: "numeric", answer: 0.184, tol: 0.005,
        explain: "e⁻¹ · 1²/2! = 1/(2e)." },
    ],
    related: ["stats"],
  },
  {
    id: "prob-clt",
    title: "Central Limit Theorem",
    summary: "Sample means become normal.",
    body: `If \`X₁, …, Xₙ\` are iid with mean \`μ\` and variance \`σ²\`,
the sample mean \`X̄ₙ\` satisfies

$$\\sqrt{n}\\,(\\bar X_n - \\mu) \\xrightarrow{d} \\mathcal{N}(0, \\sigma^{2}).$$

In practice, \`X̄ₙ ≈ N(μ, σ²/n)\` for "large enough" \`n\` — often by
\`n ≈ 30\`. The CLT explains why so many things look bell-shaped.`,
    exercises: [
      { q: "n=100, σ=10. Std error of mean?", kind: "numeric", answer: 1,
        explain: "σ/√n = 1." },
    ],
  },
  {
    id: "prob-hypothesis",
    title: "Hypothesis testing & CIs",
    summary: "p-values, type I / II error, t-tests.",
    body: `Frame the question with a **null** \`H₀\` and **alternative**
\`H₁\`. The **p-value** is \`P(test statistic at least as extreme | H₀)\`.
Reject \`H₀\` when \`p < α\` (commonly 0.05). Type-I error rate is α.

One-sample t-statistic:
$$t = \\frac{\\bar x - \\mu_0}{s / \\sqrt{n}} \\sim t_{n-1}.$$

\`(1 − α)\` CI for the mean:  \`x̄ ± t_{α/2, n−1} · s/√n\`.`,
    exercises: [
      { q: "p = 0.03, α = 0.05. Reject H₀?",
        kind: "choice", choices: ["Reject", "Fail to reject"], correct: 0,
        explain: "0.03 < 0.05." },
      { q: "n=25, s=2, x̄=10, μ₀=9. t-statistic.", kind: "numeric", answer: 2.5,
        explain: "(10−9)/(2/√25) = 1/0.4 = 2.5." },
    ],
    related: ["stats"],
  },
  {
    id: "prob-regression",
    title: "Simple linear regression",
    summary: "Fitting y ≈ β₀ + β₁ x.",
    body: `Least squares minimises \`Σ (yᵢ − β₀ − β₁ xᵢ)²\`. Closed form:

\`\`\`
β₁ = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)² = Cov(x,y)/Var(x)
β₀ = ȳ − β₁ x̄
\`\`\`

The **coefficient of determination** \`R²\` equals the squared correlation
in simple regression: how much variance \`x\` "explains" in \`y\`.`,
    exercises: [
      { q: "If Cov(x,y) = 6 and Var(x) = 2, slope?", kind: "numeric", answer: 3,
        explain: "β₁ = 6/2 = 3." },
    ],
    related: ["stats"],
  },
  {
    id: "prob-practice-1",
    kind: "practice",
    title: "Practice set · probability & stats mixed",
    summary: "10 mixed problems.",
    body: ``,
    exercises: [
      { q: "P(roll 7 with two dice).", kind: "numeric", answer: 0.1667, tol: 1e-3, explain: "6/36." },
      { q: "C(10, 3).", kind: "numeric", answer: 120, explain: "10!/(3!·7!)." },
      { q: "E[X] for Uniform(0, 10).", kind: "numeric", answer: 5, explain: "(0+10)/2." },
      { q: "Z=(x−μ)/σ for x=70, μ=50, σ=10.", kind: "numeric", answer: 2, explain: "(70−50)/10." },
      { q: "Var of X+Y, indep, Var X=4, Var Y=9.", kind: "numeric", answer: 13, explain: "Add." },
      { q: "p-value 0.07 at α=0.05 → reject?  yes=1/no=0.", kind: "numeric", answer: 0,
        explain: "Fail to reject." },
      { q: "Binomial(20, 0.5) variance.", kind: "numeric", answer: 5, explain: "n p (1−p)." },
      { q: "Std error of sample mean, n=64, σ=8.", kind: "numeric", answer: 1, explain: "σ/√n." },
      { q: "Permutations of 5 distinct objects.", kind: "numeric", answer: 120, explain: "5!." },
      { q: "Correlation if Var=identical and Cov=Var.", kind: "numeric", answer: 1, explain: "Perfect linear." },
    ],
  },
];
