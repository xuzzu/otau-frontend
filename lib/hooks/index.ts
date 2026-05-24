"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as catalog from "@/lib/api/catalog";
import * as core from "@/lib/api/core";
import { ApiError } from "@/lib/api/http";
import type {
  Like,
  SessionUpgradeBody,
  SessionVerifyBody,
} from "@/lib/api/types";
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

// --- Core: me ---

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

// --- Core: cart ---

export const useMyCart = () =>
  useQuery({
    queryKey: qk.cart,
    queryFn: core.getMyCart,
    retry: (n, e) => (e as ApiError)?.status === 401 ? false : n < 1,
  });

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof core.addCartItem>[0]) =>
      core.addCartItem(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.cart });
    },
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (item_id: string) => core.removeCartItem(item_id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.cart });
    },
  });
}

// --- Core: likes ---

export const useMyLikes = () =>
  useQuery({
    queryKey: qk.myLikes,
    queryFn: core.listMyLikes,
    retry: (n, e) => (e as ApiError)?.status === 401 ? false : n < 1,
  });

type ToggleLikeVars = {
  target_kind: Like["target_kind"];
  target_id: string;
  currentlyLiked: boolean;
};

export function useToggleLike() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ target_kind, target_id, currentlyLiked }: ToggleLikeVars) => {
      if (currentlyLiked) {
        await core.removeLike(target_kind, target_id);
        return { added: false as const, target_kind, target_id };
      }
      const created = await core.addLike(target_kind, target_id);
      return { added: true as const, like: created };
    },
    onMutate: async ({ target_kind, target_id, currentlyLiked }) => {
      await qc.cancelQueries({ queryKey: qk.myLikes });
      const previous = qc.getQueryData<Like[]>(qk.myLikes) ?? [];
      const next = currentlyLiked
        ? previous.filter(
            (l) => !(l.target_kind === target_kind && l.target_id === target_id),
          )
        : [
            ...previous,
            {
              id: `optimistic-${target_id}`,
              user_id: "me",
              target_kind,
              target_id,
              created_at: new Date().toISOString(),
            } satisfies Like,
          ];
      qc.setQueryData(qk.myLikes, next);
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(qk.myLikes, ctx.previous);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.myLikes });
    },
  });
}

// --- Core: sessions / auth ---

export const useSessionsUpgrade = () =>
  useMutation({
    mutationFn: (body: SessionUpgradeBody) => core.sessionsUpgrade(body),
  });

export function useSessionsVerify() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SessionVerifyBody) => core.sessionsVerify(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me });
      qc.invalidateQueries({ queryKey: qk.cart });
      qc.invalidateQueries({ queryKey: qk.myLikes });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => core.sessionsLogout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.me });
      qc.invalidateQueries({ queryKey: qk.cart });
      qc.invalidateQueries({ queryKey: qk.myLikes });
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
