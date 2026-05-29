"use client";
import type { ReactNode } from "react";

const box: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "11px 14px",
  background: "#FBF8F2", border: "1px solid #E8DFD0",
};
const labelRow: React.CSSProperties = { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 };
const labelTxt: React.CSSProperties = { fontSize: 10, letterSpacing: "0.12em", color: "#1A1612", textTransform: "uppercase" };
const subTxt: React.CSSProperties = { fontSize: 9, letterSpacing: "0.08em", color: "#9A8A72", textTransform: "uppercase" };

function Labelled({ label, sub, htmlFor, children }: { label: string; sub?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={labelRow}>
        <label htmlFor={htmlFor} className="mono" style={labelTxt}>{label}</label>
        {sub && <span className="mono" style={subTxt}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}

export function TextField({ label, value, onChange, prefix, suffix, sub, placeholder, id }: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; sub?: string; placeholder?: string; id?: string;
}) {
  const inputId = id ?? `f-${label}`;
  return (
    <Labelled label={label} sub={sub} htmlFor={inputId}>
      <div style={box}>
        {prefix && <span style={{ fontSize: 13, color: "#9A8A72" }}>{prefix}</span>}
        <input id={inputId} aria-label={label} value={value} placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, fontSize: 13, color: "#1A1612", background: "transparent", border: "none", outline: "none" }} />
        {suffix && <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>{suffix}</span>}
      </div>
    </Labelled>
  );
}

export function NumberField({ label, value, onChange, suffix, sub, id }: {
  label: string; value: number | null; onChange: (v: number | null) => void; suffix?: string; sub?: string; id?: string;
}) {
  const inputId = id ?? `f-${label}`;
  return (
    <Labelled label={label} sub={sub} htmlFor={inputId}>
      <div style={box}>
        <input id={inputId} aria-label={label} inputMode="decimal" value={value ?? ""}
          onChange={(e) => { const t = e.target.value.trim(); onChange(t === "" ? null : Number(t)); }}
          style={{ flex: 1, fontSize: 13, color: "#1A1612", background: "transparent", border: "none", outline: "none" }} />
        {suffix && <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>{suffix}</span>}
      </div>
    </Labelled>
  );
}

export function SelectField({ label, value, onChange, options, sub, id, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; sub?: string; id?: string; placeholder?: string;
}) {
  const inputId = id ?? `f-${label}`;
  return (
    <Labelled label={label} sub={sub} htmlFor={inputId}>
      <div style={box}>
        <select id={inputId} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, fontSize: 13, color: "#1A1612", background: "transparent", border: "none", outline: "none" }}>
          <option value="">{placeholder ?? "—"}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </Labelled>
  );
}

export function ChipGroup({ label, options, selected, onToggle, sub }: {
  label: string; options: { value: string; label: string }[];
  selected: string[]; onToggle: (v: string) => void; sub?: string;
}) {
  return (
    <Labelled label={label} sub={sub}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onToggle(o.value)}
            className={selected.includes(o.value) ? "chip solid" : "chip"} style={{ fontSize: 11, cursor: "pointer" }}>
            {o.label}
          </button>
        ))}
      </div>
    </Labelled>
  );
}

export function DeferredField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16, opacity: 0.5, pointerEvents: "none" }} aria-disabled>
      <div style={labelRow}>
        <span className="mono" style={labelTxt}>{label}</span>
        <span className="mono" style={{ ...subTxt, color: "#B8A98F" }}>Soon</span>
      </div>
      {children}
    </div>
  );
}
