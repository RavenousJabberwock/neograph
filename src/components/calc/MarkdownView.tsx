/**
 * MarkdownView — Render sanitized Markdown HTML with terminal-y styling
 * that matches the rest of the workstation (mono font, neon links/headings).
 * Pure presentation; the sanitization happens upstream in renderMarkdown().
 */
import { useMemo } from "react";
import { renderMarkdown } from "@/lib/calc/markdown";

export function MarkdownView({ source }: { source: string }) {
  const html = useMemo(() => renderMarkdown(source), [source]);
  return (
    <div
      className="md-view flex-1 min-h-0 overflow-auto bg-[oklch(0.13_0.025_250)] p-5 text-[0.82rem] leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
