import { useEffect, useMemo, useRef, useState } from "react";
import { math } from "@/lib/calc/math";
import { Box, RefreshCw } from "lucide-react";

// Compact orthographic 3D surface plotter: z = f(x, y).
// Wireframe rendering — no WebGL dependency.

export function Plot3DPanel() {
  const [expr, setExpr] = useState("sin(sqrt(x^2 + y^2))");
  const [xRange, setXRange] = useState<[number, number]>([-5, 5]);
  const [yRange, setYRange] = useState<[number, number]>([-5, 5]);
  const [resolution, setResolution] = useState(48);
  const [rotX, setRotX] = useState(-1.0);
  const [rotZ, setRotZ] = useState(0.6);
  const [zoom, setZoom] = useState(0.8);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 480, h: 320 });
  const drag = useRef<{ x: number; y: number; rx: number; rz: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: Math.max(240, r.width), h: Math.max(180, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // sample grid
  const grid = useMemo(() => {
    try {
      const compiled = math.compile(expr);
      const N = resolution;
      const xs = new Float64Array(N + 1);
      const ys = new Float64Array(N + 1);
      const zs = new Float64Array((N + 1) * (N + 1));
      for (let i = 0; i <= N; i++) xs[i] = xRange[0] + ((xRange[1] - xRange[0]) * i) / N;
      for (let j = 0; j <= N; j++) ys[j] = yRange[0] + ((yRange[1] - yRange[0]) * j) / N;
      let zMin = Infinity, zMax = -Infinity;
      for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
        let z = NaN;
        try { z = Number(compiled.evaluate({ x: xs[i], y: ys[j] })); } catch { /* skip */ }
        zs[i * (N + 1) + j] = z;
        if (Number.isFinite(z)) { if (z < zMin) zMin = z; if (z > zMax) zMax = z; }
      }
      if (!Number.isFinite(zMin) || !Number.isFinite(zMax)) { zMin = -1; zMax = 1; }
      if (zMin === zMax) { zMin -= 1; zMax += 1; }
      return { N, xs, ys, zs, zMin, zMax, ok: true, err: "" };
    } catch (e) {
      return { N: 0, xs: new Float64Array(), ys: new Float64Array(), zs: new Float64Array(), zMin: 0, zMax: 1, ok: false, err: (e as Error).message };
    }
  }, [expr, resolution, xRange, yRange]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size.w * dpr; c.height = size.h * dpr;
    c.style.width = size.w + "px"; c.style.height = size.h + "px";
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = "oklch(0.14 0.025 250)";
    ctx.fillRect(0, 0, size.w, size.h);

    if (!grid.ok) {
      ctx.fillStyle = "oklch(0.66 0.24 22)";
      ctx.font = "12px JetBrains Mono, monospace";
      ctx.fillText("error: " + grid.err, 10, 20);
      return;
    }

    const { N, xs, ys, zs, zMin, zMax } = grid;
    const cx = size.w / 2, cy = size.h / 2;
    const scale = Math.min(size.w, size.h) * 0.32 * zoom;
    const xMid = (xRange[0] + xRange[1]) / 2;
    const yMid = (yRange[0] + yRange[1]) / 2;
    const zMid = (zMin + zMax) / 2;
    const xSpan = Math.max(1e-6, xRange[1] - xRange[0]);
    const ySpan = Math.max(1e-6, yRange[1] - yRange[0]);
    const zSpan = Math.max(1e-6, zMax - zMin);

    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    const project = (x: number, y: number, z: number) => {
      // normalize to [-1, 1] roughly per axis
      const nx = (x - xMid) / xSpan;
      const ny = (y - yMid) / ySpan;
      const nz = (z - zMid) / zSpan;
      // rotate around Z then X
      const x1 =  cosZ * nx - sinZ * ny;
      const y1 =  sinZ * nx + cosZ * ny;
      const z1 = nz;
      const y2 = cosX * y1 - sinX * z1;
      const z2 = sinX * y1 + cosX * z1;
      void z2;
      return { sx: cx + x1 * scale, sy: cy - y2 * scale };
    };

    // axis box (corners of unit cube)
    ctx.strokeStyle = "oklch(0.55 0.06 200 / 35%)";
    ctx.lineWidth = 1;
    const corners = [
      [-0.5, -0.5, -0.5], [ 0.5, -0.5, -0.5], [ 0.5,  0.5, -0.5], [-0.5,  0.5, -0.5],
      [-0.5, -0.5,  0.5], [ 0.5, -0.5,  0.5], [ 0.5,  0.5,  0.5], [-0.5,  0.5,  0.5],
    ].map((c) => project(c[0] * xSpan + xMid, c[1] * ySpan + yMid, c[2] * zSpan + zMid));
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    ctx.beginPath();
    for (const [a, b] of edges) { ctx.moveTo(corners[a].sx, corners[a].sy); ctx.lineTo(corners[b].sx, corners[b].sy); }
    ctx.stroke();

    // wireframe — neon gradient over z
    ctx.lineWidth = 1.1;
    for (let i = 0; i <= N; i++) {
      ctx.beginPath();
      let pen = false;
      for (let j = 0; j <= N; j++) {
        const z = zs[i * (N + 1) + j];
        if (!Number.isFinite(z)) { pen = false; continue; }
        const { sx, sy } = project(xs[i], ys[j], z);
        if (!pen) { ctx.moveTo(sx, sy); pen = true; } else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = colorForRow(i, N);
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 3;
      ctx.stroke();
    }
    for (let j = 0; j <= N; j++) {
      ctx.beginPath();
      let pen = false;
      for (let i = 0; i <= N; i++) {
        const z = zs[i * (N + 1) + j];
        if (!Number.isFinite(z)) { pen = false; continue; }
        const { sx, sy } = project(xs[i], ys[j], z);
        if (!pen) { ctx.moveTo(sx, sy); pen = true; } else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = colorForCol(j, N);
      ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 3;
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }, [grid, size, rotX, rotZ, zoom, xRange, yRange]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, rx: rotX, rz: rotZ };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setRotZ(drag.current.rz + (e.clientX - drag.current.x) / 160);
    setRotX(drag.current.rx + (e.clientY - drag.current.y) / 160);
  };
  const onPointerUp = () => { drag.current = null; };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border flex-wrap">
        <Box size={12} className="text-[var(--color-primary)]" />
        <span className="text-[0.6rem] tracking-widest text-muted-foreground">z = f(x, y)</span>
        <input
          className="field !py-1 !text-[0.72rem] flex-1 min-w-[10rem]"
          value={expr} onChange={(e) => setExpr(e.target.value)} spellCheck={false}
        />
        <button className="pill-btn !text-[0.6rem]" onClick={() => { setRotX(-1); setRotZ(0.6); setZoom(0.8); }}>
          <RefreshCw size={10} /> reset
        </button>
      </div>
      <div className="flex items-center gap-2 px-2 py-1 border-b border-border text-[0.6rem] tracking-widest text-muted-foreground flex-wrap">
        <label>x: <input type="number" className="field !py-0 !w-14 !text-[0.7rem]" value={xRange[0]} onChange={(e) => setXRange([Number(e.target.value), xRange[1]])} /> → <input type="number" className="field !py-0 !w-14 !text-[0.7rem]" value={xRange[1]} onChange={(e) => setXRange([xRange[0], Number(e.target.value)])} /></label>
        <label>y: <input type="number" className="field !py-0 !w-14 !text-[0.7rem]" value={yRange[0]} onChange={(e) => setYRange([Number(e.target.value), yRange[1]])} /> → <input type="number" className="field !py-0 !w-14 !text-[0.7rem]" value={yRange[1]} onChange={(e) => setYRange([yRange[0], Number(e.target.value)])} /></label>
        <label>res
          <input type="range" min={16} max={96} step={2} value={resolution} onChange={(e) => setResolution(Number(e.target.value))} className="ml-1 align-middle" />
        </label>
        <label>zoom
          <input type="range" min={0.3} max={2} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="ml-1 align-middle" />
        </label>
      </div>
      <div
        ref={wrapRef}
        className="flex-1 relative cursor-grab active:cursor-grabbing select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <canvas ref={canvasRef} />
        <div className="pointer-events-none absolute bottom-1 right-2 text-[0.55rem] tracking-widest text-muted-foreground">drag to rotate</div>
      </div>
    </div>
  );
}

function colorForRow(i: number, N: number) {
  const t = i / N;
  return `oklch(0.82 0.16 ${195 + t * 65})`;
}
function colorForCol(j: number, N: number) {
  const t = j / N;
  return `oklch(0.78 0.18 ${78 + t * 80} / 75%)`;
}
