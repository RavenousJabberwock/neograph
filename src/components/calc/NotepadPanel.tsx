/**
 * NotepadPanel
 * ------------------------------------------------------------------
 * Tabbed plain-text editor with persistence, find/replace, and .txt
 * import / export. On first open (no saved state) it seeds itself
 * from `SEED_TABS` (README + quickstart) so new users land on docs.
 * Subsequent opens restore whatever the user last had — including
 * any edits made to the seeded README copy.
 * ------------------------------------------------------------------
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, X, Download, Upload, Search, Pencil, Eye, Code2 } from "lucide-react";
import { SEED_TABS } from "@/lib/calc/seed-notes";
import { MarkdownView } from "@/components/calc/MarkdownView";
import { isMarkdownName } from "@/lib/calc/markdown";

interface Tab { id: string; name: string; content: string }

const STORE_KEY = "lvbl_notepad_v1";
/** Per-tab view-mode preference (rendered vs raw). Not persisted across reloads. */
type ViewMode = "render" | "edit";

/** Load saved tabs from localStorage, or seed bundled docs on first launch. */
function load(): { tabs: Tab[]; activeId: string } {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore — fall through to seed */ }
  const seeded: Tab[] = SEED_TABS.map((s, i) => ({
    id: `n_seed_${i}_${Date.now()}`,
    name: s.name,
    content: s.content,
  }));
  return { tabs: seeded, activeId: seeded[0].id };
}

export function NotepadPanel() {
  const initial = useMemo(load, []);
  const [tabs, setTabs] = useState<Tab[]>(initial.tabs);
  const [activeId, setActiveId] = useState<string>(initial.activeId);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [findOpen, setFindOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  // Per-tab view mode. Defaults to "render" for .md files, "edit" for the rest.
  const [viewModes, setViewModes] = useState<Record<string, ViewMode>>({});
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ tabs, activeId })); } catch { /* ignore */ }
  }, [tabs, activeId]);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const updateActive = (patch: Partial<Tab>) =>
    setTabs((prev) => prev.map((t) => (t.id === active.id ? { ...t, ...patch } : t)));

  const newTab = () => {
    const id = `n_${Date.now()}`;
    setTabs((prev) => [...prev, { id, name: `untitled-${prev.length + 1}.txt`, content: "" }]);
    setActiveId(id);
  };
  const closeTab = (id: string) => {
    if (tabs.length === 1) { setTabs([{ id: `n_${Date.now()}`, name: "scratch.md", content: "" }]); setActiveId(`n_${Date.now()}`); return; }
    const idx = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (id === activeId) setActiveId(next[Math.max(0, idx - 1)].id);
  };
  const saveTab = () => {
    const blob = new Blob([active.content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = active.name; a.click();
  };
  const loadTab = async (file: File) => {
    const text = await file.text();
    const id = `n_${Date.now()}`;
    setTabs((prev) => [...prev, { id, name: file.name, content: text }]);
    setActiveId(id);
  };

  // Find / replace
  useEffect(() => {
    if (!findText) { setMatchCount(0); return; }
    try {
      const re = new RegExp(escapeRe(findText), "g");
      const c = active.content.match(re); setMatchCount(c?.length ?? 0);
    } catch { setMatchCount(0); }
  }, [findText, active.content]);

  const replaceAll = () => {
    if (!findText) return;
    const re = new RegExp(escapeRe(findText), "g");
    updateActive({ content: active.content.replace(re, replaceText) });
  };

  const findNext = () => {
    const ta = taRef.current; if (!ta || !findText) return;
    const from = ta.selectionEnd ?? 0;
    const idx = active.content.indexOf(findText, from);
    const wrap = idx === -1 ? active.content.indexOf(findText) : idx;
    if (wrap >= 0) {
      ta.focus();
      ta.setSelectionRange(wrap, wrap + findText.length);
    }
  };

  const stats = useMemo(() => {
    const t = active.content;
    const words = (t.trim().match(/\S+/g) ?? []).length;
    const lines = t === "" ? 0 : t.split("\n").length;
    return { chars: t.length, words, lines };
  }, [active.content]);

  // shortcuts
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") { e.preventDefault(); setFindOpen((v) => !v); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); saveTab(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") { e.preventDefault(); newTab(); return; }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart, end = ta.selectionEnd;
      const v = ta.value;
      const next = v.slice(0, start) + "  " + v.slice(end);
      updateActive({ content: next });
      requestAnimationFrame(() => ta.setSelectionRange(start + 2, start + 2));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab strip */}
      <div className="flex items-center gap-1 px-1.5 py-1 border-b border-border overflow-x-auto">
        {tabs.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 text-[0.7rem] cursor-pointer shrink-0"
            data-active={t.id === activeId}
            style={t.id === activeId ? { background: "oklch(0.26 0.04 250)", color: "var(--color-primary)", borderColor: "var(--color-border-strong)" } : undefined}
            onClick={() => setActiveId(t.id)}
            onDoubleClick={() => { setRenamingId(t.id); setRenameValue(t.name); }}
          >
            {renamingId === t.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => { if (renameValue.trim()) setTabs((prev) => prev.map((x) => x.id === t.id ? { ...x, name: renameValue.trim() } : x)); setRenamingId(null); }}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                className="bg-transparent outline-none w-32 border-b border-border-strong"
              />
            ) : (
              <span className="truncate max-w-[10rem]">{t.name}</span>
            )}
            <button onClick={(e) => { e.stopPropagation(); closeTab(t.id); }} className="opacity-50 hover:opacity-100"><X size={10} /></button>
          </div>
        ))}
        <button className="pill-btn !px-1.5 !py-0.5 ml-1" onClick={newTab} title="New (⌘N)"><Plus size={10} /></button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-2 py-1 border-b border-border">
        <button className="pill-btn !text-[0.6rem]" onClick={saveTab} title="Download (⌘S)"><Download size={10} /> .txt</button>
        <button className="pill-btn !text-[0.6rem]" onClick={() => fileRef.current?.click()} title="Import"><Upload size={10} /> open</button>
        <input ref={fileRef} type="file" accept=".txt,.md,.log,.csv,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) loadTab(f); e.target.value = ""; }} />
        <button className="pill-btn !text-[0.6rem]" data-active={findOpen} onClick={() => setFindOpen((v) => !v)} title="Find / Replace (⌘F)"><Search size={10} /> find</button>
        <button className="pill-btn !text-[0.6rem]" onClick={() => { setRenamingId(active.id); setRenameValue(active.name); }}><Pencil size={10} /> rename</button>
        {isMarkdownName(active.name) && (
          <button
            className="pill-btn !text-[0.6rem]"
            data-active={effectiveMode === "render"}
            onClick={() => setViewModes((m) => ({ ...m, [active.id]: effectiveMode === "render" ? "edit" : "render" }))}
            title="Toggle Markdown render (⌘E)"
          >
            {effectiveMode === "render" ? <><Code2 size={10} /> source</> : <><Eye size={10} /> render</>}
          </button>
        )}
        <span className="ml-auto text-[0.55rem] tracking-widest text-muted-foreground tabular-nums">
          {stats.lines} L · {stats.words} W · {stats.chars} C
        </span>
      </div>

      {findOpen && (
        <div className="flex items-center gap-1.5 px-2 py-1 border-b border-border bg-[oklch(0.16_0.03_250)]">
          <input className="field !py-0.5 !text-[0.7rem] flex-1" placeholder="find" value={findText} onChange={(e) => setFindText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") findNext(); }} />
          <input className="field !py-0.5 !text-[0.7rem] flex-1" placeholder="replace" value={replaceText} onChange={(e) => setReplaceText(e.target.value)} />
          <button className="pill-btn !text-[0.6rem]" onClick={findNext}>next</button>
          <button className="pill-btn !text-[0.6rem]" onClick={replaceAll}>replace all</button>
          <span className="text-[0.55rem] tracking-widest text-muted-foreground tabular-nums w-12 text-right">{matchCount}</span>
        </div>
      )}

      {effectiveMode === "render" ? (
        <MarkdownView source={active.content} />
      ) : (
        <textarea
          ref={taRef}
          spellCheck={false}
          className="flex-1 min-h-0 bg-[oklch(0.13_0.025_250)] text-foreground p-3 font-mono text-[0.78rem] leading-relaxed outline-none resize-none"
          value={active.content}
          onChange={(e) => updateActive({ content: e.target.value })}
          onKeyDown={onKeyDown}
          placeholder="start typing…"
        />
      )}
    </div>
  );
}

function escapeRe(s: string) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
