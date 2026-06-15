import type { Lesson } from "./types";

export const discrete: Lesson[] = [
  {
    id: "disc-logic",
    title: "Propositional logic & proof methods",
    summary: "AND, OR, NOT, →, contrapositive, contradiction.",
    body: `A **proposition** is a statement that's true or false. Connectives:
\`\`\`
¬p   not p           p ∧ q   and
p ∨ q  or            p → q   implies     p ↔ q   iff
\`\`\`

The **contrapositive** of \`p → q\` is \`¬q → ¬p\` — logically equivalent.

**Common proof strategies**:
* **Direct**: assume hypothesis, derive conclusion.
* **Contrapositive**: assume \`¬q\`, derive \`¬p\`.
* **Contradiction**: assume \`p ∧ ¬q\`, derive a falsehood.`,
    exercises: [
      { q: "Contrapositive of  'if rain then wet' is 'if not wet then …'?",
        kind: "choice", choices: ["rain", "not rain", "wet", "sun"], correct: 1,
        explain: "¬q → ¬p." },
      { q: "Truth value of (T ∧ F) ∨ T?",
        kind: "choice", choices: ["T", "F"], correct: 0,
        explain: "F ∨ T = T." },
    ],
  },
  {
    id: "disc-sets",
    title: "Sets, functions, relations",
    summary: "Union, intersection, equivalence classes.",
    body: `Sets carry elements with no order or multiplicity. Operations:
\`A ∪ B\`, \`A ∩ B\`, \`A \\ B\`, complement \`Aᶜ\` (relative to a universe).

A **function** \`f : A → B\` is a relation pairing each \`a ∈ A\` with
exactly one \`b\`. Injective (one-to-one), surjective (onto), bijective.

An **equivalence relation** is reflexive, symmetric, and transitive; its
equivalence classes partition the underlying set.`,
    exercises: [
      { q: "|A ∪ B| if |A|=10, |B|=8, |A ∩ B|=3.", kind: "numeric", answer: 15,
        explain: "Inclusion-exclusion." },
      { q: "Bijection between {1,2,3} and {a,b,c}? possible (1) or not (0).",
        kind: "numeric", answer: 1, explain: "Same finite size." },
    ],
  },
  {
    id: "disc-induction",
    title: "Mathematical induction",
    summary: "Base case → inductive step.",
    body: `To prove \`P(n)\` for all integers \`n ≥ n₀\`:

1. **Base**: verify \`P(n₀)\`.
2. **Step**: assume \`P(k)\` for some \`k ≥ n₀\` and prove \`P(k+1)\`.

A common trap: forgetting to actually **use** the induction hypothesis in
the step. Strong induction assumes \`P(n₀), …, P(k)\` simultaneously.`,
    exercises: [
      { q: "Closed form for 1+2+…+n (formula in n).", kind: "expression", answer: "n*(n+1)/2",
        explain: "Gauss." },
      { q: "1+3+5+…+(2n−1) =", kind: "expression", answer: "n^2",
        explain: "Sum of first n odd numbers." },
    ],
  },
  {
    id: "disc-combinatorics",
    title: "Counting: permutations, combinations, inclusion-exclusion",
    summary: "How many ways …",
    body: `\`n!\` orderings of \`n\` distinct items. **k-permutations**
\`P(n,k) = n!/(n−k)!\`; **combinations** \`C(n,k) = n!/(k!(n−k)!)\`.

**Inclusion-exclusion** for two sets: \`|A ∪ B| = |A| + |B| − |A ∩ B|\`.
Generalises with alternating signs.

**Pigeonhole**: \`n+1\` items in \`n\` boxes → some box has ≥ 2.`,
    exercises: [
      { q: "How many 4-letter strings from {a,b,c}, repeats allowed?",
        kind: "numeric", answer: 81, explain: "3⁴." },
      { q: "C(7, 2).", kind: "numeric", answer: 21, explain: "21 pairs." },
    ],
  },
  {
    id: "disc-modular",
    title: "Modular arithmetic & gcd",
    summary: "a ≡ b (mod n); Euclidean algorithm.",
    body: `\`a ≡ b (mod n)\` means \`n | (a − b)\`. Arithmetic respects ≡
in +, −, ×; division needs the modular inverse (exists iff
\`gcd(a, n) = 1\`).

**Euclidean algorithm**:  \`gcd(a, b) = gcd(b, a mod b),  gcd(a, 0) = a\`.
Foundation of RSA and lattice algorithms.`,
    exercises: [
      { q: "gcd(252, 198)", kind: "numeric", answer: 18, explain: "Chain to 18." },
      { q: "7·? ≡ 1 (mod 26).", kind: "numeric", answer: 15,
        explain: "7·15 = 105 = 4·26 + 1." },
      { q: "17 mod 5", kind: "numeric", answer: 2, explain: "17 − 3·5." },
    ],
  },
  {
    id: "disc-graphs",
    title: "Graphs: trees, paths, traversal",
    summary: "Vertices, edges, degree, BFS / DFS.",
    body: `A **graph** \`G = (V, E)\` is a set of vertices with a set of
edges. The **degree** of a vertex is the number of incident edges; sum of
degrees is \`2|E|\`.

A **tree** is a connected acyclic graph; \`|E| = |V| − 1\`. **Breadth-first
search** explores by layers, **depth-first** goes deep first. Both are
\`O(|V| + |E|)\` with adjacency lists.`,
    exercises: [
      { q: "Sum of degrees of K₄ (complete graph on 4 vertices)?",
        kind: "numeric", answer: 12, explain: "Each of 4 vertices has degree 3." },
      { q: "Edges in a tree of 10 vertices.", kind: "numeric", answer: 9,
        explain: "V − 1." },
    ],
  },
  {
    id: "disc-practice-1",
    kind: "practice",
    title: "Practice set · discrete mixed",
    summary: "8 mixed problems.",
    body: ``,
    exercises: [
      { q: "C(6, 3).", kind: "numeric", answer: 20, explain: "20." },
      { q: "Pigeonhole: 13 people, must share a birth … month? yes=1/no=0.",
        kind: "numeric", answer: 1, explain: "12 months." },
      { q: "Sum 1+2+…+50.", kind: "numeric", answer: 1275, explain: "50·51/2." },
      { q: "Number of subsets of {a,b,c,d}.", kind: "numeric", answer: 16, explain: "2⁴." },
      { q: "gcd(100, 75).", kind: "numeric", answer: 25, explain: "25 divides both." },
      { q: "3⁻¹ mod 7?", kind: "numeric", answer: 5, explain: "3·5=15≡1." },
      { q: "Vertices in a 4-leaf tree (just leaves & one center)?",
        kind: "numeric", answer: 5, explain: "Star K_{1,4}." },
      { q: "Truth table rows for 3 propositions.", kind: "numeric", answer: 8,
        explain: "2³." },
    ],
  },
];
