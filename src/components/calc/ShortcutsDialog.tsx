/**
 * ShortcutsDialog — global keyboard cheat sheet. Triggered by `?` (Shift+/)
 * or via the TopBar. Also wires up the documented Ctrl/Cmd+key bindings.
 */
import { useEffect, useState } from "react";
import { useCalc, type PanelKey } from "@/lib/calc/store";
import { Keyboard, X } from "lucide-react";

// [combo, panelKey, label]
const BINDINGS: Array<[string, PanelKey, string]> = [
  ["Ctrl+G", "graph",    "Graph"],
  ["Ctrl+T", "terminal", "Terminal"],
  ["Ctrl+N", "notepad",  "Notepad"],
  ["Ctrl+K", "calc",     "Calculator"],
  ["Ctrl+M", "matrix",   "Matrix"],
  ["Ctrl+I", "ide",      "IDE"],
  ["Ctrl+B", "cas",      "CAS"],
  ["Ctrl+R", "radio",    "Radio"],
  ["Ctrl+3", "plot3d",   "3D Surface"],
];

export function ShortcutsDialog() {
  const { showPanel, undoPlots, redoPlots } = useCalc();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't hijack typing in inputs / textareas / contenteditable
      const t = e.target as HTMLElement | null;
      const inField = !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "?" && !inField) { e.preventDefault(); setOpen((v) => !v); return; }
      if (e.key === "Escape" && open) { setOpen(false); return; }
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const k = e.key.toLowerCase();
      // Undo/redo
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undoPlots(); return; }
      if ((k === "y") || (k === "z" && e.shiftKey)) { e.preventDefault(); redoPlots(); return; }
      if (e.shiftKey) return;
      const map: Record<string, PanelKey> = {
        g: "graph", t: "terminal", n: "notepad", k: "calc",
        m: "matrix", i: "ide", b: "cas", r: "radio", "3": "plot3d",
      };
      if (k in map) {
        e.preventDefault();
        if (inField && k !== "k") return; // allow Ctrl+K everywhere
        showPanel(map[k]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, showPanel, undoPlots, redoPlots]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] grid place-items-center bg-[oklch(0_0_0/55%)] backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="panel w-[min(420px,90vw)]" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <span className="panel-title-dot" style={{ background: "var(--color-amber)", boxShadow: "0 0 8px var(--color-amber)" }} />
          <Keyboard size={12} /><span>KEYBOARD · SHORTCUTS</span>
          <button className="ml-auto pill-btn !px-1.5 !py-0.5" onClick={() => setOpen(false)}><X size={10} /></button>
        </div>
        <div className="panel-body p-3 text-[0.75rem] font-mono space-y-1">
          <div className="flex justify-between text-muted-foreground tracking-widest text-[0.6rem] mb-1">
            <span>COMBO</span><span>PANEL</span>
          </div>
          {BINDINGS.map(([combo, , label]) => (
            <div key={combo} className="flex justify-between">
              <span className="neon-text">{combo}</span>
              <span>{label}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 mt-2 text-[0.65rem] text-muted-foreground space-y-0.5">
            <div><span className="neon-text-amber">?</span> · toggle this cheat sheet</div>
            <div><span className="neon-text-amber">Ctrl+Z / Ctrl+Y</span> · undo/redo graph edits</div>
            <div><span className="neon-text-amber">Esc</span> · close dialog</div>
          </div>
        </div>
      </div>
    </div>
  );
}
