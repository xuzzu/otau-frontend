"use client";

import { useQuery } from "@tanstack/react-query";
import * as catalog from "@/lib/api/catalog";
import * as core from "@/lib/api/core";
import type { ApiError } from "@/lib/api/http";
import { qk } from "./queryKeys";

export { qk } from "./queryKeys";
export * from "./useTaxonomy";
export * from "./useGeneration";

// --- Catalog read hooks ---

export const useItems = (params: catalog.ListItemsParams = {}) =>
  useQuery({ queryKey: qk.items(params), queryFn: () => catalog.listItems(params) });

export const useItem = (id: string | null | undefined) =>
  useQuery({
    queryKey: id ? qk.item(id) : ["item", null],
    queryFn: () => catalog.getItem(id as string),
    enabled: !!id,
  });

export const useItemBySlug = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.itemBySlug(slug) : ["item-by-slug", null],
    queryFn: () => catalog.getItemBySlug(slug as string),
    enabled: !!slug,
  });

export const usePartners = (params?: { status?: string }) =>
  useQuery({ queryKey: qk.partners(), queryFn: () => catalog.listPartners(params) });

export const usePartnerBySlug = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.partnerBySlug(slug) : ["partner-by-slug", null],
    queryFn: () => catalog.getPartnerBySlug(slug as string),
    enabled: !!slug,
  });

export const usePartnerShopsBySlug = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.partnerShopsBySlug(slug) : ["partner-shops-by-slug", null],
    queryFn: () => catalog.listPartnerShopsBySlug(slug as string),
    enabled: !!slug,
  });

export const useShops = (params?: { city?: string }) =>
  useQuery({ queryKey: qk.shops(), queryFn: () => catalog.listShops(params) });

export const useShopBySlug = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.shopBySlug(slug) : ["shop-by-slug", null],
    queryFn: () => catalog.getShopBySlug(slug as string),
    enabled: !!slug,
  });

export const useShopItemsBySlug = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.shopItemsBySlug(slug) : ["shop-items-by-slug", null],
    queryFn: () => catalog.listShopItemsBySlug(slug as string),
    enabled: !!slug,
  });

export const useApartmentComplexes = (params?: { city?: string }) =>
  useQuery({
    queryKey: qk.apartmentComplexes(),
    queryFn: () => catalog.listApartmentComplexes(params),
  });

export const useApartmentComplexBySlug = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.apartmentComplexBySlug(slug) : ["apartment-complex-by-slug", null],
    queryFn: () => catalog.getApartmentComplexBySlug(slug as string),
    enabled: !!slug,
  });

export const useApartmentPlansBySlug = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.apartmentPlansBySlug(slug) : ["apartment-plans-by-slug", null],
    queryFn: () => catalog.listApartmentPlansBySlug(slug as string),
    enabled: !!slug,
  });

// --- Core ---

export function useMe() {
  return useQuery({
    queryKey: qk.me,
    queryFn: core.getMe,
    retry: (failureCount, error) => {
      if ((error as ApiError)?.status === 401) return false;
      return failureCount < 1;
    },
  });
}

export const useJournal = (params?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) =>
  useQuery({
    queryKey: qk.journal(params),
    queryFn: () => core.listJournal(params),
  });

export const useJournalArticle = (slug: string | null | undefined) =>
  useQuery({
    queryKey: slug ? qk.journalArticle(slug) : ["journal-article", null],
    queryFn: () => core.getJournalArticle(slug as string),
    enabled: !!slug,
  });
