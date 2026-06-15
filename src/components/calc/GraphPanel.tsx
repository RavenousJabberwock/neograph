import { useCalc } from "@/lib/calc/store";
import { math, PLOT_COLORS, defaultViewport, type PlotExpr } from "@/lib/calc/math";
import { useEffect, useRef, useState, useCallback } from "react";
import { Download, Plus, Trash2, ZoomIn, ZoomOut, Crosshair, Play, Eye, EyeOff } from "lucide-react";

interface Hover { x: number; y: number; sx: number; sy: number }

export function GraphPanel() {
  const { plots, setPlots, addPlot, viewport, setViewport, vintage, setVintage } = useCalc();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 600, h: 360 });
  const [hover, setHover] = useState<Hover | null>(null);
  const [progress, setProgress] = useState(1); // 0..1 for vintage draw
  const animRef = useRef<number | null>(null);

  // Resize observer
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(200, r.width), h: Math.max(180, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Vintage redraw trigger
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (!vintage) { setProgress(1); return; }
    setProgress(0);
    const start = performance.now();
    const duration = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setProgress(p);
      if (p < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [vintage, plots, viewport, size.w, size.h]);

  const draw = useCallback(() => {
    const c = canvasRef.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size.w * dpr; c.height = size.h * dpr;
    c.style.width = size.w + "px"; c.style.height = size.h + "px";
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.scale(dpr, dpr);

    const { xMin, xMax, yMin, yMax } = viewport;
    const W = size.w, H = size.h;
    const xToPx = (x: number) => ((x - xMin) / (xMax - xMin)) * W;
    const yToPx = (y: number) => H - ((y - yMin) / (yMax - yMin)) * H;

    // background
    ctx.fillStyle = "oklch(0.155 0.025 250)";
    ctx.fillRect(0, 0, W, H);

    // grid
    ctx.lineWidth = 1;
    const xStep = niceStep((xMax - xMin) / 10);
    const yStep = niceStep((yMax - yMin) / 6);

    ctx.strokeStyle = "oklch(0.5 0.05 200 / 12%)";
    ctx.beginPath();
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const px = xToPx(x); ctx.moveTo(px, 0); ctx.lineTo(px, H);
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const py = yToPx(y); ctx.moveTo(0, py); ctx.lineTo(W, py);
    }
    ctx.stroke();

    // axes
    ctx.strokeStyle = "oklch(0.7 0.1 200 / 55%)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const ox = xToPx(0), oy = yToPx(0);
    if (ox >= 0 && ox <= W) { ctx.moveTo(ox, 0); ctx.lineTo(ox, H); }
    if (oy >= 0 && oy <= H) { ctx.moveTo(0, oy); ctx.lineTo(W, oy); }
    ctx.stroke();

    // axis labels
    ctx.fillStyle = "oklch(0.7 0.05 200 / 70%)";
    ctx.font = "10px JetBrains Mono, monospace";
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < 1e-9) continue;
      ctx.fillText(formatNum(x), xToPx(x) + 2, Math.min(H - 2, Math.max(10, oy - 2)));
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < 1e-9) continue;
      ctx.fillText(formatNum(y), Math.min(W - 30, Math.max(2, ox + 3)), yToPx(y) - 2);
    }

    // plots
    for (const p of plots) {
      if (!p.enabled) continue;
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.8;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      try {
        if (p.kind === "explicit") {
          const compiled = math.compile(p.expr);
          const samples = 600;
          const endI = Math.floor(samples * progress);
          let pen = false;
          for (let i = 0; i <= endI; i++) {
            const x = xMin + ((xMax - xMin) * i) / samples;
            let y: number;
            try { y = Number(compiled.evaluate({ x })); }
            catch { pen = false; continue; }
            if (!Number.isFinite(y)) { pen = false; continue; }
            const px = xToPx(x), py = yToPx(y);
            if (!pen) { ctx.moveTo(px, py); pen = true; }
            else ctx.lineTo(px, py);
          }
        } else if (p.kind === "parametric") {
          const cx = math.compile(p.expr);
          const cy = math.compile(p.expr2 || "0");
          const tMin = p.tMin ?? 0, tMax = p.tMax ?? Math.PI * 2;
          const samples = 600;
          const endI = Math.floor(samples * progress);
          let pen = false;
          for (let i = 0; i <= endI; i++) {
            const t = tMin + ((tMax - tMin) * i) / samples;
            const x = Number(cx.evaluate({ t })), y = Number(cy.evaluate({ t }));
            if (!Number.isFinite(x) || !Number.isFinite(y)) { pen = false; continue; }
            const px = xToPx(x), py = yToPx(y);
            if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
          }
        } else if (p.kind === "polar") {
          const cr = math.compile(p.expr);
          const tMin = p.tMin ?? 0, tMax = p.tMax ?? Math.PI * 2;
          const samples = 720;
          const endI = Math.floor(samples * progress);
          let pen = false;
          for (let i = 0; i <= endI; i++) {
            const theta = tMin + ((tMax - tMin) * i) / samples;
            const r = Number(cr.evaluate({ theta, t: theta }));
            if (!Number.isFinite(r)) { pen = false; continue; }
            const x = r * Math.cos(theta), y = r * Math.sin(theta);
            const px = xToPx(x), py = yToPx(y);
            if (!pen) { ctx.moveTo(px, py); pen = true; } else ctx.lineTo(px, py);
          }
        }
      } catch { /* invalid expr */ }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }, [plots, viewport, size, progress]);

  useEffect(() => { draw(); }, [draw]);

  // Pan & zoom
  const dragRef = useRef<{ x: number; y: number; vp: typeof viewport } | null>(null);
  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, vp: { ...viewport } };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const { xMin, xMax, yMin, yMax } = viewport;
    const x = xMin + (sx / size.w) * (xMax - xMin);
    const y = yMax - (sy / size.h) * (yMax - yMin);
    setHover({ x, y, sx, sy });
    if (dragRef.current) {
      const dx = (e.clientX - dragRef.current.x) / size.w * (dragRef.current.vp.xMax - dragRef.current.vp.xMin);
      const dy = (e.clientY - dragRef.current.y) / size.h * (dragRef.current.vp.yMax - dragRef.current.vp.yMin);
      setViewport({
        xMin: dragRef.current.vp.xMin - dx,
        xMax: dragRef.current.vp.xMax - dx,
        yMin: dragRef.current.vp.yMin + dy,
        yMax: dragRef.current.vp.yMax + dy,
      });
    }
  };
  const onMouseUp = () => { dragRef.current = null; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top;
    const { xMin, xMax, yMin, yMax } = viewport;
    const cx = xMin + (sx / size.w) * (xMax - xMin);
    const cy = yMax - (sy / size.h) * (yMax - yMin);
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
    setViewport({
      xMin: cx + (xMin - cx) * factor,
      xMax: cx + (xMax - cx) * factor,
      yMin: cy + (yMin - cy) * factor,
      yMax: cy + (yMax - cy) * factor,
    });
  };

  const updatePlot = (id: string, patch: Partial<PlotExpr>) => {
    setPlots((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const removePlot = (id: string) => setPlots((prev) => prev.filter((p) => p.id !== id));

  const exportPng = () => {
    const c = canvasRef.current; if (!c) return;
    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url; a.download = "graph.png"; a.click();
  };

  const zoom = (factor: number) => {
    const { xMin, xMax, yMin, yMax } = viewport;
    const cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2;
    setViewport({
      xMin: cx + (xMin - cx) * factor,
      xMax: cx + (xMax - cx) * factor,
      yMin: cy + (yMin - cy) * factor,
      yMax: cy + (yMax - cy) * factor,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
        <span className="text-[0.6rem] tracking-widest text-muted-foreground">VIEWPORT</span>
        <div className="ml-auto flex items-center gap-1">
          <button className="pill-btn" onClick={() => zoom(1 / 1.3)} title="Zoom in"><ZoomIn size={12} /></button>
          <button className="pill-btn" onClick={() => zoom(1.3)} title="Zoom out"><ZoomOut size={12} /></button>
          <button className="pill-btn" onClick={() => setViewport(defaultViewport)} title="Reset"><Crosshair size={12} /></button>
          <button className="pill-btn" data-active={vintage} onClick={() => setVintage(!vintage)} title="Vintage draw">
            <Play size={12} /> Vintage
          </button>
          <button className="pill-btn" onClick={exportPng}><Download size={12} />PNG</button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0">
        <div
          ref={wrapRef}
          className="relative flex-1 cursor-crosshair select-none"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { onMouseUp(); setHover(null); }}
          onWheel={onWheel}
        >
          <canvas ref={canvasRef} />
          {hover && (
            <div
              className="pointer-events-none absolute rounded-sm border border-border-strong bg-[oklch(0.18_0.03_250/95%)] px-2 py-1 text-[0.65rem] neon-text"
              style={{ left: Math.min(hover.sx + 12, size.w - 110), top: Math.min(hover.sy + 12, size.h - 36) }}
            >
              x={formatNum(hover.x)}<br />y={formatNum(hover.y)}
            </div>
          )}
          <div className="pointer-events-none absolute bottom-1 right-2 text-[0.6rem] text-muted-foreground tracking-widest">
            drag · pan  ·  wheel · zoom
          </div>
        </div>

        <div className="w-56 shrink-0 border-l border-border bg-[oklch(0.2_0.03_250)] flex flex-col">
          <div className="px-3 py-2 flex items-center justify-between border-b border-border">
            <span className="text-[0.6rem] tracking-[0.2em] text-muted-foreground">CURVES</span>
            <button className="pill-btn" onClick={addPlot}><Plus size={12} />ADD</button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {plots.map((p, i) => (
              <div key={p.id} className="rounded-md border border-border bg-[oklch(0.23_0.03_250)] p-2 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    className="h-3 w-3 rounded-sm shrink-0"
                    style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }}
                    onClick={() => updatePlot(p.id, { color: PLOT_COLORS[(PLOT_COLORS.indexOf(p.color) + 1) % PLOT_COLORS.length] })}
                  />
                  <select
                    className="field !py-0.5 !px-1 text-[0.65rem] w-20"
                    value={p.kind}
                    onChange={(e) => updatePlot(p.id, { kind: e.target.value as PlotExpr["kind"] })}
                  >
                    <option value="explicit">y=f(x)</option>
                    <option value="parametric">param</option>
                    <option value="polar">polar</option>
                  </select>
                  <button className="pill-btn !px-1.5" onClick={() => updatePlot(p.id, { enabled: !p.enabled })}>
                    {p.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button className="pill-btn !px-1.5" onClick={() => removePlot(p.id)}><Trash2 size={12} /></button>
                </div>
                {p.kind === "explicit" && (
                  <input className="field !py-1 text-[0.72rem]"
                    value={p.expr} placeholder="sin(x)"
                    onChange={(e) => updatePlot(p.id, { expr: e.target.value })} />
                )}
                {p.kind === "parametric" && (
                  <div className="space-y-1">
                    <input className="field !py-1 text-[0.72rem]" placeholder="x(t)= cos(t)"
                      value={p.expr} onChange={(e) => updatePlot(p.id, { expr: e.target.value })} />
                    <input className="field !py-1 text-[0.72rem]" placeholder="y(t)= sin(t)"
                      value={p.expr2 ?? ""} onChange={(e) => updatePlot(p.id, { expr2: e.target.value })} />
                  </div>
                )}
                {p.kind === "polar" && (
                  <input className="field !py-1 text-[0.72rem]" placeholder="r(θ)= 1+cos(theta)"
                    value={p.expr} onChange={(e) => updatePlot(p.id, { expr: e.target.value })} />
                )}
                <div className="text-[0.55rem] tracking-widest text-muted-foreground">f{i + 1}</div>
              </div>
            ))}
            {plots.length === 0 && <div className="text-[0.7rem] text-muted-foreground p-2">No curves. Press ADD.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function niceStep(raw: number) {
  if (raw <= 0 || !isFinite(raw)) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const step = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return step * pow;
}

function formatNum(n: number) {
  if (Math.abs(n) >= 1000 || (n !== 0 && Math.abs(n) < 0.01)) return n.toExponential(2);
  return Number(n.toFixed(3)).toString();
}
