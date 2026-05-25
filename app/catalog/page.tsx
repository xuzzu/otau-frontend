"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { FilterBar } from "@/components/catalog/FilterBar";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { useItems, usePartners, useTaxonomy } from "@/lib/hooks";
import type { SortKey } from "@/lib/products";

function CatalogInner() {
  const sp = useSearchParams();

  const params = useMemo(() => {
    return {
      q: sp.get("q") ?? undefined,
      category: sp.get("category")?.split(",").filter(Boolean) ?? [],
      style: sp.get("style")?.split(",").filter(Boolean) ?? [],
      seller: sp.get("seller")?.split(",").filter(Boolean) ?? [],
      sort: (sp.get("sort") as SortKey) ?? "curated",
    };
  }, [sp]);

  const { indexed } = useTaxonomy();
  const partnersQ = usePartners();
  const partners = partnersQ.data ?? [];

  const categoryId = useMemo(() => {
    if (!indexed || params.category.length === 0) return undefined;
    const slug = params.category[0];
    return Object.values(indexed.categories).find((c) => c.slug === slug)?.id;
  }, [indexed, params.category]);

  const styleId = useMemo(() => {
    if (!indexed || params.style.length === 0) return undefined;
    const slug = params.style[0];
    return Object.values(indexed.styles).find((s) => s.slug === slug)?.id;
  }, [indexed, params.style]);

  const partnerId = useMemo(() => {
    if (params.seller.length === 0) return undefined;
    return partners.find((p) => p.slug === params.seller[0])?.id;
  }, [partners, params.seller]);

  const itemsQ = useItems({
    q: params.q,
    sort: params.sort,
    category_id: categoryId,
    style_id: styleId,
    partner_id: partnerId,
    limit: 100,
  });

  const products = itemsQ.data ?? [];

  return (
    <>
      <FilterBar resultCount={products.length} />
      {itemsQ.isLoading ? (
        <div className="label" style={{ padding: "80px 56px", textAlign: "center" }}>
          Loading…
        </div>
      ) : (
        <CatalogGrid products={products} />
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
