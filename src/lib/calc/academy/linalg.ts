import type { Lesson } from "./types";

export const linalg: Lesson[] = [
  {
    id: "la-vectors",
    title: "Vectors in ℝⁿ",
    summary: "Linear combinations, span, independence.",
    body: `A **vector** \`v ∈ ℝⁿ\` is an ordered list of \`n\` real numbers.
A **linear combination** of \`v₁, …, v_k\` is any
\`c₁ v₁ + … + c_k v_k\`. Their **span** is the set of all such combinations.

Vectors are **linearly independent** if the only \`c₁, …, c_k\` making
the combination \`0\` are all zero. A **basis** is an independent
spanning set; every basis of a finite-dimensional space has the same size,
the **dimension**.`,
    exercises: [
      { q: "Are (1,0) and (2,0) independent?",
        kind: "choice", choices: ["Yes", "No"], correct: 1,
        explain: "Second is 2× first." },
      { q: "Dim of span{(1,0,0), (0,1,0)} in ℝ³.", kind: "numeric", answer: 2,
        explain: "Two independent vectors." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-matmul",
    title: "Matrix multiplication & linear maps",
    summary: "(AB)ᵢⱼ = Σ Aᵢₖ Bₖⱼ. Why it composes maps.",
    body: `A matrix \`A ∈ ℝ^{m×n}\` encodes a linear map \`T : ℝⁿ → ℝᵐ\`.
The product \`AB\` is the matrix of the composed map \`T_A ∘ T_B\`:

$$(AB)_{ij} = \\sum_{k} A_{ik}\\,B_{kj}.$$

Matrix multiplication is associative but in general **not commutative**.
The **identity** \`I_n\` satisfies \`A I = I A = A\`.`,
    exercises: [
      { q: "[[1,2],[3,4]] · [[0,1],[1,0]] — (1,1) entry?", kind: "numeric", answer: 2,
        explain: "1·0 + 2·1." },
      { q: "If A is 3×4 and B is 4×2, AB is …",
        kind: "choice", choices: ["3×2", "4×4", "2×3", "undefined"], correct: 0,
        explain: "Outer dims." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-systems",
    title: "Linear systems & Gaussian elimination",
    summary: "Row reduce, back-substitute, classify.",
    body: `Encode \`Ax = b\` as the augmented matrix \`[A | b]\`. Row
operations don't change the solution set:

1. Swap two rows.
2. Multiply a row by a nonzero scalar.
3. Add a multiple of one row to another.

Reduce to **row echelon form**; back-substitute. A system is consistent
iff no row reads \`[0 … 0 | nonzero]\`; it has a unique solution iff every
column has a pivot.`,
    exercises: [
      { q: "Solve x+y=3, 2x−y=0. Enter x.", kind: "numeric", answer: 1,
        explain: "Add: 3x = 3, x=1, y=2." },
      { q: "Number of solutions of x+y=1, 2x+2y=4?",
        kind: "choice", choices: ["0", "1", "∞"], correct: 0,
        explain: "Parallel, inconsistent." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-determinant",
    title: "Determinant: signed volume scaler",
    summary: "Properties, computation, geometric meaning.",
    body: `\`det A\` is the signed factor by which \`A\` scales \`n\`-dim
volume. Key facts:

* \`det(AB) = det A · det B\`
* \`det Aᵀ = det A\`
* \`det A = 0  ⇔  A\` is singular (columns linearly dependent)
* Cofactor expansion gives a hand method; row reduction is \`O(n³)\`.`,
    exercises: [
      { q: "det [[2,1],[3,4]]", kind: "numeric", answer: 5, explain: "2·4 − 1·3." },
      { q: "If det A=3, det B=−2, det(AB)?", kind: "numeric", answer: -6,
        explain: "Multiplicative." },
      { q: "det of a 3×3 identity?", kind: "numeric", answer: 1, explain: "Diagonal." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-inverse",
    title: "Matrix inverse",
    summary: "Existence, computation, geometric meaning.",
    body: `\`A\` is invertible iff \`det A ≠ 0\` iff its columns are
independent. For 2×2:

\`\`\`
A = [[a,b],[c,d]],   A⁻¹ = (1/det A) · [[d,−b],[−c,a]].
\`\`\`

For larger \`A\`, use Gauss-Jordan on \`[A | I]\` until \`[I | A⁻¹]\`.`,
    exercises: [
      { q: "Inverse of [[1,2],[3,4]] — (1,1) entry.", kind: "numeric", answer: -2,
        explain: "det=−2; A⁻¹=(1/−2)[[4,−2],[−3,1]]; (1,1) = 4/−2 = −2." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-eigen",
    title: "Eigenvalues & eigenvectors",
    summary: "Av = λv.  Diagonalisation.",
    body: `An **eigenvector** of \`A\` is non-zero \`v\` with \`Av = λv\`;
\`λ\` is the corresponding **eigenvalue**. Eigenvalues are roots of the
**characteristic polynomial** \`det(A − λI) = 0\`.

If \`A\` has \`n\` independent eigenvectors, \`A = PDP⁻¹\` with
\`D = diag(λᵢ)\`. Then \`A^k = PD^kP⁻¹\`.`,
    exercises: [
      { q: "Eigenvalues of [[2,0],[0,3]]. Enter the smaller.", kind: "numeric", answer: 2,
        explain: "Diagonal." },
      { q: "trace = sum of …",
        kind: "choice", choices: ["eigenvectors", "eigenvalues", "singular values", "determinants"], correct: 1,
        explain: "tr = Σ λ; det = Π λ." },
      { q: "Eigenvalues of [[0,1],[1,0]]. Enter the smaller.", kind: "numeric", answer: -1,
        explain: "λ = ±1." },
    ],
    related: ["matrix"],
  },
  {
    id: "la-orthogonality",
    title: "Orthogonality & projection",
    summary: "Inner product, orthogonal bases, projections.",
    body: `Vectors \`u, v\` are **orthogonal** if \`u · v = 0\`. An
**orthonormal basis** is mutually orthogonal with unit length. The
projection of \`v\` onto a unit vector \`u\` is \`(v · u) u\`.

The Gram-Schmidt process orthonormalises any basis.`,
    exercises: [
      { q: "Projection of (3, 4) onto (1, 0).  (x-component)",
        kind: "numeric", answer: 3, explain: "v·u = 3." },
      { q: "Length of (1, 2, 2).", kind: "numeric", answer: 3, explain: "√9." },
    ],
  },
  {
    id: "la-svd",
    title: "Singular Value Decomposition",
    summary: "A = U Σ Vᵀ. Best low-rank approximation.",
    body: `Every real matrix factors as \`A = U Σ Vᵀ\` with \`U, V\`
orthogonal and \`Σ\` diagonal of non-negative **singular values**
\`σ₁ ≥ σ₂ ≥ … ≥ 0\`.

The rank-k truncation \`A_k = Σ σᵢ uᵢ vᵢᵀ\` (top-k singular triples) is
the best Frobenius approximation of rank ≤ k (**Eckart–Young**). The
foundation of PCA, image compression, and latent semantic analysis.`,
    exercises: [
      { q: "Number of singular values of a 5×3 matrix.", kind: "numeric", answer: 3,
        explain: "min(m,n)." },
    ],
    related: ["matrix", "stats"],
  },
  {
    id: "la-practice-1",
    kind: "practice",
    title: "Practice set · linear algebra mixed",
    summary: "10 mixed LA problems.",
    body: ``,
    exercises: [
      { q: "det [[1,2,3],[0,1,4],[0,0,5]]", kind: "numeric", answer: 5, explain: "Triangular: product diagonal." },
      { q: "Dim of ℝ⁵.", kind: "numeric", answer: 5, explain: "By definition." },
      { q: "(2,3)·(1,−2)", kind: "numeric", answer: -4, explain: "2 − 6." },
      { q: "Eigenvalues of [[3,0],[0,3]] (enter one).", kind: "numeric", answer: 3, explain: "Both equal." },
      { q: "Inverse of 2×2 [[1,0],[0,1]] — (1,1) entry.", kind: "numeric", answer: 1, explain: "Identity." },
      { q: "Row-reduce solution to x=2y, 3x − 6y=0: any nontrivial? 1=yes/0=no.",
        kind: "numeric", answer: 1, explain: "Infinite family x=2y." },
      { q: "Solve x+2y=5, 3x+4y=11. Enter x.", kind: "numeric", answer: 1, explain: "y=2." },
      { q: "Norm of (0,0,5).", kind: "numeric", answer: 5, explain: "5." },
      { q: "If columns of A are dependent, det A = ?", kind: "numeric", answer: 0, explain: "Singular." },
      { q: "Rank of [[1,2],[2,4]].", kind: "numeric", answer: 1, explain: "Rows proportional." },
    ],
  },
];
