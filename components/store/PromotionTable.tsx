"use client";
import Link from "next/link";
import { useEndPromotion } from "@/lib/store-api/hooks";
import type { Promotion } from "@/lib/store-api/types";

export function PromotionTable({ rows }: { rows: Promotion[] }) {
  const end = useEndPromotion();
  if (rows.length === 0) return <p style={{ color: "var(--color-rust)" }}>No promotions.</p>;
  return (
    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
      <thead><tr><th align="left">Item / variant</th><th align="left">Discount</th><th align="left">Window</th><th align="left">Status</th><th></th></tr></thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.id} style={{ borderBottom: "1px solid var(--color-hair)" }}>
            <td>{p.item_id}{p.variant_id ? ` · ${p.variant_id}` : ""}</td>
            <td>{p.discount_kind === "percent" ? `-${(p.discount_value / 100).toFixed(2)}%` : `-${p.discount_value} ₸`}</td>
            <td>{p.starts_at.slice(0, 10)} → {p.ends_at ? p.ends_at.slice(0, 10) : "no end"}</td>
            <td>{p.status_bucket}</td>
            <td>
              {p.status_bucket !== "ended" && (
                <button onClick={() => end.mutate(p.id)}>End now</button>
              )}
              <Link href={`/store/promotions/${p.id}/edit`} style={{ marginLeft: 8 }}>Edit</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
