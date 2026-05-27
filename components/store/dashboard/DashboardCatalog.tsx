"use client";
import { useState, useEffect } from "react";
import { useStoreCatalogCounts, useStoreItems } from "@/lib/store-api/hooks";
import { CatalogChips } from "./CatalogChips";
import { CatalogCard } from "./CatalogCard";
import type { ItemBucket } from "@/lib/store-api/types";

export function DashboardCatalog() {
  const [bucket, setBucket] = useState<ItemBucket>("all");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const counts = useStoreCatalogCounts();
  // bucket=drafts/attention/archived include items without VariantStock at this shop,
  // so pass all=1 to bypass the default "current shop only" scope filter.
  const items = useStoreItems({ bucket, q: debouncedQ, limit: 8, all: 1 });

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 22 }}>
        <CatalogChips current={bucket} counts={counts.data} onChange={setBucket} />
        <input
          type="search"
          placeholder="Search items, SKU, tags…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mono"
          style={{
            marginLeft: "auto", minWidth: 280,
            padding: "9px 14px", borderRadius: 999,
            border: "1px solid var(--color-hair-2)", background: "var(--color-paper)",
            fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-ink)",
          }}
        />
      </div>

      {items.isLoading ? (
        <div className="mono" style={{ padding: 32, textAlign: "center", color: "var(--color-taupe)" }}>loading…</div>
      ) : items.data && items.data.length === 0 ? (
        <div className="serif it" style={{ padding: 48, textAlign: "center", color: "var(--color-taupe-2)", fontSize: 18 }}>
          Your shop is quiet here. <a href="/store/catalog/new" className="mono" style={{ marginLeft: 12 }}>+ Add item →</a>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {(items.data ?? []).map((it) => (
            <CatalogCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}
