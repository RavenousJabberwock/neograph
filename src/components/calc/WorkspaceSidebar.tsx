import { useCalc, type PanelKey, type WallpaperName } from "@/lib/calc/store";
import { defaultViewport } from "@/lib/calc/math";
import { getGraphSnapshot } from "@/lib/calc/bridge";
import {
  FolderOpen, Save, FilePlus2, X, Calculator, LineChart, Table2, Sigma,
  Code2, Paintbrush, BarChart3, Grid3x3, Crosshair, BookOpen, Image as ImageIcon, Camera,
  Terminal as TermIcon, Radio as RadioIcon, NotebookPen, Box, Activity,
  Download, Upload,
} from "lucide-react";
import { useRef, useState } from "react";

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
  const { plots, setPlots, viewport, setViewport, visible, toggleVisible, casMode, setCasMode, vintage, setVintage, wallpaper, setWallpaper, exportState, importState } = useCalc();
  const [workspaces, setWorkspaces] = useState<Record<string, Workspace>>(loadAll());
  const [name, setName] = useState("default");
  const [pickPlot, setPickPlot] = useState<string>("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const downloadLayout = () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `neograph-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const uploadLayout = (f: File | undefined) => {
    if (!f) return;
    f.text().then((txt) => {
      const ok = importState(txt);
      if (!ok) alert("Not a valid neoGraph workspace file.");
    }).catch((e) => alert(`Read failed: ${e.message}`));
  };

  const presets: { name: WallpaperName; label: string }[] = [
    { name: "grid",      label: "GRID"      },
    { name: "scanlines", label: "SCAN"      },
    { name: "dots",      label: "DOTS"      },
    { name: "hex",       label: "HEX"       },
    { name: "plain",     label: "PLAIN"     },
  ];

  const importGraphSnapshot = () => {
    const url = getGraphSnapshot();
    if (!url) { alert("Open the Graph window first."); return; }
    setWallpaper({ kind: "image", url, label: "GRAPH" });
  };

  const importPlotAsWallpaper = () => {
    const p = plots.find((pp) => pp.id === pickPlot);
    if (!p) return;
    // render a fresh standalone snapshot of just this plot
    const W = 480, H = 320;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.fillStyle = "oklch(0.14 0.03 250)"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = p.color; ctx.lineWidth = 2.2; ctx.shadowColor = p.color; ctx.shadowBlur = 8;
    const { xMin, xMax, yMin, yMax } = viewport;
    const xToPx = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
    const yToPx = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;
    try {
      // dynamic to avoid extra import at module load
      import("@/lib/calc/math").then(({ math }) => {
        const compiled = math.compile(p.expr);
        ctx.beginPath(); let pen = false;
        for (let i = 0; i <= 800; i++) {
          const x = xMin + ((xMax - xMin) * i) / 800;
          let y = NaN; try { y = Number(compiled.evaluate({ x })); } catch { /* skip */ }
          if (!Number.isFinite(y)) { pen = false; continue; }
          const px = xToPx(x), py = yToPx(y);
          if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
        setWallpaper({ kind: "image", url: c.toDataURL("image/png"), label: `f(${p.expr.slice(0, 12)})` });
      });
    } catch { /* ignore */ }
  };

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
    { key: "calc",      label: "Calculator",      icon: Calculator },
    { key: "graph",     label: "Graph",           icon: LineChart },
    { key: "plot3d",    label: "3D Surface",      icon: Box },
    { key: "table",     label: "Table",           icon: Table2 },
    { key: "cas",       label: "CAS",             icon: Sigma },
    { key: "numerics",  label: "Numerics",        icon: Activity },
    { key: "ide",       label: "IDE (multi)",     icon: Code2 },
    { key: "terminal",  label: "Terminal",        icon: TermIcon },
    { key: "paint",     label: "Paint",           icon: Paintbrush },
    { key: "notepad",   label: "Notepad",         icon: NotebookPen },
    { key: "stats",     label: "Stats / Tests",   icon: BarChart3 },
    { key: "matrix",    label: "Matrix",          icon: Grid3x3 },
    { key: "gsolve",    label: "G-Solve",         icon: Crosshair },
    { key: "constants", label: "Constants",       icon: BookOpen },
    { key: "radio",     label: "Radio",           icon: RadioIcon },
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
        <button className="pill-btn" onClick={downloadLayout} title="Download workspace JSON"><Download size={12} />JSON</button>
        <button className="pill-btn" onClick={() => fileRef.current?.click()} title="Import workspace JSON"><Upload size={12} />OPEN</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
          onChange={(e) => uploadLayout(e.target.files?.[0])} />
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
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
          <ImageIcon size={10} /> CALC · WALLPAPER
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {presets.map((p) => (
            <button
              key={p.name}
              className="pill-btn !text-[0.6rem] !px-1.5 !py-0.5"
              data-active={wallpaper.kind === "preset" && wallpaper.name === p.name}
              onClick={() => setWallpaper({ kind: "preset", name: p.name })}
            >{p.label}</button>
          ))}
        </div>
        <button className="pill-btn w-full justify-center mb-1.5" onClick={importGraphSnapshot}>
          <Camera size={12} /> SNAP GRAPH WINDOW
        </button>
        <div className="flex gap-1">
          <select
            className="field !py-1 text-[0.65rem] flex-1"
            value={pickPlot}
            onChange={(e) => setPickPlot(e.target.value)}
          >
            <option value="">— pick curve —</option>
            {plots.map((p, i) => (
              <option key={p.id} value={p.id}>f{i + 1} · {p.expr.slice(0, 18)}</option>
            ))}
          </select>
          <button className="pill-btn !text-[0.6rem]" disabled={!pickPlot} onClick={importPlotAsWallpaper}>IMPORT</button>
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
        neoGraph v0.3 · Λ-workstation
      </div>
    </div>
  );
}
