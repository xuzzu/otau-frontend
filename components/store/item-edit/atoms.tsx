import type { ReactNode } from "react";

export function Section({ n, title, hint, children }: { n: string; title: ReactNode; hint?: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 18 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.16em", color: "#9A8A72", textTransform: "uppercase" }}>{n}</span>
        <h2 className="serif" style={{ fontSize: 24, margin: 0, fontWeight: 400, letterSpacing: "-0.01em" }}>{title}</h2>
        {hint && <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>{hint}</span>}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#1A1612", textTransform: "uppercase" }}>{label}</span>
        {sub && <span className="mono" style={{ fontSize: 9, letterSpacing: "0.08em", color: "#9A8A72", textTransform: "uppercase" }}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}

export function Input({ value, prefix, suffix, hint, placeholder }: { value: string; prefix?: string; suffix?: string; hint?: string; placeholder?: boolean }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
        {prefix && <span style={{ fontSize: 13, color: "#9A8A72" }}>{prefix}</span>}
        <span style={{ flex: 1, fontSize: 13, color: placeholder ? "#9A8A72" : "#1A1612", letterSpacing: "-0.005em" }}>{value}</span>
        {suffix && <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>{suffix}</span>}
      </div>
      {hint && <span className="mono" style={{ position: "absolute", right: 0, top: -22, fontSize: 9, letterSpacing: "0.08em", color: "#9A8A72", textTransform: "uppercase" }}>{hint}</span>}
    </div>
  );
}

export function Textarea({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: "14px 16px", background: "#FBF8F2", border: "1px solid #E8DFD0", fontSize: 13, color: "#1A1612", lineHeight: 1.6, minHeight: 84 }}>
      {children}
    </div>
  );
}

export function Select({ value }: { value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "11px 14px", background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
      <span style={{ flex: 1, fontSize: 13 }}>{value}</span>
      <span style={{ color: "#9A8A72", fontSize: 11 }}>▾</span>
    </div>
  );
}

export function Toggle({ on, label }: { on?: boolean; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
      <span style={{ width: 34, height: 18, borderRadius: 999, background: on ? "#3F4A39" : "#E8DFD0", position: "relative", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 14, height: 14, borderRadius: 999, background: "#FBF8F2" }} />
      </span>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}

export function Tick({ children, on, warn }: { children: ReactNode; on?: boolean; warn?: boolean }) {
  const c = warn ? "#D8A05B" : on ? "#3F4A39" : "#9A8A72";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#1A1612" }}>
      <span style={{ width: 14, height: 14, border: `1px solid ${c}`, color: c, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
        {warn ? "!" : "✓"}
      </span>
      {children}
    </div>
  );
}

export function Pill({ on, children }: { on?: boolean; children: ReactNode }) {
  return (
    <div style={{
      padding: "8px 6px", textAlign: "center", fontSize: 11,
      background: on ? "#1A1612" : "#F4EFE6",
      color: on ? "#FBF8F2" : "#1A1612",
      border: "1px solid", borderColor: on ? "#1A1612" : "#E8DFD0",
      letterSpacing: "0.02em", cursor: "pointer",
    }}>{children}</div>
  );
}

export function MiniStat({ l, v }: { l: string; v: string }) {
  return (
    <div style={{ padding: "10px 12px", background: "#F4EFE6", border: "1px solid #E8DFD0" }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>{l}</div>
      <div className="serif num" style={{ fontSize: 20, marginTop: 4, lineHeight: 1 }}>{v}</div>
    </div>
  );
}
