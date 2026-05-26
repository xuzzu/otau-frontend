"use client";
import { useState } from "react";
import type { StoreVariant } from "@/lib/store-api/types";
import { useRestock, useSetStock } from "@/lib/store-api/hooks";

export function VariantStockEditor({ item_id, variant }: { item_id: string; variant: StoreVariant }) {
  const setStock = useSetStock(item_id);
  const restock = useRestock(item_id);
  const [open, setOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  const [reason, setReason] = useState<"restock" | "correction">("restock");

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        type="number" defaultValue={variant.in_stock_current_shop}
        onBlur={(e) => {
          const v = Number(e.target.value);
          if (!Number.isNaN(v) && v !== variant.in_stock_current_shop) {
            setStock.mutate({ vid: variant.id, in_stock: v });
          }
        }}
        style={{ width: 60, padding: "2px 6px", border: "1px solid var(--color-hair)" }}
      />
      <button onClick={() => setOpen((v) => !v)} style={{ padding: "2px 8px", fontSize: 11, cursor: "pointer" }}>
        + restock
      </button>
      {open && (
        <span style={{ display: "inline-flex", gap: 4 }}>
          <input type="number" value={delta} onChange={(e) => setDelta(Number(e.target.value))} style={{ width: 50 }} />
          <select value={reason} onChange={(e) => setReason(e.target.value as "restock" | "correction")}>
            <option value="restock">restock</option>
            <option value="correction">correction</option>
          </select>
          <button onClick={() => { restock.mutate({ vid: variant.id, delta, reason }); setOpen(false); setDelta(0); }}>
            apply
          </button>
        </span>
      )}
    </div>
  );
}
