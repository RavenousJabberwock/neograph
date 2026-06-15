// LaTeX rendering helpers (lazy KaTeX import).
import katex from "katex";
import "katex/dist/katex.min.css";
import { math } from "./math";

export function tex(latex: string, opts: { displayMode?: boolean } = {}) {
  try {
    return katex.renderToString(latex, {
      displayMode: opts.displayMode ?? false,
      throwOnError: false,
      strict: false,
      output: "html",
    });
  } catch {
    return `<span class="text-destructive">LaTeX error</span>`;
  }
}

// Convert a mathjs node / string into TeX, falling back to escaped raw text.
export function exprToTex(expr: string): string {
  try {
    const node = math.parse(expr);
    return node.toTex({ parenthesis: "auto", implicit: "hide" });
  } catch {
    return expr.replace(/[\\{}&%$#_^~]/g, (m) => "\\" + m);
  }
}

export function renderExpr(expr: string, opts: { displayMode?: boolean } = {}) {
  return tex(exprToTex(expr), opts);
}
