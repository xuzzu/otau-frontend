"use client";
import type { ActivityEvent } from "@/lib/store-api/types";

function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  return (
    <ul aria-live="polite" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {events.map((e, i) => (
        <li
          key={`${e.kind}-${e.created_at}-${i}`}
          style={{ display: "grid", gridTemplateColumns: "32px 1fr auto", gap: 12, alignItems: "center", padding: "10px 0" }}
        >
          {renderAvatar(e)}
          <div style={{ fontSize: 13.5, lineHeight: 1.35 }}>{renderBody(e)}</div>
          <span className="mono" style={{ fontSize: 11, color: "var(--color-taupe)" }}>{relTime(e.created_at)}</span>
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

function renderBody(e: ActivityEvent) {
  if (e.kind === "item_liked") {
    const actor = e.actor_label ?? "Anonymous";
    const name = e.item_name ?? "—";
    return <span>{actor} liked {name}</span>;
  }
  if (e.kind === "stock_event") {
    const sign = (e.delta ?? 0) >= 0 ? "+" : "";
    return <>Restock event · <strong>{sign}{e.delta ?? 0} {e.item_name ?? ""}</strong></>;
  }
  if (e.kind === "magic_event") {
    const phrase =
      e.magic_kind === "missing_description" ? "drafted description for" :
      e.magic_kind === "pricing_low" ? "spotted pricing opportunity for" :
      e.magic_kind === "missing_photo" ? "asked for a photo for" :
      "noted something about";
    return <span>Magic {phrase} {e.item_name ?? "—"}</span>;
  }
  if (e.kind === "visit_requested") {
    return <span>{e.actor_label ?? "Visitor"} requested a visit</span>;
  }
  return null;
}
