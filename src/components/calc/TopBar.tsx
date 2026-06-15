import { useCalc, type PanelKey } from "@/lib/calc/store";
import {
  Calculator, LineChart, Table2, Sigma, PanelLeft, Power,
  Code2, Paintbrush, BarChart3, Grid3x3, Crosshair, BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";

export function TopBar({ onToggleSidebar, sidebarOpen }: { onToggleSidebar: () => void; sidebarOpen: boolean }) {
  const { visible, toggleVisible, casMode } = useCalc();
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setTime(new Date().toISOString().slice(11, 19));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const items: { key: PanelKey; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { key: "calc", label: "CALC", icon: Calculator },
    { key: "graph", label: "GRAPH", icon: LineChart },
    { key: "table", label: "TABLE", icon: Table2 },
    { key: "cas", label: "CAS", icon: Sigma },
    { key: "ide", label: "IDE", icon: Code2 },
    { key: "paint", label: "PAINT", icon: Paintbrush },
    { key: "stats", label: "STATS", icon: BarChart3 },
    { key: "matrix", label: "MATRIX", icon: Grid3x3 },
    { key: "gsolve", label: "G-SOLVE", icon: Crosshair },
    { key: "constants", label: "CONST", icon: BookOpen },
  ];

  return (
    <header className="flex items-center gap-3 px-3 py-1.5 border-b border-border bg-[var(--gradient-header)]">
      <button className="pill-btn" onClick={onToggleSidebar} data-active={sidebarOpen}>
        <PanelLeft size={12} />
      </button>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[var(--color-amber)] shadow-[0_0_8px_var(--color-amber)]" />
        <span className="text-xs tracking-[0.3em] uppercase neon-text">Λ-Workstation</span>
        <span className="text-[0.6rem] tracking-[0.25em] text-muted-foreground hidden xl:inline">v0.2 / CYBERLAB</span>
      </div>

      <div className="mx-3 h-5 w-px bg-border" />

      <nav className="flex items-center gap-1 flex-wrap">
        {items.map((it) => (
          <button
            key={it.key}
            className="pill-btn"
            data-active={visible[it.key]}
            onClick={() => toggleVisible(it.key)}
          >
            <it.icon size={12} />
            {it.label}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="text-[0.65rem] tracking-[0.25em] text-muted-foreground">
          CAS: <span className={casMode ? "neon-text" : "text-muted-foreground"}>{casMode ? "ON" : "OFF"}</span>
        </div>
        <div className="text-[0.65rem] tracking-[0.25em] text-muted-foreground tabular-nums" suppressHydrationWarning>
          <span suppressHydrationWarning>{time ?? "--:--:--"}</span> UTC
        </div>
        <Power size={14} className="text-[var(--color-amber)]" />
      </div>
    </header>
  );
}
