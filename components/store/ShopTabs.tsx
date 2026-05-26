"use client";
import { useShopContext } from "@/lib/shop-context";

export function ShopTabs() {
  const { shops, selectedShopId, selectShop } = useShopContext();
  if (shops.length <= 1) return null;
  return (
    <div style={{ display: "flex", gap: 6, padding: "8px 56px", borderBottom: "1px solid var(--color-hair)" }}>
      {shops.map((s) => (
        <button
          key={s.id}
          onClick={() => selectShop(s.id)}
          style={{
            padding: "4px 12px", border: "1px solid var(--color-hair)", borderRadius: 999,
            background: s.id === selectedShopId ? "var(--color-ink)" : "transparent",
            color: s.id === selectedShopId ? "var(--color-paper)" : "var(--color-ink)",
            fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          {s.name}
        </button>
      ))}
    </div>
  );
}
