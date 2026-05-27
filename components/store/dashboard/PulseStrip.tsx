"use client";
import { StatCard } from "@/components/store/shared/StatCard";
import type { DashboardData } from "@/lib/store-api/types";

export function PulseStrip({ data }: { data: DashboardData }) {
  const { likes, imagined, stock, visits, trust } = data;
  const desireDelta = likes.last_7d - likes.prev_7d;

  const stockSub = stock?.low_count
    ? { text: `⚠ ${stock.low_count} below threshold`, tone: "warm" as const }
    : { text: `↑ ${stock?.restocks_7d ?? 0} restocks`, tone: "ok" as const };

  const trustValue = trust.rating != null ? trust.rating.toFixed(1) : "—";
  const trustSub = trust.rating == null
    ? "awaiting first review"
    : `★★★★★ · ${trust.reviews_count} reviews`;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
      <StatCard
        label="Desire"
        value={likes.total}
        delta={{ text: `${desireDelta >= 0 ? "↑" : "↓"} ${Math.abs(desireDelta)} likes`,
                 tone: desireDelta >= 0 ? "ok" : "warm" }}
        spark={likes.spark_14d}
      />
      <StatCard
        label="✦ Imagined"
        accent="magic"
        value={imagined?.scenes_count ?? 0}
        sub={
          imagined
            ? <>your items in <strong>{imagined.items_in_scenes_count}</strong> rooms this week</>
            : "no scenes yet"
        }
      />
      <StatCard
        label="Stock"
        value={stock?.units ?? 0}
        valueSmall="units"
        delta={stockSub}
      />
      <StatCard
        label="Visits"
        value={visits.pending_count}
        sub={
          visits.next
            ? `Next: ${visits.next.recipient_name} · ${formatVisitWhen(visits.next.date)}`
            : "no requests yet"
        }
      />
      <StatCard
        label="Trust"
        value={trustValue}
        sub={trustSub}
      />
    </div>
  );
}

function formatVisitWhen(iso: string): string {
  const d = new Date(iso);
  const days = ["sun","mon","tue","wed","thu","fri","sat"];
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${days[d.getDay()]} ${hh}:${mm}`;
}
