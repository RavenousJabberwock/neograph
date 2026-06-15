import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalcProvider, useCalc, type PanelKey } from "@/lib/calc/store";
import { TopBar } from "@/components/calc/TopBar";
import { FloatingWindow } from "@/components/calc/FloatingWindow";
import { WorkspaceSidebar } from "@/components/calc/WorkspaceSidebar";
import { CalculatorPanel } from "@/components/calc/CalculatorPanel";
import { GraphPanel } from "@/components/calc/GraphPanel";
import { TablePanel } from "@/components/calc/TablePanel";
import { CasPanel } from "@/components/calc/CasPanel";
import { IdePanel } from "@/components/calc/IdePanel";
import { PaintPanel } from "@/components/calc/PaintPanel";
import { StatsPanel } from "@/components/calc/StatsPanel";
import { MatrixPanel } from "@/components/calc/MatrixPanel";
import { GSolvePanel } from "@/components/calc/GSolvePanel";
import { ConstantsPanel } from "@/components/calc/ConstantsPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Λ-Workstation · Cyberpunk Graphing Calculator" },
      { name: "description", content: "Cyberpunk multi-window scientific graphing calculator: CAS, Python IDE (Pyodide), Paint, stats/regression, matrix RREF, G-Solve, constants library." },
      { property: "og:title", content: "Λ-Workstation · Cyberpunk Graphing Calculator" },
      { property: "og:description", content: "Cyberpunk multi-window scientific graphing calculator: CAS, Python IDE (Pyodide), Paint, stats/regression, matrix RREF, G-Solve, constants library." },
    ],
  }),
  component: Index,
});

interface PanelDef {
  key: PanelKey;
  title: string;
  accent?: "cyan" | "amber" | "magenta";
  render: () => React.ReactNode;
}

const PANELS: PanelDef[] = [
  { key: "calc",      title: "CALCULATOR",          accent: "cyan",    render: () => <CalculatorPanel /> },
  { key: "graph",     title: "GRAPH · ENGINE",      accent: "cyan",    render: () => <GraphPanel /> },
  { key: "table",     title: "TABLE · VIEW",        accent: "amber",   render: () => <TablePanel /> },
  { key: "cas",       title: "CAS · SYMBOLIC",      accent: "magenta", render: () => <CasPanel /> },
  { key: "ide",       title: "IDE · PYTHON (PYODIDE)", accent: "cyan", render: () => <IdePanel /> },
  { key: "paint",     title: "PAINT · CANVAS",      accent: "magenta", render: () => <PaintPanel /> },
  { key: "stats",     title: "STATS · REGRESSION",  accent: "amber",   render: () => <StatsPanel /> },
  { key: "matrix",    title: "MATRIX · RREF / OPS", accent: "cyan",    render: () => <MatrixPanel /> },
  { key: "gsolve",    title: "G-SOLVE",             accent: "magenta", render: () => <GSolvePanel /> },
  { key: "constants", title: "CONSTANTS",           accent: "amber",   render: () => <ConstantsPanel /> },
];

function Index() {
  return (
    <CalcProvider>
      <Workstation />
    </CalcProvider>
  );
}

function Workstation() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { visible, windows } = useCalc();

  const minimized = PANELS.filter((p) => visible[p.key] && windows[p.key].min);

  return (
    <div className="flex flex-col h-screen w-screen">
      <TopBar onToggleSidebar={() => setSidebarOpen((v) => !v)} sidebarOpen={sidebarOpen} />
      <div className="flex-1 min-h-0 relative overflow-hidden"
           style={{
             backgroundImage: "linear-gradient(oklch(0.55 0.08 195 / 8%) 1px, transparent 1px), linear-gradient(90deg, oklch(0.55 0.08 195 / 8%) 1px, transparent 1px)",
             backgroundSize: "32px 32px",
           }}>
        {sidebarOpen && (
          <FloatingWindow panelKey="workspace" title="WORKSPACE" accent="amber">
            <WorkspaceSidebar />
          </FloatingWindow>
        )}
        {PANELS.map((p) =>
          visible[p.key] ? (
            <FloatingWindow key={p.key} panelKey={p.key} title={p.title} accent={p.accent}>
              {p.render()}
            </FloatingWindow>
          ) : null,
        )}
        {minimized.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 px-3 py-1.5 flex flex-wrap gap-1.5 border-t border-border bg-[oklch(0.16_0.03_250/85%)] backdrop-blur z-[9999]">
            <span className="text-[0.55rem] tracking-widest text-muted-foreground self-center">DOCK</span>
            {/* the FloatingWindow itself renders the minimized pill; this dock is just a hint */}
          </div>
        )}
      </div>
    </div>
  );
}
