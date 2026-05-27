"use client";
import Link from "next/link";
import { MagicSentence } from "@/components/store/shared/MagicHint";
import type { DashboardData, MagicHint } from "@/lib/store-api/types";
import type { ReactNode } from "react";

type Row = {
  icon: "urgent" | "soft" | "ok" | "magic";
  glyph: string;
  body: ReactNode;
  actionLabel: string;
  actionHref?: string;
  onAction?: () => void;
};

export function AttentionList({
  dashboard, lowStockItems, magicHint, promoEndingSoon,
}: {
  dashboard: DashboardData;
  lowStockItems: string[];
  magicHint?: MagicHint | null;
  promoEndingSoon?: { note: string; hoursLeft: number; redemptions: number; href: string } | null;
}) {
  const rows: Row[] = [];

  if (lowStockItems.length > 0) {
    rows.push({
      icon: "urgent", glyph: "!",
      body: (
        <span>
          <strong>Low stock:</strong> {lowStockItems.slice(0, 3).join(", ")}
        </span>
      ),
      actionLabel: "Restock",
      actionHref: "/store/catalog?bucket=attention",
    });
  }

  if (dashboard.visits.next) {
    const v = dashboard.visits.next;
    rows.push({
      icon: "soft", glyph: "★",
      body: (
        <span>
          <strong>{v.recipient_name}</strong> · {fmtVisit(v.date)}
          {v.items.length ? <> · {v.items.join(", ")}</> : null}
          {v.ordinal ? <> · <em style={{ color: "var(--color-taupe-2)" }}>{ordinalLabel(v.ordinal)} visit</em></> : null}
        </span>
      ),
      actionLabel: "Prep",
      actionHref: "/store/visits",
    });
  }

  if (promoEndingSoon) {
    rows.push({
      icon: "ok", glyph: "%",
      body: (
        <span>
          <strong>«{promoEndingSoon.note}»</strong> promo ends in {promoEndingSoon.hoursLeft}h ·
          {" "}{promoEndingSoon.redemptions} redemptions · <em style={{ color: "var(--color-taupe-2)" }}>extend?</em>
        </span>
      ),
      actionLabel: "Review",
      actionHref: promoEndingSoon.href,
    });
  }

  if (magicHint) {
    rows.push({
      icon: "magic", glyph: "✦",
      body: <MagicSentence body={magicHint.body} />,
      actionLabel: magicHint.action_label,
      actionHref: `/store/catalog/${magicHint.item_id}/edit?assist=${magicHint.kind}`,
    });
  }

  const capped = rows.slice(0, 4);

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {capped.map((r, i) => (
        <li
          key={i}
          style={{
            display: "grid", gridTemplateColumns: "26px 1fr auto",
            alignItems: "center", gap: 14,
            padding: "14px 0",
            borderBottom: i < capped.length - 1 ? "1px dashed var(--color-hair)" : "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 22, height: 22, borderRadius: 5,
              display: "grid", placeItems: "center",
              fontFamily: "var(--font-mono)", fontSize: 11,
              color: r.icon === "soft" ? "var(--color-ink)" : "var(--color-paper)",
              background:
                r.icon === "urgent" ? "var(--color-clay)" :
                r.icon === "soft" ? "var(--color-amber)" :
                r.icon === "ok" ? "var(--color-moss)" :
                "var(--color-ink)",
              ...(r.icon === "magic" ? { color: "var(--color-amber)" } : {}),
            }}
          >{r.glyph}</span>
          <div style={{ fontSize: 14, lineHeight: 1.45 }}>{r.body}</div>
          {r.actionHref ? (
            <Link href={r.actionHref} className="mono" style={actionStyle}>{r.actionLabel}</Link>
          ) : (
            <button type="button" onClick={r.onAction} className="mono" style={actionStyle}>{r.actionLabel}</button>
          )}
        </li>
      ))}
    </ul>
  );
}

const actionStyle: React.CSSProperties = {
  fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
  color: "var(--color-ink)", borderBottom: "1px solid var(--color-ink)",
  paddingBottom: 2, textDecoration: "none", background: "transparent", border: 0, cursor: "pointer",
};

function fmtVisit(iso: string): string {
  const d = new Date(iso);
  const days = ["sun","mon","tue","wed","thu","fri","sat"];
  return `${days[d.getDay()]} ${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
}

function ordinalLabel(n: number): string {
  return ["first","second","third","fourth","fifth"][n - 1] ?? `${n}th`;
}
