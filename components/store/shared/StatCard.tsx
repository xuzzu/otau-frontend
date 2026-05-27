"use client";

import type { ReactNode } from "react";

export type StatDelta = { text: string; tone: "ok" | "warm" };

export function StatCard({
  label, value, valueSmall, delta, sub, spark, accent,
}: {
  label: string;
  value: ReactNode;
  valueSmall?: string;
  delta?: StatDelta;
  sub?: ReactNode;
  spark?: number[];
  accent?: "magic";
}) {
  const magic = accent === "magic";
  return (
    <div
      data-accent={accent ?? undefined}
      style={{
        background: magic ? "var(--color-ink)" : "var(--color-paper)",
        border: `1px solid ${magic ? "var(--color-ink)" : "var(--color-hair)"}`,
        color: magic ? "var(--color-paper)" : "var(--color-ink)",
        padding: "22px 22px 18px",
        display: "flex", flexDirection: "column", gap: 10,
        minHeight: 138,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
          color: magic ? "var(--color-amber)" : "var(--color-taupe)",
        }}
      >
        {label}
      </div>
      <div
        className="serif num"
        style={{
          fontSize: 52, lineHeight: 1, letterSpacing: "-0.02em",
          color: magic ? "var(--color-paper)" : "var(--color-ink)",
        }}
      >
        {value}
        {valueSmall && (
          <small style={{ fontSize: 22, color: magic ? "rgba(251,248,242,0.6)" : "var(--color-taupe-2)", marginLeft: 2 }}>
            {" "}{valueSmall}
          </small>
        )}
      </div>
      {delta && (
        <div style={{
          display: "flex", alignItems: "center", gap: 10, fontSize: 13,
          color: delta.tone === "warm" ? "var(--color-clay)" : "var(--color-moss)",
        }}>
          <span>{delta.text}</span>
          {spark && (
            <Sparkline points={spark} stroke={delta.tone === "warm" ? "#b5532e" : "#3f4a39"} />
          )}
        </div>
      )}
      {sub && (
        <div style={{
          fontSize: 13, lineHeight: 1.4,
          color: magic ? "rgba(251,248,242,0.7)" : "var(--color-taupe-2)",
          fontStyle: magic ? "italic" : "normal",
          fontFamily: magic ? "var(--font-serif)" : "inherit",
        }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  if (points.length === 0) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const w = 72, h = 18;
  const dx = w / Math.max(1, points.length - 1);
  const norm = (v: number) => h - ((v - min) / Math.max(1, max - min)) * (h - 2) - 1;
  const d = points.map((v, i) => `${i === 0 ? "M" : "L"}${(i * dx).toFixed(1)},${norm(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeWidth={1.2} />
    </svg>
  );
}
