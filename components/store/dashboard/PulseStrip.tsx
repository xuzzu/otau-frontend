"use client";
import { useT } from "@/lib/i18n";
import { StatCard } from "@/components/store/shared/StatCard";
import type { DashboardData } from "@/lib/store-api/types";

const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;

export function PulseStrip({ data }: { data: DashboardData }) {
  const { t } = useT();
  const { likes, imagined, stock, visits, trust } = data;
  const desireDelta = likes.last_7d - likes.prev_7d;

  const stockSub = stock?.low_count
    ? { text: t("store.dashboard.pulse.stock_low", { n: stock.low_count }), tone: "warm" as const }
    : { text: t("store.dashboard.pulse.stock_restocks", { n: stock?.restocks_7d ?? 0 }), tone: "ok" as const };

  const trustValue = trust.rating != null ? trust.rating.toFixed(1) : "—";
  const trustSub = trust.rating == null
    ? t("store.dashboard.pulse.awaiting_review")
    : t("store.dashboard.pulse.reviews_count", { n: trust.reviews_count });

  const desireDeltaText = desireDelta >= 0
    ? t("store.dashboard.pulse.likes_delta_up", { n: Math.abs(desireDelta) })
    : t("store.dashboard.pulse.likes_delta_down", { n: Math.abs(desireDelta) });

  const visitSub = visits.next
    ? t("store.dashboard.pulse.visit_next", {
        who: visits.next.recipient_name,
        when: formatVisitWhen(visits.next.date, t),
      })
    : t("store.dashboard.pulse.no_visits");

  const imaginedSub = imagined
    ? t("store.dashboard.pulse.scenes_rooms", { n: imagined.items_in_scenes_count })
    : t("store.dashboard.pulse.no_scenes");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
      <StatCard
        label={t("store.dashboard.pulse.kpi.desire")}
        value={likes.total}
        delta={{ text: desireDeltaText, tone: desireDelta >= 0 ? "ok" : "warm" }}
        spark={likes.spark_14d}
      />
      <StatCard
        label={t("store.dashboard.pulse.kpi.imagined")}
        accent="magic"
        value={imagined?.scenes_count ?? 0}
        sub={imaginedSub}
      />
      <StatCard
        label={t("store.dashboard.pulse.kpi.stock")}
        value={stock?.units ?? 0}
        valueSmall={t("store.dashboard.pulse.units")}
        delta={stockSub}
      />
      <StatCard
        label={t("store.dashboard.pulse.kpi.visits")}
        value={visits.pending_count}
        sub={visitSub}
      />
      <StatCard
        label={t("store.dashboard.pulse.kpi.trust")}
        value={trustValue}
        sub={trustSub}
      />
    </div>
  );
}

function formatVisitWhen(iso: string, t: (k: string) => string): string {
  const d = new Date(iso);
  const dayKey = DAY_KEYS[d.getDay()];
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${t(`date.day.${dayKey}`)} ${hh}:${mm}`;
}
