import { useCalc, type PanelKey } from "@/lib/calc/store";
import { defaultViewport } from "@/lib/calc/math";
import {
  FolderOpen, Save, FilePlus2, X, Calculator, LineChart, Table2, Sigma,
  Code2, Paintbrush, BarChart3, Grid3x3, Crosshair, BookOpen,
} from "lucide-react";
import { useState } from "react";

const STORAGE_KEY = "lvbl_calc_workspaces_v2";

interface Workspace {
  name: string;
  data: {
    plots: unknown;
    viewport: typeof defaultViewport;
    visible: Record<PanelKey, boolean>;
    casMode: boolean;
    vintage: boolean;
  };
}

function loadAll(): Record<string, Workspace> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}
function saveAll(ws: Record<string, Workspace>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
}

export function WorkspaceSidebar() {
  const { plots, setPlots, viewport, setViewport, visible, toggleVisible, casMode, setCasMode, vintage, setVintage } = useCalc();
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>(loadAll());
  const [name, setName] = useState("default");

  const save = () => {
    const ws: Workspace = { name, data: { plots, viewport, visible, casMode, vintage } };
    const next = { ...workspaces, [name]: ws };
    setWorkspaces(next); saveAll(next);
  };
  const load = (n: string) => {
    const ws = workspaces[n]; if (!ws) return;
    setPlots(ws.data.plots as Parameters<typeof setPlots>[0]);
    setViewport(ws.data.viewport);
    setCasMode(ws.data.casMode);
    setVintage(ws.data.vintage);
    (Object.keys(visible) as PanelKey[]).forEach((k) => {
      if (visible[k] !== ws.data.visible?.[k]) toggleVisible(k);
    });
    setName(n);
  };
  const del = (n: string) => {
    const next = { ...workspaces }; delete next[n];
    setWorkspaces(next); saveAll(next);
  };
  const newWs = () => {
    setPlots([]);
    setViewport(defaultViewport);
    setCasMode(false);
    setVintage(false);
  };

  const panelList: { key: PanelKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: "calc",      label: "Calculator", icon: Calculator },
    { key: "graph",     label: "Graph",      icon: LineChart },
    { key: "table",     label: "Table",      icon: Table2 },
    { key: "cas",       label: "CAS",        icon: Sigma },
    { key: "ide",       label: "IDE (Python)", icon: Code2 },
    { key: "paint",     label: "Paint",      icon: Paintbrush },
    { key: "stats",     label: "Stats / Regression", icon: BarChart3 },
    { key: "matrix",    label: "Matrix",     icon: Grid3x3 },
    { key: "gsolve",    label: "G-Solve",    icon: Crosshair },
    { key: "constants", label: "Constants",  icon: BookOpen },
  ];

  return (
    <div className="p-3 flex flex-col gap-3 text-[0.75rem] h-full overflow-auto">
      <div>
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1">NAME</div>
        <input className="field !py-1 text-[0.72rem]" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <button className="pill-btn" onClick={newWs}><FilePlus2 size={12} />NEW</button>
        <button className="pill-btn" onClick={save}><Save size={12} />SAVE</button>
        <button className="pill-btn" onClick={() => load(name)}><FolderOpen size={12} />LOAD</button>
      </div>

      <div>
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1.5">SAVED</div>
        <div className="space-y-1">
          {Object.keys(workspaces).length === 0 && (
            <div className="text-muted-foreground text-[0.7rem]">No workspaces saved.</div>
          )}
          {Object.keys(workspaces).map((n) => (
            <div key={n} className="flex items-center gap-1 rounded-sm border border-border bg-[oklch(0.23_0.03_250)] px-2 py-1">
              <button className="flex-1 text-left neon-text truncate" onClick={() => load(n)}>{n}</button>
              <button className="pill-btn !px-1.5" onClick={() => del(n)}><X size={12} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-3">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1.5">PANELS</div>
        <div className="space-y-1">
          {panelList.map((p) => (
            <label key={p.key} className="flex items-center gap-2 cursor-pointer hover:text-primary">
              <input type="checkbox" checked={visible[p.key]} onChange={() => toggleVisible(p.key)} />
              <p.icon size={12} /> {p.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-auto text-[0.55rem] text-muted-foreground tracking-[0.25em] uppercase">
        v0.2 · sci-fi workstation
      </div>
    </div>
  );
}
