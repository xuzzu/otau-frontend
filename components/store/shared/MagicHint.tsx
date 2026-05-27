"use client";

export function MagicHintChip({ shortLabel, dark = true }: { shortLabel: string; dark?: boolean }) {
  return (
    <span
      className="mono"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 10px",
        background: dark ? "var(--color-ink)" : "rgba(216,160,91,.12)",
        color: dark ? "var(--color-amber)" : "var(--color-ink)",
        fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
      }}
    >
      <span aria-hidden="true">✦</span>
      <span>{shortLabel}</span>
    </span>
  );
}

export function MagicHintBody({ body }: { body: string }) {
  return (
    <div
      style={{
        marginTop: 10, padding: "8px 10px", borderRadius: 4,
        background: "rgba(26,22,18,0.04)",
        display: "flex", gap: 8, alignItems: "center",
      }}
    >
      <span style={{ color: "var(--color-amber)" }} aria-hidden="true">✦</span>
      <span
        className="serif"
        style={{ fontStyle: "italic", fontSize: 14, color: "var(--color-taupe-2)", lineHeight: 1.4 }}
      >
        {body}
      </span>
    </div>
  );
}

export function MagicSentence({ body }: { body: string }) {
  return (
    <div
      className="serif"
      style={{ fontStyle: "italic", fontSize: 17, color: "var(--color-ink)", lineHeight: 1.3 }}
    >
      &ldquo;{body}&rdquo;
    </div>
  );
}
