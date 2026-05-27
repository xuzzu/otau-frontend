"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShopContext } from "@/lib/shop-context";
import * as cat from "./store-catalog";
import * as core from "./store-core";
import type { StoreItem, StoreItemSummary, Promotion, DashboardData, ActivityEvent, CatalogCounts, MagicHint, StoreScene } from "./types";

function useShopId() {
  return useShopContext().selectedShopId;
}

export function useStoreInfo() {
  return useQuery({ queryKey: ["store", "info"], queryFn: cat.getStoreInfo });
}

export function useStoreItems(params: cat.ListStoreItemsParams = {}) {
  const shopId = useShopId();
  return useQuery<StoreItemSummary[]>({
    queryKey: ["store", shopId, "items", params],
    queryFn: () => cat.listStoreItems(params),
    enabled: !!shopId,
  });
}

export function useStoreItem(id: string | undefined) {
  const shopId = useShopId();
  return useQuery<StoreItem>({
    queryKey: ["store", shopId, "items", id],
    queryFn: () => cat.getStoreItem(id!),
    enabled: !!shopId && !!id,
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  const shopId = useShopId();
  return useMutation({
    mutationFn: cat.createStoreItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }),
  });
}

export function usePatchItem(id: string) {
  const qc = useQueryClient();
  const shopId = useShopId();
  return useMutation({
    mutationFn: (body: Partial<cat.StoreItemInput>) => cat.patchStoreItem(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }),
  });
}

export function useArchiveItem(id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: () => cat.archiveStoreItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }) });
}
export function useRestoreItem(id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: () => cat.restoreStoreItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }) });
}
export function useDeleteItem(id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: () => cat.deleteStoreItem(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }) });
}
export function useRemoveAvailability(id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: () => cat.removeAvailability(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }) });
}

export function useAddVariant(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (body: cat.VariantInput) => cat.addVariant(item_id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }) });
}
export function usePatchVariant(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({
    mutationFn: ({ vid, body }: { vid: string; body: Partial<cat.VariantInput> }) =>
      cat.patchVariant(item_id, vid, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }),
  });
}
export function useDeleteVariant(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (vid: string) => cat.deleteVariant(item_id, vid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }) });
}

export function useAddImage(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (body: cat.ImageInput) => cat.addImage(item_id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }) });
}
export function usePatchImage(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({
    mutationFn: ({ img_id, body }: { img_id: string; body: Partial<cat.ImageInput> }) =>
      cat.patchImage(item_id, img_id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }),
  });
}
export function useDeleteImage(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (img_id: string) => cat.deleteImage(item_id, img_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }) });
}

export function useSetStock(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({
    mutationFn: ({ vid, in_stock }: { vid: string; in_stock: number }) => cat.setStock(vid, in_stock),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }),
  });
}
export function useRestock(item_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({
    mutationFn: ({ vid, delta, reason, note }: { vid: string; delta: number; reason: "restock" | "correction"; note?: string }) =>
      cat.restockEvent(vid, delta, reason, note),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "items", item_id] }),
  });
}

export function usePromotions(status: "active" | "scheduled" | "ended" | "all" = "all") {
  const shopId = useShopId();
  return useQuery<Promotion[]>({
    queryKey: ["store", shopId, "promotions", status],
    queryFn: () => cat.listPromotions(status),
    enabled: !!shopId,
  });
}
export function useCreatePromotion() {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: cat.createPromotion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "promotions"] }) });
}
export function usePatchPromotion(id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (body: Partial<cat.PromotionInput>) => cat.patchPromotion(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "promotions"] }) });
}
export function useEndPromotion() {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (id: string) => cat.endPromotion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId, "promotions"] }) });
}

export function useStoreDashboard() {
  const shopId = useShopId();
  return useQuery<DashboardData>({
    queryKey: ["store", shopId, "dashboard"],
    queryFn: () => core.getStoreDashboard(shopId!),
    enabled: !!shopId,
  });
}

export function usePatchShop(shop_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (body: Record<string, unknown>) => cat.patchShop(shop_id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }) });
}
export function useAddShopPhoto(shop_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (body: { url: string; sort_order?: number }) => cat.addShopPhoto(shop_id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }) });
}
export function useDeleteShopPhoto(shop_id: string) {
  const qc = useQueryClient(); const shopId = useShopId();
  return useMutation({ mutationFn: (photo_id: string) => cat.deleteShopPhoto(shop_id, photo_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store", shopId] }) });
}

export function useStoreCatalogCounts() {
  const shopId = useShopId();
  return useQuery<CatalogCounts>({
    queryKey: ["store", shopId, "catalog-counts"],
    queryFn: cat.listCatalogCounts,
    enabled: !!shopId,
  });
}

export function useStoreMagicHints(limit = 10) {
  const shopId = useShopId();
  return useQuery<MagicHint[]>({
    queryKey: ["store", shopId, "magic-hints", limit],
    queryFn: () => cat.listMagicHints(limit),
    enabled: !!shopId,
  });
}

export function useStoreActivity(limit = 20) {
  const shopId = useShopId();
  return useQuery<ActivityEvent[]>({
    queryKey: ["store", shopId, "activity", limit],
    queryFn: () => cat.listActivity(limit),
    enabled: !!shopId,
    refetchInterval: 30_000,
  });
}

export function useStoreScenes(limit = 20) {
  const shopId = useShopId();
  return useQuery<StoreScene[]>({
    queryKey: ["store", shopId, "scenes", limit],
    queryFn: () => cat.listStoreScenes(limit),
    enabled: !!shopId,
  });
}
