"use client";
import Link from "next/link";
import { useState } from "react";
import { useStoreItems } from "@/lib/store-api/hooks";
import { ItemTable } from "@/components/store/ItemTable";
import { useT } from "@/lib/i18n";

const STATUSES = [
  { value: undefined, label: "All" },
  { value: "active",   label: "Active" },
  { value: "draft",    label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

export default function CatalogPage() {
  const { t } = useT();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [q, setQ] = useState("");
  const { data, isLoading } = useStoreItems({ status: statusFilter, q });

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {STATUSES.map((s) => (
          <button
            key={s.label}
            onClick={() => setStatusFilter(s.value)}
            style={{
              padding: "4px 10px", border: "1px solid var(--color-hair)", borderRadius: 999,
              background: statusFilter === s.value ? "var(--color-ink)" : "transparent",
              color:      statusFilter === s.value ? "var(--color-paper)" : "var(--color-ink)",
              fontSize: 11, cursor: "pointer", fontFamily: "inherit",
            }}
          >{s.label}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("nav.search") ?? "search"} style={{ marginLeft: "auto", padding: "4px 8px", border: "1px solid var(--color-hair)" }} />
        <Link href="/store/catalog/new" style={{ padding: "6px 12px", background: "var(--color-ink)", color: "var(--color-paper)", textDecoration: "none", fontSize: 12, borderRadius: 3 }}>
          {t("store.add_item")}
        </Link>
      </div>
      {isLoading ? <p>…</p> : <ItemTable rows={data ?? []} />}
    </div>
  );
}
