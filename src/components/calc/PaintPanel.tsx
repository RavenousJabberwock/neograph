import { useEffect, useRef, useState } from "react";
import { Brush, Eraser, Trash2, Download, Square as SquareIcon, Circle as CircleIcon, Minus } from "lucide-react";

type Tool = "brush" | "eraser" | "line" | "rect" | "circle";
const COLORS = ["#00e8ff", "#ffb020", "#ff45c8", "#7cf578", "#ff6a3d", "#a888ff", "#ffffff", "#0b0f1a"];

export function PaintPanel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState<string>(COLORS[0]);
  const [size, setSize] = useState<number>(4);
  const drawing = useRef<{ x: number; y: number; snapshot?: ImageData } | null>(null);

  // Size canvas to wrapper once
  useEffect(() => {
    const c = canvasRef.current, w = wrapRef.current;
    if (!c || !w) return;
    const ro = new ResizeObserver(() => {
      const r = w.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const prev = document.createElement("canvas");
      prev.width = c.width; prev.height = c.height;
      prev.getContext("2d")?.drawImage(c, 0, 0);
      c.width = Math.max(100, r.width) * dpr;
      c.height = Math.max(100, r.height) * dpr;
      c.style.width = r.width + "px";
      c.style.height = r.height + "px";
      const ctx = c.getContext("2d"); if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "oklch(0.14 0.02 250)";
      ctx.fillRect(0, 0, c.width, c.height);
      if (prev.width > 0) ctx.drawImage(prev, 0, 0, prev.width / dpr, prev.height / dpr);
    });
    ro.observe(w);
    return () => ro.disconnect();
  }, []);

  const ctx2d = () => canvasRef.current?.getContext("2d") ?? null;

  const getPos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    const ctx = ctx2d(); if (!ctx) return;
    const p = getPos(e);
    (e.target as Element).setPointerCapture(e.pointerId);
    if (tool === "brush" || tool === "eraser") {
      ctx.strokeStyle = tool === "eraser" ? "oklch(0.14 0.02 250)" : color;
      ctx.lineWidth = size; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      drawing.current = p;
    } else {
      const c = canvasRef.current!;
      const dpr = window.devicePixelRatio || 1;
      drawing.current = { ...p, snapshot: ctx.getImageData(0, 0, c.width, c.height) };
      // restore transform after getImageData reset (it doesn't actually reset, but keep safe)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drawing.current; if (!d) return;
    const ctx = ctx2d(); if (!ctx) return;
    const p = getPos(e);
    if (tool === "brush" || tool === "eraser") {
      ctx.lineTo(p.x, p.y); ctx.stroke();
    } else {
      if (d.snapshot) ctx.putImageData(d.snapshot, 0, 0);
      ctx.strokeStyle = color; ctx.lineWidth = size;
      ctx.beginPath();
      if (tool === "line") { ctx.moveTo(d.x, d.y); ctx.lineTo(p.x, p.y); ctx.stroke(); }
      else if (tool === "rect") { ctx.strokeRect(d.x, d.y, p.x - d.x, p.y - d.y); }
      else if (tool === "circle") {
        const dx = p.x - d.x, dy = p.y - d.y;
        ctx.arc(d.x, d.y, Math.hypot(dx, dy), 0, Math.PI * 2); ctx.stroke();
      }
    }
  };

  const onUp = () => { drawing.current = null; };

  const clear = () => {
    const c = canvasRef.current, ctx = ctx2d();
    if (!c || !ctx) return;
    ctx.fillStyle = "oklch(0.14 0.02 250)";
    ctx.fillRect(0, 0, c.width, c.height);
  };
  const save = () => {
    const c = canvasRef.current; if (!c) return;
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png"); a.download = "paint.png"; a.click();
  };

  const tools: { id: Tool; icon: React.ComponentType<{ size?: number }>; label: string }[] = [
    { id: "brush", icon: Brush, label: "Brush" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "rect", icon: SquareIcon, label: "Rect" },
    { id: "circle", icon: CircleIcon, label: "Circ" },
  ];

  return (
    <div className="flex h-full">
      <div className="w-32 shrink-0 border-r border-border p-2 flex flex-col gap-2 bg-[oklch(0.2_0.03_250)]">
        <div className="text-[0.55rem] tracking-widest text-muted-foreground">TOOLS</div>
        <div className="grid grid-cols-2 gap-1">
          {tools.map((t) => (
            <button key={t.id} className="pill-btn !px-1 !py-1.5 flex-col" data-active={tool === t.id} onClick={() => setTool(t.id)}>
              <t.icon size={12} />
              <span className="text-[0.55rem]">{t.label}</span>
            </button>
          ))}
        </div>
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mt-1">COLOR</div>
        <div className="grid grid-cols-4 gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              className="h-5 w-5 rounded-sm border border-border"
              style={{ background: c, boxShadow: color === c ? `0 0 8px ${c}` : undefined }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="text-[0.55rem] tracking-widest text-muted-foreground mt-1">SIZE {size}px</div>
        <input type="range" min={1} max={40} value={size} onChange={(e) => setSize(Number(e.target.value))} />
        <div className="mt-auto flex flex-col gap-1">
          <button className="pill-btn" onClick={clear}><Trash2 size={12} />CLR</button>
          <button className="pill-btn" onClick={save}><Download size={12} />PNG</button>
        </div>
      </div>
      <div ref={wrapRef} className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block touch-none"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
    </div>
  );
}
