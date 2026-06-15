/**
 * markdown.ts — Tiny wrapper around `marked` + `dompurify`.
 * ------------------------------------------------------------------
 * Why a wrapper?
 *   • Centralises configuration (GFM, line breaks, no mangling).
 *   • Sanitises the HTML before it hits the DOM so a malicious paste
 *     cannot inject <script> / event handlers.
 * ------------------------------------------------------------------
 */
import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure once at module load (idempotent if hot-reloaded).
marked.setOptions({
  gfm: true,        // GitHub-flavored: tables, task lists, strikethrough.
  breaks: true,     // newline-in-paragraph → <br>
});

/** Render a Markdown string to sanitized HTML. */
export function renderMarkdown(src: string): string {
  // `marked.parse` is sync when not passed { async: true }.
  const raw = marked.parse(src ?? "", { async: false }) as string;
  // Use DOMPurify's default profile — strips scripts, event handlers, etc.
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}

/** Cheap heuristic: does this filename look like a Markdown document? */
export function isMarkdownName(name: string): boolean {
  return /\.(md|markdown|mdx)$/i.test(name);
}
