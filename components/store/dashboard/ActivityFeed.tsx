"use client";
import { useT } from "@/lib/i18n";
import type { ActivityEvent } from "@/lib/store-api/types";

function relTime(iso: string, justNow: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return justNow;
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const { t } = useT();
  const justNow = t("store.dashboard.activity.just_now");

  return (
    <ul aria-live="polite" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {events.map((e, i) => (
        <li
          key={`${e.kind}-${e.created_at}-${i}`}
          style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 12, alignItems: "center", padding: "10px 0" }}
        >
          {renderAvatar(e)}
          <div style={{ fontSize: 13.5, lineHeight: 1.35 }}>{renderBody(e, t)}</div>
          <span className="mono" style={{ fontSize: 11, color: "var(--color-taupe)" }}>{relTime(e.created_at, justNow)}</span>
        </li>
      ))}
    </ul>
  );
}

function renderAvatar(e: ActivityEvent) {
  const base: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 999, display: "grid", placeItems: "center",
    fontFamily: "var(--font-serif)", fontSize: 14,
  };
  if (e.kind === "item_liked")     return <span aria-hidden style={{ ...base, background: "rgba(181,83,46,.15)", color: "var(--color-clay)" }}>♥</span>;
  if (e.kind === "visit_requested")return <span aria-hidden style={{ ...base, background: "rgba(216,160,91,.22)", color: "var(--color-clay)" }}>→</span>;
  if (e.kind === "stock_event")    return <span aria-hidden style={{ ...base, background: "rgba(63,74,57,.15)",  color: "var(--color-moss)" }}>＋</span>;
  if (e.kind === "magic_event")    return <span aria-hidden style={{ ...base, background: "var(--color-ink)",     color: "var(--color-amber)", fontSize: 13 }}>✦</span>;
  return null;
}

function renderBody(e: ActivityEvent, t: (k: string, p?: Record<string, string | number>) => string) {
  if (e.kind === "item_liked") {
    const who = e.actor_label ?? t("store.dashboard.activity.anonymous");
    const item = e.item_name ?? "—";
    return <span>{t("store.dashboard.activity.liked", { who, item })}</span>;
  }
  if (e.kind === "stock_event") {
    const sign = (e.delta ?? 0) >= 0 ? "+" : "";
    const n = Math.abs(e.delta ?? 0);
    const item = e.item_name ?? "";
    return <span>{t("store.dashboard.activity.restock_event", { sign, n, item })}</span>;
  }
  if (e.kind === "magic_event") {
    const item = e.item_name ?? "—";
    const magicKey =
      e.magic_kind === "missing_description" ? "store.dashboard.activity.magic.missing_description" :
      e.magic_kind === "pricing_low" ? "store.dashboard.activity.magic.pricing_low" :
      e.magic_kind === "missing_photo" ? "store.dashboard.activity.magic.missing_photo" :
      "store.dashboard.activity.magic.generic";
    return <span>{t(magicKey, { item })}</span>;
  }
  if (e.kind === "visit_requested") {
    const who = e.actor_label ?? t("store.dashboard.activity.anonymous");
    return <span>{t("store.dashboard.activity.visit_request", { who })}</span>;
  }
  return null;
}
