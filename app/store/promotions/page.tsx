"use client";
import Link from "next/link";
import { useState } from "react";
import { usePromotions } from "@/lib/store-api/hooks";
import { PromotionTable } from "@/components/store/PromotionTable";

const STATUSES = ["all", "active", "scheduled", "ended"] as const;

export default function PromotionsPage() {
  const [status, setStatus] = useState<typeof STATUSES[number]>("all");
  const { data, isLoading } = usePromotions(status);
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid var(--color-hair)", background: status === s ? "var(--color-ink)" : "transparent", color: status === s ? "var(--color-paper)" : "var(--color-ink)" }}>{s}</button>
        ))}
        <Link href="/store/promotions/new" style={{ marginLeft: "auto", padding: "6px 12px", background: "var(--color-ink)", color: "var(--color-paper)" }}>+ New promotion</Link>
      </div>
      {isLoading ? <p>…</p> : <PromotionTable rows={data ?? []} />}
    </div>
  );
}
