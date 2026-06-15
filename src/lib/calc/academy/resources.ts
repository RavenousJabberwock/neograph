/**
 * Curated external learning resources per stage.
 * ------------------------------------------------------------------
 * Each stage points to a small, high-signal set of free written and video
 * lessons covering its topics end-to-end. Per-lesson overrides can be set
 * on a Lesson's `resources` field; otherwise the AcademyPanel falls back to
 * the stage defaults below.
 *
 * MAINTENANCE: links rot. Re-verify quarterly. Prefer publishers known to
 * keep stable URLs (OpenStax, MIT OCW, Khan Academy, Paul's Online Math
 * Notes, 3Blue1Brown, Professor Leonard, NIST DLMF, AoPS).
 *
 * Licensing note: we LINK only — we do not embed or rehost. All targets are
 * free to access at time of writing.
 */

export type ResourceKind = "read" | "watch" | "practice";

export interface Resource {
  kind: ResourceKind;
  title: string;
  url: string;
  /** Publisher / channel — shown as a subtle suffix. */
  source: string;
}

export const STAGE_RESOURCES: Record<string, Resource[]> = {
  early: [
    { kind: "watch", title: "Early math — full course",                   url: "https://www.khanacademy.org/math/early-math",                   source: "Khan Academy" },
    { kind: "read",  title: "Prealgebra (OpenStax, free PDF)",            url: "https://openstax.org/details/books/prealgebra-2e",              source: "OpenStax" },
    { kind: "practice", title: "Bedtime Math problem-of-the-day",         url: "https://bedtimemath.org/",                                      source: "Bedtime Math" },
  ],
  pre: [
    { kind: "watch", title: "Pre-algebra full course",                    url: "https://www.khanacademy.org/math/pre-algebra",                  source: "Khan Academy" },
    { kind: "read",  title: "Prealgebra 2e (textbook)",                   url: "https://openstax.org/details/books/prealgebra-2e",              source: "OpenStax" },
    { kind: "watch", title: "Prealgebra playlist (full lectures)",        url: "https://www.youtube.com/playlist?list=PLF797E961509B4EB5",     source: "Professor Leonard" },
  ],
  algebra: [
    { kind: "watch", title: "Algebra I full course",                      url: "https://www.khanacademy.org/math/algebra",                      source: "Khan Academy" },
    { kind: "watch", title: "Algebra II full course",                     url: "https://www.khanacademy.org/math/algebra2",                     source: "Khan Academy" },
    { kind: "read",  title: "Intermediate Algebra 2e",                    url: "https://openstax.org/details/books/intermediate-algebra-2e",    source: "OpenStax" },
    { kind: "read",  title: "Algebra notes (Paul Dawkins)",               url: "https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx",          source: "Paul's Online Math Notes" },
  ],
  trig: [
    { kind: "watch", title: "Trigonometry full course",                   url: "https://www.khanacademy.org/math/trigonometry",                 source: "Khan Academy" },
    { kind: "read",  title: "Algebra & Trigonometry 2e",                  url: "https://openstax.org/details/books/algebra-and-trigonometry-2e",source: "OpenStax" },
    { kind: "read",  title: "Trig cheat sheet",                           url: "https://tutorial.math.lamar.edu/pdf/Trig_Cheat_Sheet.pdf",      source: "Paul's Online Math Notes" },
  ],
  precalc: [
    { kind: "watch", title: "Precalculus full course",                    url: "https://www.khanacademy.org/math/precalculus",                  source: "Khan Academy" },
    { kind: "read",  title: "Precalculus 2e (textbook)",                  url: "https://openstax.org/details/books/precalculus-2e",             source: "OpenStax" },
    { kind: "watch", title: "Precalculus lectures",                       url: "https://www.youtube.com/playlist?list=PLDesaqWTN6ESsmwELdrzhcGiRhk5DjwLP", source: "Professor Leonard" },
  ],
  calc1: [
    { kind: "read",  title: "Calculus Volume 1 (OpenStax)",               url: "https://openstax.org/details/books/calculus-volume-1",          source: "OpenStax" },
    { kind: "watch", title: "Essence of calculus (visual)",               url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr", source: "3Blue1Brown" },
    { kind: "watch", title: "MIT 18.01 Single Variable Calculus",         url: "https://ocw.mit.edu/courses/18-01-single-variable-calculus-fall-2006/", source: "MIT OCW" },
    { kind: "read",  title: "Calculus I notes",                           url: "https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx",      source: "Paul's Online Math Notes" },
  ],
  multivar: [
    { kind: "read",  title: "Calculus Volume 3 (OpenStax)",               url: "https://openstax.org/details/books/calculus-volume-3",          source: "OpenStax" },
    { kind: "watch", title: "MIT 18.02 Multivariable Calculus",           url: "https://ocw.mit.edu/courses/18-02-multivariable-calculus-fall-2007/", source: "MIT OCW" },
    { kind: "watch", title: "Multivariable calculus course",              url: "https://www.khanacademy.org/math/multivariable-calculus",       source: "Khan Academy" },
  ],
  linalg: [
    { kind: "watch", title: "Essence of linear algebra",                  url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", source: "3Blue1Brown" },
    { kind: "watch", title: "MIT 18.06 Linear Algebra (Strang)",          url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", source: "MIT OCW" },
    { kind: "read",  title: "Interactive linear algebra",                 url: "https://textbooks.math.gatech.edu/ila/",                        source: "Georgia Tech" },
  ],
  probstats: [
    { kind: "read",  title: "Introductory Statistics (OpenStax)",         url: "https://openstax.org/details/books/introductory-statistics",    source: "OpenStax" },
    { kind: "watch", title: "Statistics & probability",                   url: "https://www.khanacademy.org/math/statistics-probability",       source: "Khan Academy" },
    { kind: "read",  title: "Seeing Theory (interactive)",                url: "https://seeing-theory.brown.edu/",                              source: "Brown University" },
    { kind: "watch", title: "MIT 18.05 Intro to Probability & Stats",     url: "https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2014/", source: "MIT OCW" },
  ],
  ode: [
    { kind: "watch", title: "Differential equations (visual)",            url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNPOjrT6KVlfJuKtYTftqH6", source: "3Blue1Brown" },
    { kind: "watch", title: "MIT 18.03 Differential Equations",           url: "https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/", source: "MIT OCW" },
    { kind: "read",  title: "Differential equations notes",               url: "https://tutorial.math.lamar.edu/Classes/DE/DE.aspx",            source: "Paul's Online Math Notes" },
  ],
  discrete: [
    { kind: "read",  title: "Discrete Math — an Open Introduction",       url: "https://discrete.openmathbooks.org/dmoi3.html",                 source: "Levin (Open Textbook)" },
    { kind: "watch", title: "MIT 6.042J Math for Computer Science",       url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/", source: "MIT OCW" },
    { kind: "read",  title: "Book of Proof (Hammack)",                    url: "https://www.people.vcu.edu/~rhammack/BookOfProof/",             source: "VCU" },
  ],
  analysis: [
    { kind: "read",  title: "Basic Analysis (Lebl, free PDF)",            url: "https://www.jirka.org/ra/",                                     source: "Jiří Lebl" },
    { kind: "watch", title: "Real Analysis lectures",                     url: "https://www.youtube.com/playlist?list=PLBh2i93oe2qsGKDOsuVVw-OCAfprrnGfr", source: "Francis Su (Harvey Mudd)" },
    { kind: "read",  title: "Complex Analysis (Beck et al.)",             url: "https://math.sfsu.edu/beck/papers/complex.pdf",                 source: "SFSU" },
  ],
  abstract: [
    { kind: "read",  title: "Abstract Algebra: Theory & Applications",    url: "http://abstract.ups.edu/",                                      source: "Judson (Open Textbook)" },
    { kind: "watch", title: "Abstract algebra lectures",                  url: "https://www.youtube.com/playlist?list=PLelIK3uylPMGzHBuR3hLMHrYfMqWWsmx5", source: "Socratica" },
    { kind: "watch", title: "Harvard Math 122 Abstract Algebra",          url: "https://www.youtube.com/playlist?list=PLelIK3uylPMHnGqLBz3ssoFI8VYISpmgI", source: "Benedict Gross" },
  ],
  numerical: [
    { kind: "read",  title: "Numerical Recipes (web edition)",            url: "https://numerical.recipes/",                                    source: "Press et al." },
    { kind: "read",  title: "Numerical Analysis notes",                   url: "https://tutorial.math.lamar.edu/",                              source: "Paul's Online Math Notes" },
    { kind: "watch", title: "MIT 18.330 Intro to Numerical Analysis",     url: "https://ocw.mit.edu/courses/18-330-introduction-to-numerical-analysis-spring-2012/", source: "MIT OCW" },
    { kind: "read",  title: "NIST Digital Library of Math Functions",     url: "https://dlmf.nist.gov/",                                        source: "NIST DLMF" },
  ],
};

/** Universal fallbacks if a stage has no curated set yet. */
export const GENERIC_RESOURCES: Resource[] = [
  { kind: "read",  title: "Search Wikipedia for this topic",  url: "https://en.wikipedia.org/wiki/Mathematics", source: "Wikipedia" },
  { kind: "watch", title: "Khan Academy — math home",         url: "https://www.khanacademy.org/math",         source: "Khan Academy" },
];
