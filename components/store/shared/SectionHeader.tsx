"use client";

import type { ReactNode } from "react";

export function SectionHeader({
  kicker, title, rightMeta, rightAction,
}: {
  kicker: string;
  title: ReactNode;
  rightMeta?: ReactNode;
  rightAction?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        borderBottom: "1px solid var(--color-hair)",
        paddingBottom: 14, marginBottom: 22,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          className="mono"
          style={{
            fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--color-clay)",
          }}
        >
          {kicker}
        </div>
        <h2 className="serif" style={{ fontSize: 32, lineHeight: 1, margin: 0, letterSpacing: "-0.01em" }}>
          {title}
        </h2>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
        {rightMeta && (
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-taupe)" }}>
            {rightMeta}
          </span>
        )}
        {rightAction}
      </div>
    </div>
  );
}
