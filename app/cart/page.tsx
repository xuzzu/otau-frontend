"use client";

import { useMemo } from "react";
import Link from "next/link";
import { TopNav } from "@/components/nav/TopNav";
import { useItems, useMyCart, useRemoveCartItem } from "@/lib/hooks";
import { resolveCatalogAsset } from "@/lib/api/env";
import { useT } from "@/lib/i18n";
import { T } from "@/lib/format";
import type { ItemSummary } from "@/lib/api/types";

export default function CartPage() {
  const { t } = useT();
  const cart = useMyCart();
  const remove = useRemoveCartItem();
  const items = cart.data?.items ?? [];
  const itemIds = useMemo(() => items.map((i) => i.item_id), [items]);
  const detailsQ = useItems(itemIds.length ? { id: itemIds, limit: 100 } : { limit: 0 });
  const detailById = useMemo(() => {
    const m = new Map<string, ItemSummary>();
    for (const d of detailsQ.data ?? []) m.set(d.id, d);
    return m;
  }, [detailsQ.data]);

  const subtotal = items.reduce(
    (sum, it) => sum + (it.unit_price ?? 0) * it.quantity,
    0,
  );
  const currency = items[0]?.currency ?? "KZT";

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
      <TopNav />
      <section style={{ padding: "44px 56px", maxWidth: 960 }}>
        <h1
          className="serif"
          style={{
            fontSize: 56,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {t("cart.title")}
        </h1>

        {cart.isLoading ? (
          <div className="label" style={{ marginTop: 32 }}>
            …
          </div>
        ) : items.length === 0 ? (
          <div className="label" style={{ marginTop: 32 }}>
            {t("cart.empty")}
          </div>
        ) : (
          <>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 0 }}>
              {items.map((it) => {
                const detail = detailById.get(it.item_id);
                return (
                  <div
                    key={it.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr auto auto",
                      gap: 16,
                      alignItems: "center",
                      padding: "14px 0",
                      borderBottom: "1px solid var(--color-hair)",
                    }}
                  >
                    {detail?.main_image_url ? (
                      <img
                        src={resolveCatalogAsset(detail.main_image_url) ?? undefined}
                        alt={detail.name}
                        style={{ width: 80, height: 80, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          background: "var(--color-hair)",
                        }}
                      />
                    )}
                    <div>
                      <Link
                        href={detail ? `/catalog/${detail.slug}` : "#"}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          fontSize: 16,
                        }}
                      >
                        {detail?.name ?? it.item_id}
                      </Link>
                      <div className="label" style={{ marginTop: 4 }}>
                        {t("cart.qty")}: {it.quantity}
                      </div>
                    </div>
                    <div className="num" style={{ fontSize: 15 }}>
                      {T(it.unit_price * it.quantity)}
                    </div>
                    <button
                      onClick={() => remove.mutate(it.id)}
                      disabled={remove.isPending}
                      className="mono"
                      style={{
                        background: "transparent",
                        border: "1px solid var(--color-hair)",
                        padding: "6px 10px",
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        color: "var(--color-ink)",
                      }}
                    >
                      ✕ {t("cart.remove")}
                    </button>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 28,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 18,
                borderTop: "1px solid var(--color-hair)",
              }}
            >
              <div>
                <div className="label">{t("cart.subtotal")}</div>
                <div
                  className="serif num"
                  style={{ fontSize: 32, marginTop: 4, lineHeight: 1 }}
                >
                  {T(subtotal)} {currency}
                </div>
              </div>
              <button
                onClick={() => alert("Checkout not wired yet")}
                className="btn"
                style={{ padding: "16px 24px" }}
              >
                {t("cart.checkout")}
                <span className="arrow">→</span>
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
