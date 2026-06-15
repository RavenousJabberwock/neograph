import { useState, useMemo } from "react";
import { useCalc } from "@/lib/calc/store";
import { Copy } from "lucide-react";

interface Constant { sym: string; name: string; value: number; unit: string; category: string }

const CONSTANTS: Constant[] = [
  // Math
  { sym: "π",   name: "Pi",                       value: Math.PI,                  unit: "",        category: "math" },
  { sym: "e",   name: "Euler's number",           value: Math.E,                   unit: "",        category: "math" },
  { sym: "φ",   name: "Golden ratio",             value: (1 + Math.sqrt(5)) / 2,   unit: "",        category: "math" },
  { sym: "γ",   name: "Euler-Mascheroni",         value: 0.5772156649015329,       unit: "",        category: "math" },
  { sym: "√2",  name: "Square root of 2",         value: Math.SQRT2,               unit: "",        category: "math" },

  // Physics – fundamental
  { sym: "c",   name: "Speed of light",           value: 299792458,                unit: "m/s",     category: "physics" },
  { sym: "h",   name: "Planck constant",          value: 6.62607015e-34,           unit: "J·s",     category: "physics" },
  { sym: "ℏ",   name: "Reduced Planck",           value: 1.054571817e-34,          unit: "J·s",     category: "physics" },
  { sym: "G",   name: "Gravitational",            value: 6.67430e-11,              unit: "N·m²/kg²", category: "physics" },
  { sym: "g₀",  name: "Standard gravity",         value: 9.80665,                  unit: "m/s²",    category: "physics" },
  { sym: "k_B", name: "Boltzmann",                value: 1.380649e-23,             unit: "J/K",     category: "physics" },
  { sym: "ε₀",  name: "Vacuum permittivity",      value: 8.8541878128e-12,         unit: "F/m",     category: "physics" },
  { sym: "μ₀",  name: "Vacuum permeability",      value: 1.25663706212e-6,         unit: "H/m",     category: "physics" },
  { sym: "e_c", name: "Elementary charge",        value: 1.602176634e-19,          unit: "C",       category: "physics" },
  { sym: "σ",   name: "Stefan–Boltzmann",         value: 5.670374419e-8,           unit: "W/m²·K⁴", category: "physics" },
  { sym: "R",   name: "Gas constant",             value: 8.314462618,              unit: "J/mol·K", category: "physics" },
  { sym: "N_A", name: "Avogadro",                 value: 6.02214076e23,            unit: "1/mol",   category: "physics" },
  { sym: "F",   name: "Faraday",                  value: 96485.33212,              unit: "C/mol",   category: "physics" },
  { sym: "α",   name: "Fine-structure",           value: 7.2973525693e-3,          unit: "",        category: "physics" },

  // Particle masses
  { sym: "m_e", name: "Electron mass",            value: 9.1093837015e-31,         unit: "kg",      category: "particle" },
  { sym: "m_p", name: "Proton mass",              value: 1.67262192369e-27,        unit: "kg",      category: "particle" },
  { sym: "m_n", name: "Neutron mass",             value: 1.67492749804e-27,        unit: "kg",      category: "particle" },

  // Astronomy
  { sym: "M_☉", name: "Solar mass",               value: 1.98892e30,               unit: "kg",      category: "astro" },
  { sym: "M_⊕", name: "Earth mass",               value: 5.9722e24,                unit: "kg",      category: "astro" },
  { sym: "R_⊕", name: "Earth radius",             value: 6.371e6,                  unit: "m",       category: "astro" },
  { sym: "AU",  name: "Astronomical unit",        value: 1.495978707e11,           unit: "m",       category: "astro" },
  { sym: "ly",  name: "Light year",               value: 9.4607304725808e15,       unit: "m",       category: "astro" },
  { sym: "pc",  name: "Parsec",                   value: 3.0856775814913673e16,    unit: "m",       category: "astro" },
];

export function ConstantsPanel() {
  const { insertAtCursor, showPanel } = useCalc();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const list = useMemo(() => CONSTANTS.filter((c) =>
    (cat === "all" || c.category === cat) &&
    (q === "" || (c.sym + c.name).toLowerCase().includes(q.toLowerCase())),
  ), [q, cat]);

  const cats = ["all", ...Array.from(new Set(CONSTANTS.map((c) => c.category)))];

  const insert = (c: Constant) => {
    insertAtCursor(c.value.toString());
    showPanel("calc");
  };

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <input
        className="field !py-1 text-[0.78rem]"
        placeholder="search constants…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="flex flex-wrap gap-1">
        {cats.map((c) => (
          <button key={c} className="pill-btn" data-active={cat === c} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-[oklch(0.16_0.03_250)]">
        <table className="w-full text-[0.72rem] font-mono">
          <thead className="sticky top-0 bg-[oklch(0.22_0.03_250)] text-muted-foreground">
            <tr>
              <th className="text-left px-2 py-1">SYM</th>
              <th className="text-left px-2 py-1">NAME</th>
              <th className="text-right px-2 py-1">VALUE</th>
              <th className="text-left px-2 py-1">UNIT</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={c.sym + i} className={i % 2 ? "bg-[oklch(0.2_0.03_250)]" : ""}>
                <td className="px-2 py-1 neon-text-amber">{c.sym}</td>
                <td className="px-2 py-1">{c.name}</td>
                <td className="px-2 py-1 text-right neon-text tabular-nums">{c.value.toExponential(6)}</td>
                <td className="px-2 py-1 text-muted-foreground">{c.unit || "—"}</td>
                <td className="px-1 py-0.5"><button className="pill-btn !px-1.5 !py-0.5" onClick={() => insert(c)}><Copy size={10} /></button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="text-center p-4 text-muted-foreground">No matches</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
