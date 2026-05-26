"use client";
import { useStoreDashboard } from "@/lib/store-api/hooks";
import { useT } from "@/lib/i18n";
import { DashboardCard } from "@/components/store/DashboardCard";

export default function DashboardPage() {
  const { t } = useT();
  const { data, isLoading, error } = useStoreDashboard();
  if (isLoading) return <p>…</p>;
  if (error) return <p style={{ color: "#a64545" }}>{(error as Error).message}</p>;
  if (!data) return null;
  const delta = data.likes.last_7d - data.likes.prev_7d;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600 }}>
      <DashboardCard
        title="Likes on items"
        value={data.likes.total}
        trend={{ delta, positive: delta >= 0 }}
      />
      <DashboardCard
        title="Pending visit requests"
        value={data.visits.pending_count}
        sub={data.visits.next ? `Next: ${data.visits.next.recipient_name} · ${data.visits.next.date}` : undefined}
      />
    </div>
  );
}
