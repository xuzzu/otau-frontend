"use client";
import { AttentionList } from "./AttentionList";
import { ActivityFeed } from "./ActivityFeed";
import type { ActivityEvent, DashboardData, MagicHint } from "@/lib/store-api/types";

export function TodayQueue({
  dashboard, magicHints, activity, lowStockItems,
}: {
  dashboard: DashboardData;
  magicHints: MagicHint[];
  activity: ActivityEvent[];
  lowStockItems: string[];
}) {
  const topHint = magicHints[0] ?? null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 18 }}>
      <Panel title="Attention" meta={`${countRows(dashboard, lowStockItems, topHint)} today`}>
        <AttentionList
          dashboard={dashboard}
          lowStockItems={lowStockItems}
          magicHint={topHint}
          promoEndingSoon={null}
        />
      </Panel>
      <Panel title="Activity" meta="just now">
        <ActivityFeed events={activity.slice(0, 6)} />
      </Panel>
    </div>
  );
}

function countRows(dash: DashboardData, low: string[], hint: MagicHint | null): number {
  return (low.length > 0 ? 1 : 0) + (dash.visits.next ? 1 : 0) + (hint ? 1 : 0);
}

function Panel({ title, meta, children }: { title: string; meta: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--color-paper)", border: "1px solid var(--color-hair)",
        padding: "24px 26px", minHeight: 280,
      }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--color-hair)",
      }}>
        <span className="serif" style={{ fontSize: 24, lineHeight: 1 }}>{title}</span>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-taupe)" }}>{meta}</span>
      </div>
      {children}
    </div>
  );
}
