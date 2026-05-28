import type { ReactNode } from "react";

export function SellerTopBar({
  crumbs,
  title,
  subtitle,
  right,
}: {
  crumbs: string[];
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header
      style={{
        flex: "0 0 auto",
        padding: "16px 36px",
        borderBottom: "1px solid var(--color-hair)",
        background: "var(--color-paper)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 24,
      }}
    >
      <div>
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-taupe)",
          }}
        >
          {crumbs.join("  ›  ")}
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 28,
            lineHeight: 1.05,
            margin: "6px 0 0",
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "var(--color-taupe)",
              marginTop: 6,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>{right}</div>
    </header>
  );
}
