/**
 * FloatingWindow — drag/resize chrome wrapping every panel.
 * Uses ref-based pointer handlers + useEffect cleanup so listeners can never
 * outlive the component (prevents the "phantom drag" memory leak that occurs
 * when a window is closed mid-drag).
 */
import { useCalc, type PanelKey } from "@/lib/calc/store";
import { X, Minus } from "lucide-react";
import { useCallback, useEffect, useRef, type ReactNode, type PointerEvent as RPE } from "react";

interface Props {
  panelKey: PanelKey;
  title: string;
  accent?: "cyan" | "amber" | "magenta";
  children: ReactNode;
}

export function FloatingWindow({ panelKey, title, accent = "cyan", children }: Props) {
  const { windows, setWindow, focusWindow, toggleVisible } = useCalc();
  const w = windows[panelKey];
  const dragRef = useRef<{ mode: "move" | "resize"; startX: number; startY: number; rect: typeof w } | null>(null);

  // Stable handlers stored in refs so add/removeEventListener pair up exactly.
  const moveHandlerRef = useRef<(e: PointerEvent) => void>(() => {});
  const upHandlerRef = useRef<() => void>(() => {});

  const endDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", moveHandlerRef.current);
    window.removeEventListener("pointerup", upHandlerRef.current);
    window.removeEventListener("pointercancel", upHandlerRef.current);
  }, []);

  // Re-bind handlers whenever inputs change so they close over the latest rect.
  moveHandlerRef.current = (e: PointerEvent) => {
    const d = dragRef.current; if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (d.mode === "move") {
      setWindow(panelKey, { x: Math.max(0, d.rect.x + dx), y: Math.max(0, d.rect.y + dy) });
    } else {
      setWindow(panelKey, { w: Math.max(240, d.rect.w + dx), h: Math.max(160, d.rect.h + dy) });
    }
  };
  upHandlerRef.current = endDrag;

  // Failsafe: if the component unmounts mid-drag, kill listeners.
  useEffect(() => endDrag, [endDrag]);

  const startDrag = (mode: "move" | "resize", e: RPE) => {
    e.preventDefault();
    focusWindow(panelKey);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, rect: { ...w } };
    window.addEventListener("pointermove", moveHandlerRef.current);
    window.addEventListener("pointerup", upHandlerRef.current);
    window.addEventListener("pointercancel", upHandlerRef.current);
  };

  if (w.min) {
    return (
      <div
        className="absolute"
        style={{ left: w.x, top: w.y, zIndex: w.z }}
        onPointerDown={() => focusWindow(panelKey)}
      >
        <button
          className="pill-btn"
          data-active
          onClick={() => setWindow(panelKey, { min: false })}
        >
          {title}
        </button>
      </div>
    );
  }

  const accentDot =
    accent === "amber" ? "var(--color-amber)" :
    accent === "magenta" ? "var(--color-magenta)" : "var(--color-primary)";

  return (
    <div
      className="absolute panel"
      style={{
        left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z,
        boxShadow: "0 20px 48px -16px oklch(0 0 0 / 75%), 0 0 0 1px var(--color-border)",
      }}
      onPointerDown={() => focusWindow(panelKey)}
    >
      <div
        className="panel-header cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => startDrag("move", e)}
        onDoubleClick={() => setWindow(panelKey, { min: true })}
      >
        <span className="panel-title-dot" style={{ background: accentDot, boxShadow: `0 0 8px ${accentDot}` }} />
        <span className="truncate">{title}</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            className="pill-btn !px-1.5 !py-0.5"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setWindow(panelKey, { min: true })}
            title="Minimize"
          ><Minus size={10} /></button>
          <button
            className="pill-btn !px-1.5 !py-0.5"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => toggleVisible(panelKey)}
            title="Close"
          ><X size={10} /></button>
        </div>
      </div>
      <div className="panel-body relative">{children}</div>
      <div
        className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
        onPointerDown={(e) => startDrag("resize", e)}
        style={{
          background:
            "linear-gradient(135deg, transparent 50%, var(--color-border-strong) 50%, var(--color-border-strong) 60%, transparent 60%, transparent 70%, var(--color-border-strong) 70%, var(--color-border-strong) 80%, transparent 80%)",
        }}
      />
    </div>
  );
}
