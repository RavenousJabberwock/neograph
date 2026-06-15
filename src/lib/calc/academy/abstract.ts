import type { Lesson } from "./types";

export const abstract: Lesson[] = [
  {
    id: "ab-groups",
    title: "Groups, subgroups, Lagrange",
    summary: "Closure, associativity, identity, inverses.",
    body: `A **group** is a set \`G\` with an associative operation \`·\`,
identity \`e ∈ G\`, and inverses for every element.

Examples: \`(ℤ, +)\`, \`(ℝ\\{0}, ×)\`, the symmetry group \`D₄\` of a
square (8 elements).

**Lagrange's theorem**: in a finite group, the order of any subgroup
divides the order of the group.`,
    exercises: [
      { q: "Order of ℤ/6ℤ?", kind: "numeric", answer: 6, explain: "6 cosets." },
      { q: "Is (ℕ, +) a group?",
        kind: "choice", choices: ["Yes", "No — missing inverses"], correct: 1,
        explain: "No additive inverses." },
      { q: "|D₄|", kind: "numeric", answer: 8, explain: "4 rotations + 4 reflections." },
    ],
  },
  {
    id: "ab-rings-fields",
    title: "Rings and fields",
    summary: "Two operations playing well together.",
    body: `A **ring** is \`(R, +, ·)\` with \`(R, +)\` an abelian group, \`·\`
associative and distributive over \`+\`. A **field** is a commutative ring
in which every nonzero element has a multiplicative inverse.

Examples: \`(ℤ, +, ·)\` is a ring but not a field; \`(ℚ, +, ·)\`, \`(ℝ, +, ·)\`,
and \`(ℤ/pℤ, +, ·)\` for prime \`p\` are fields.`,
    exercises: [
      { q: "Is ℤ/5ℤ a field?  1=yes/0=no.", kind: "numeric", answer: 1,
        explain: "Prime modulus." },
      { q: "Is ℤ/6ℤ a field?", kind: "numeric", answer: 0,
        explain: "Composite — zero divisors (2·3=0)." },
    ],
  },
  {
    id: "ab-homomorphism",
    title: "Homomorphisms & quotient groups",
    summary: "Structure-preserving maps; G/N.",
    body: `A group **homomorphism** \`φ : G → H\` satisfies
\`φ(xy) = φ(x) φ(y)\`. Its **kernel** \`ker φ = {x : φ(x) = e}\` is a
normal subgroup; the **first isomorphism theorem** gives
\`G/ker φ ≅ im φ\`.`,
    exercises: [
      { q: "ker of φ(x) = x mod 3, φ : ℤ → ℤ/3ℤ?",
        kind: "choice", choices: ["{0}", "ℤ", "3ℤ", "{0, 1, 2}"], correct: 2,
        explain: "Multiples of 3." },
    ],
  },
];
