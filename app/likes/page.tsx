"use client";

import { useMemo } from "react";
import Link from "next/link";
import { TopNav } from "@/components/nav/TopNav";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { useItems, useMyLikes } from "@/lib/hooks";
import { useT } from "@/lib/i18n";

export default function LikesPage() {
  const { t } = useT();
  const likes = useMyLikes();
  const itemIds = useMemo(() => {
    return (likes.data ?? [])
      .filter((l) => l.target_kind === "item")
      .map((l) => l.target_id);
  }, [likes.data]);
  const itemsQ = useItems(itemIds.length ? { id: itemIds, limit: 100 } : { limit: 0 });
  const products = itemsQ.data ?? [];

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
      <TopNav />
      <section
        style={{
          padding: "28px 56px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="label">{t("nav.account")}</div>
          <h2
            className="serif"
            style={{
              fontSize: 56,
              margin: "8px 0 0",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            {t("likes.title")}
          </h2>
        </div>
        <span className="label">{t("likes.count", { n: products.length })}</span>
      </section>

      {likes.isLoading || itemsQ.isLoading ? (
        <div className="label" style={{ padding: "80px 56px", textAlign: "center" }}>
          …
        </div>
      ) : products.length === 0 ? (
        <div style={{ padding: "80px 56px", textAlign: "center" }}>
          <div className="serif it" style={{ fontSize: 32, color: "var(--color-taupe)" }}>
            {t("likes.empty.lede")}
          </div>
          <Link
            href="/catalog"
            className="btn ghost"
            style={{ marginTop: 18, display: "inline-flex" }}
          >
            {t("likes.empty.cta")}
            <span className="arrow">→</span>
          </Link>
        </div>
      ) : (
        <CatalogGrid products={products} />
      )}
    </main>
  );
}
