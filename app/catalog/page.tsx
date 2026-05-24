"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { FilterBar } from "@/components/catalog/FilterBar";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { useItems, usePartners, useTaxonomy } from "@/lib/hooks";
import type { Category, SortKey, Style } from "@/lib/products";

function CatalogInner() {
  const sp = useSearchParams();

  const params = useMemo(() => {
    return {
      q: sp.get("q") ?? undefined,
      category: (sp.get("category")?.split(",").filter(Boolean) ?? []) as Category[],
      style: (sp.get("style")?.split(",").filter(Boolean) ?? []) as Style[],
      seller: sp.get("seller")?.split(",").filter(Boolean) ?? [],
      sort: (sp.get("sort") as SortKey) ?? "curated",
    };
  }, [sp]);

  const itemsQ = useItems({ q: params.q, sort: params.sort, limit: 100 });
  const partnersQ = usePartners();
  const { indexed } = useTaxonomy();

  const filtered = useMemo(() => {
    let rows = itemsQ.data ?? [];

    if (params.seller.length > 0 && partnersQ.data) {
      const partnerIds = new Set(
        partnersQ.data
          .filter((p) => params.seller.includes(p.slug))
          .map((p) => p.id),
      );
      rows = rows.filter((r) => partnerIds.has(r.partner_id));
    }
    if (params.category.length > 0 && indexed) {
      const catIds = new Set(
        Object.values(indexed.categories)
          .filter((c) => params.category.includes(c.slug as Category))
          .map((c) => c.id),
      );
      rows = rows.filter((r) => catIds.has(r.category_id));
    }
    // Style filter requires full Item.style_ids; we'd need to fetch detail.
    // Deferred — chips still render but don't filter for now.
    return rows;
  }, [itemsQ.data, partnersQ.data, indexed, params]);

  const loading = itemsQ.isLoading;
  return (
    <>
      <FilterBar resultCount={filtered.length} />
      {loading ? (
        <div className="label" style={{ padding: "80px 56px", textAlign: "center" }}>
          Loading…
        </div>
      ) : (
        <CatalogGrid products={filtered} />
      )}
    </>
  );
}

export default function CatalogPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
      <TopNav />
      <Suspense fallback={<div className="label" style={{ padding: 56 }}>Loading…</div>}>
        <CatalogInner />
      </Suspense>
    </main>
  );
}
