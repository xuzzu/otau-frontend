"use client";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { StoreItemSummary } from "@/lib/store-api/types";

export function ItemTable({ rows }: { rows: StoreItemSummary[] }) {
  if (rows.length === 0) return <p style={{ color: "var(--color-rust, #9A8A72)" }}>No items at this shop yet.</p>;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr style={{ background: "#f4ede0", textAlign: "left" }}>
          <th style={{ padding: 8 }}>Item</th>
          <th style={{ padding: 8 }}>Price</th>
          <th style={{ padding: 8 }}>Stock</th>
          <th style={{ padding: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((it) => (
          <tr key={it.id} style={{ borderBottom: "1px solid var(--color-hair)" }}>
            <td style={{ padding: 8 }}>
              <Link href={`/store/catalog/${it.id}/edit`} style={{ color: "var(--color-ink)" }}>
                {it.name}
              </Link>
              {it.has_active_promotion && (
                <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 6px", background: "#e0d2dc", color: "#5a3c54" }}>Sale</span>
              )}
            </td>
            <td style={{ padding: 8 }}>{it.default_price != null ? formatPrice(it.default_price, "KZT") : "—"}</td>
            <td style={{ padding: 8 }}>{it.in_stock_current_shop}</td>
            <td style={{ padding: 8 }}>
              <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 3, background: it.status === "active" ? "#d4dcc8" : it.status === "archived" ? "#e8d4d2" : "#ece5d4" }}>
                {it.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
