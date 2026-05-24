"use client";

import { useQuery } from "@tanstack/react-query";
import { listAllTaxonomy, type Taxonomy } from "@/lib/api/catalog";
import { useLocale, pickText } from "@/lib/i18n";
import { useMemo } from "react";
import { qk } from "./queryKeys";

type TaxonomyIndex = {
  categories: Record<string, Taxonomy["categories"][number]>;
  colors: Record<string, Taxonomy["colors"][number]>;
  materials: Record<string, Taxonomy["materials"][number]>;
  styles: Record<string, Taxonomy["styles"][number]>;
  roomTypes: Record<string, Taxonomy["roomTypes"][number]>;
};

function indexById<T extends { id: string }>(rows: T[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const r of rows) out[r.id] = r;
  return out;
}

export function useTaxonomy() {
  const q = useQuery({
    queryKey: qk.taxonomy,
    queryFn: listAllTaxonomy,
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const indexed = useMemo<TaxonomyIndex | null>(() => {
    if (!q.data) return null;
    return {
      categories: indexById(q.data.categories),
      colors: indexById(q.data.colors),
      materials: indexById(q.data.materials),
      styles: indexById(q.data.styles),
      roomTypes: indexById(q.data.roomTypes),
    };
  }, [q.data]);
  return { ...q, indexed };
}

export function useCategoryLabel(id: string | null | undefined): string {
  const locale = useLocale();
  const { indexed } = useTaxonomy();
  if (!id || !indexed) return "";
  return pickText(indexed.categories[id]?.name, locale);
}

export function useStyleLabel(id: string | null | undefined): string {
  const locale = useLocale();
  const { indexed } = useTaxonomy();
  if (!id || !indexed) return "";
  return pickText(indexed.styles[id]?.name, locale);
}

export function useRoomTypeLabel(id: string | null | undefined): string {
  const locale = useLocale();
  const { indexed } = useTaxonomy();
  if (!id || !indexed) return "";
  return pickText(indexed.roomTypes[id]?.name, locale);
}

export function useMaterialLabel(id: string | null | undefined): string {
  const locale = useLocale();
  const { indexed } = useTaxonomy();
  if (!id || !indexed) return "";
  return pickText(indexed.materials[id]?.name, locale);
}

export function useColorLabel(id: string | null | undefined): string {
  const locale = useLocale();
  const { indexed } = useTaxonomy();
  if (!id || !indexed) return "";
  return pickText(indexed.colors[id]?.name, locale);
}
