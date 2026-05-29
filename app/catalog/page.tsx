"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { FilterBar } from "@/components/catalog/FilterBar";
import { CatalogGrid } from "@/components/catalog/CatalogGrid";
import { useItems, usePartners, useTaxonomy } from "@/lib/hooks";
import { useT } from "@/lib/i18n";
import type { SortKey } from "@/lib/products";

function CatalogInner() {
  const sp = useSearchParams();
  const { t } = useT();

  const params = useMemo(() => {
    return {
      q: sp.get("q") ?? undefined,
      category: sp.get("category")?.split(",").filter(Boolean) ?? [],
      style: sp.get("style")?.split(",").filter(Boolean) ?? [],
      seller: sp.get("seller")?.split(",").filter(Boolean) ?? [],
      room: sp.get("room") ?? undefined,
      sort: (sp.get("sort") as SortKey) ?? "curated",
    };
  }, [sp]);

  const { indexed } = useTaxonomy();
  const partnersQ = usePartners();
  const partners = partnersQ.data ?? [];

  const categoryIds = useMemo(() => {
    if (!indexed || params.category.length === 0) return undefined;
    const idBySlug = new Map(
      Object.values(indexed.categories).map((c) => [c.slug, c.id]),
    );
    const ids = params.category
      .map((slug) => idBySlug.get(slug))
      .filter((id): id is string => Boolean(id));
    return ids.length ? ids : undefined;
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
    category_id: categoryIds,
    style_id: styleId,
    partner_id: partnerId,
    room: params.room,
    limit: 100,
  });

  const products = itemsQ.data ?? [];

  return (
    <>
      <FilterBar resultCount={products.length} />
      {itemsQ.isLoading ? (
        <div className="label" style={{ padding: "80px 56px", textAlign: "center" }}>
          {t("catalog.loading")}
        </div>
      ) : (
        <CatalogGrid products={products} />
      )}
    </>
  );
}

function CatalogFallback() {
  const { t } = useT();
  return (
    <div className="label" style={{ padding: 56 }}>
      {t("catalog.loading")}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
      <TopNav />
      <Suspense fallback={<CatalogFallback />}>
        <CatalogInner />
      </Suspense>
    </main>
  );
}
