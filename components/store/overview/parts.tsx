import type { CSSProperties, ReactNode } from "react";
import { Photo } from "../console/atoms";

// — Card —
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: "#FBF8F2", border: "1px solid #E8DFD0", boxShadow: "0 1px 0 rgba(26,22,18,.02)", ...style }}>
      {children}
    </div>
  );
}

// — KPI card —
export type KpiProps = {
  label: string; value: string; delta: string; sub: string;
  up?: boolean; tone?: "clay" | "muted"; spark?: boolean;
};
export function Kpi({ label, value, delta, sub, up, tone, spark }: KpiProps) {
  const deltaColor = tone === "muted" ? "#9A8A72" : up ? "#3F4A39" : "#B5532E";
  const isClay = tone === "clay";
  return (
    <div style={{
      padding: "14px 16px 16px",
      background: isClay ? "#1A1612" : "#FBF8F2",
      color: isClay ? "#FBF8F2" : "#1A1612",
      border: "1px solid", borderColor: isClay ? "#1A1612" : "#E8DFD0",
      position: "relative", overflow: "hidden",
    }}>
      <div className="label" style={{ color: isClay ? "rgba(251,248,242,.6)" : "#9A8A72", fontSize: 10 }}>{label}</div>
      <div className="serif num" style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: "-0.01em", marginTop: 6 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.06em", color: isClay ? "#D8A05B" : deltaColor }}>
          {up && "▲ "}{delta}
        </span>
        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.06em", color: isClay ? "rgba(251,248,242,.5)" : "#9A8A72" }}>
          {sub}
        </span>
      </div>
      {spark && (
        <svg viewBox="0 0 120 30" preserveAspectRatio="none" style={{ position: "absolute", right: 12, top: 16, width: 78, height: 24, opacity: 0.9 }}>
          <polyline points="0,22 12,18 24,20 36,14 48,16 60,10 72,12 84,7 96,9 108,4 120,2" fill="none" stroke="#D8A05B" strokeWidth="1.4" />
        </svg>
      )}
    </div>
  );
}

// — Revenue chart —
export function RevenueChart({ weeks }: { weeks: number[] }) {
  const max = 8;
  const w = 720, h = 150, pad = 12;
  const bw = (w - pad * 2) / weeks.length;
  return (
    <div style={{ marginTop: 16, position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h + 26}`} style={{ width: "100%", height: 176, display: "block" }}>
        {[0, 1, 2, 3].map((i) => {
          const y = pad + ((h - pad * 2) / 3) * i;
          return <line key={i} x1="0" x2={w} y1={y} y2={y} stroke="#E8DFD0" strokeWidth="0.6" strokeDasharray="2 3" />;
        })}
        {weeks.map((v, i) => {
          const bh = (v / max) * (h - pad * 2);
          const x = pad + i * bw + 3;
          const y = h - pad - bh;
          const isLast = i === weeks.length - 1;
          return (
            <g key={i}>
              <rect x={x} y={y} width={bw - 6} height={bh} fill={isLast ? "#B5532E" : "#1A1612"} opacity={isLast ? 1 : 0.85} />
              <text x={x + (bw - 6) / 2} y={h + 14} textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill={isLast ? "#B5532E" : "#9A8A72"} letterSpacing="0.06em">
                W{i + 18}
              </text>
            </g>
          );
        })}
        <polyline
          points={weeks.map((v, i) => {
            const x = pad + i * bw + bw / 2;
            const y = h - pad - (v / max) * (h - pad * 2);
            return `${x},${y}`;
          }).join(" ")}
          fill="none" stroke="#D8A05B" strokeWidth="1.2" strokeDasharray="3 3"
        />
      </svg>
      <div style={{ position: "absolute", top: 6, right: 6, padding: "6px 10px", background: "#F4EFE6", border: "1px solid #E8DFD0", display: "flex", gap: 14 }}>
        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#1A1612" }}>
          <span style={{ display: "inline-block", width: 8, height: 8, background: "#1A1612", marginRight: 6 }} />
          Weekly
        </span>
        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72" }}>
          <span style={{ display: "inline-block", width: 12, height: 0, borderTop: "1.2px dashed #D8A05B", marginRight: 6, verticalAlign: "middle" }} />
          Trend
        </span>
      </div>
    </div>
  );
}

// — Top item card —
export type TopItemProps = { img: string; name: string; sku: string; v: string; o: string; rev: string; badge?: string };
export function TopItem({ img, name, sku, v, o, rev, badge }: TopItemProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ position: "relative", aspectRatio: "4 / 3" }}>
        <Photo src={img} style={{ position: "absolute", inset: 0 }} />
        {badge && (
          <div className="mono" style={{
            position: "absolute", top: 8, left: 8, padding: "4px 8px",
            background: badge === "trending" ? "#B5532E" : "#1A1612",
            color: "#FBF8F2", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
          }}>{badge}</div>
        )}
      </div>
      <div style={{ paddingTop: 10 }}>
        <div style={{ fontSize: 13, lineHeight: 1.2, letterSpacing: "-0.005em" }}>{name}</div>
        <div className="label" style={{ marginTop: 3, fontSize: 9 }}>{sku}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <Stat l="Views" v={v} />
          <Stat l="Orders" v={o} />
          <Stat l="Rev" v={rev} />
        </div>
      </div>
    </div>
  );
}
function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>{l}</div>
      <div className="num" style={{ fontSize: 13, marginTop: 2 }}>{v}</div>
    </div>
  );
}

// — Todo row —
export type TodoRowProps = { tone: "clay" | "amber" | "muted"; num: string; label: string; hint: string; last?: boolean };
export function TodoRow({ tone, num, label, hint, last }: TodoRowProps) {
  const c = { clay: "#B5532E", amber: "#D8A05B", muted: "#9A8A72" }[tone] || "#1A1612";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: last ? "none" : "1px solid #E8DFD0" }}>
      <div style={{
        width: 34, height: 34, border: `1px solid ${c}`, color: c,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "Instrument Serif, serif", fontSize: 16,
      }}>{num}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.2 }}>{label}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", marginTop: 3, textTransform: "uppercase" }}>{hint}</div>
      </div>
      <span style={{ fontFamily: "serif", fontSize: 16, color: "#9A8A72" }}>→</span>
    </div>
  );
}

// — Inquiry row —
export type InquiryProps = { initials: string; name: string; city: string; item: string; snippet: string; time: string; unread?: boolean };
export function Inquiry({ initials, name, city, item, snippet, time, unread }: InquiryProps) {
  return (
    <div style={{
      display: "flex", gap: 12, padding: 12, background: unread ? "#F4EFE6" : "transparent",
      border: "1px solid", borderColor: unread ? "#E8DFD0" : "transparent", position: "relative",
    }}>
      <div style={{
        width: 34, height: 34, background: unread ? "#1A1612" : "#FBF8F2",
        color: unread ? "#FBF8F2" : "#1A1612",
        border: "1px solid", borderColor: unread ? "#1A1612" : "#E8DFD0",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontFamily: "JetBrains Mono", letterSpacing: "0.04em", flexShrink: 0,
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontSize: 13 }}>
            {name}
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", marginLeft: 6 }}>· {city.toUpperCase()}</span>
          </span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>{time}</span>
        </div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#B5532E", textTransform: "uppercase", marginTop: 3 }}>
          Re: {item}
        </div>
        <div style={{
          fontSize: 12, color: "#5B5043", marginTop: 5, lineHeight: 1.4, overflow: "hidden",
          textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {snippet}
        </div>
      </div>
      {unread && <span style={{ position: "absolute", top: 10, right: 10, width: 6, height: 6, borderRadius: 999, background: "#B5532E" }} />}
    </div>
  );
}
