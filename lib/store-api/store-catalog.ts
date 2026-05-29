import { BASES } from "@/lib/api/env";
import { apiFetch } from "@/lib/api/http";
import { getCurrentUserId } from "@/lib/api/identity";
import { getCurrentShopId } from "@/lib/shop-id";
import type {
  StoreInfo, StoreItem, StoreItemSummary, Promotion,
  StoreVariant, PromotionScope, PromotionDiscountKind,
} from "./types";

const B = BASES.catalog;

export const getStoreInfo = () => apiFetch<StoreInfo>(B, `/me/store/info`);

export type ListStoreItemsParams = {
  status?: string;
  q?: string;
  tag?: string;
  bucket?: import("./types").ItemBucket;
  all?: 0 | 1;
  limit?: number;
  offset?: number;
};
function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const listStoreItems = (p: ListStoreItemsParams = {}) =>
  apiFetch<StoreItemSummary[]>(B, `/me/store/items${qs(p)}`);

export const getStoreItem = (id: string) =>
  apiFetch<StoreItem>(B, `/me/store/items/${encodeURIComponent(id)}`);

export type StoreItemInput = {
  slug: string; name: string;
  brand?: string | null;
  description?: Record<string, string>;
  category_id: string;
  room_target_id?: string;
  dims?: Record<string, unknown>;
  weight_kg?: number;
  style_ids?: string[]; material_ids?: string[]; color_ids?: string[];
  finish_material_ids?: string[];
  default_variant_sku?: string; default_variant_price?: number;
};
export const createStoreItem = (body: StoreItemInput) =>
  apiFetch<StoreItem>(B, `/me/store/items`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const patchStoreItem = (id: string, body: Partial<StoreItemInput>) =>
  apiFetch<StoreItem>(B, `/me/store/items/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const archiveStoreItem = (id: string) =>
  apiFetch<StoreItem>(B, `/me/store/items/${encodeURIComponent(id)}/archive`, { method: "POST" });
export const restoreStoreItem = (id: string) =>
  apiFetch<StoreItem>(B, `/me/store/items/${encodeURIComponent(id)}/restore`, { method: "POST" });
export const deleteStoreItem = (id: string) =>
  apiFetch<null>(B, `/me/store/items/${encodeURIComponent(id)}`, { method: "DELETE" });
export const removeAvailability = (id: string) =>
  apiFetch<null>(B, `/me/store/items/${encodeURIComponent(id)}/availability`, { method: "DELETE" });

// Variants
export type VariantInput = {
  sku: string; price: number; currency?: string;
  color_id?: string; material_id?: string; size_label?: string;
  in_stock?: number; is_default?: boolean;
};
export const addVariant = (item_id: string, body: VariantInput) =>
  apiFetch<StoreVariant>(B, `/me/store/items/${encodeURIComponent(item_id)}/variants`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const patchVariant = (item_id: string, vid: string, body: Partial<VariantInput>) =>
  apiFetch<StoreVariant>(B, `/me/store/items/${encodeURIComponent(item_id)}/variants/${encodeURIComponent(vid)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const deleteVariant = (item_id: string, vid: string) =>
  apiFetch<null>(B, `/me/store/items/${encodeURIComponent(item_id)}/variants/${encodeURIComponent(vid)}`, { method: "DELETE" });

// Image upload (multipart — cannot use apiFetch which doesn't set Content-Type for JSON blobs)
export type UploadImageOpts = { variant_id?: string; is_main?: boolean; role?: string };
export async function uploadItemImage(
  item_id: string,
  file: File,
  opts: UploadImageOpts = {},
): Promise<import("./types").StoreItemImage> {
  const fd = new FormData();
  fd.append("file", file);
  if (opts.variant_id !== undefined) fd.append("variant_id", opts.variant_id);
  if (opts.is_main !== undefined) fd.append("is_main", String(opts.is_main));
  if (opts.role !== undefined) fd.append("role", opts.role);

  const path = `/me/store/items/${encodeURIComponent(item_id)}/images/upload`;
  const headers = new Headers({ Accept: "application/json" });
  const uid = getCurrentUserId();
  if (uid) headers.set("X-User-Id", uid);
  const sid = getCurrentShopId();
  if (sid) headers.set("X-Shop-Id", sid);
  // Do NOT set Content-Type — browser sets multipart/form-data with boundary.

  const res = await fetch(`${B}${path}`, { method: "POST", headers, credentials: "include", body: fd });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    const { ApiError } = await import("@/lib/api/http");
    throw new ApiError(res.status, path, body);
  }
  return res.json() as Promise<import("./types").StoreItemImage>;
}

// Images
export type ImageInput = { url: string; role?: string; is_main?: boolean; sort_order?: number; variant_id?: string };
export const addImage = (item_id: string, body: ImageInput) =>
  apiFetch(B, `/me/store/items/${encodeURIComponent(item_id)}/images`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const patchImage = (item_id: string, img_id: string, body: Partial<ImageInput>) =>
  apiFetch(B, `/me/store/items/${encodeURIComponent(item_id)}/images/${encodeURIComponent(img_id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const deleteImage = (item_id: string, img_id: string) =>
  apiFetch<null>(B, `/me/store/items/${encodeURIComponent(item_id)}/images/${encodeURIComponent(img_id)}`, { method: "DELETE" });

// Stock
export const setStock = (vid: string, in_stock: number) =>
  apiFetch(B, `/me/store/variants/${encodeURIComponent(vid)}/stock`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ in_stock }),
  });
export const restockEvent = (vid: string, delta: number, reason: "restock" | "correction", note?: string) =>
  apiFetch(B, `/me/store/variants/${encodeURIComponent(vid)}/stock-events`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ delta, reason, note }),
  });
export const listStockEvents = (vid: string, limit = 50) =>
  apiFetch(B, `/me/store/variants/${encodeURIComponent(vid)}/stock-events?limit=${limit}`);

// Promotions
export type PromotionInput = {
  scope: PromotionScope; item_id: string; variant_id?: string;
  discount_kind: PromotionDiscountKind; discount_value: number;
  starts_at?: string; ends_at?: string | null; note?: string;
};
export const listPromotions = (status: "active" | "scheduled" | "ended" | "all" = "all") =>
  apiFetch<Promotion[]>(B, `/me/store/promotions?status=${status}`);
export const createPromotion = (body: PromotionInput) =>
  apiFetch<Promotion>(B, `/me/store/promotions`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const patchPromotion = (id: string, body: Partial<PromotionInput>) =>
  apiFetch<Promotion>(B, `/me/store/promotions/${encodeURIComponent(id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const endPromotion = (id: string) =>
  apiFetch<null>(B, `/me/store/promotions/${encodeURIComponent(id)}`, { method: "DELETE" });

// Shop edit
export const patchShop = (shop_id: string, body: Record<string, unknown>) =>
  apiFetch(B, `/me/store/shops/${encodeURIComponent(shop_id)}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const addShopPhoto = (shop_id: string, body: { url: string; sort_order?: number }) =>
  apiFetch(B, `/me/store/shops/${encodeURIComponent(shop_id)}/photos`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
export const deleteShopPhoto = (shop_id: string, photo_id: string) =>
  apiFetch<null>(B, `/me/store/shops/${encodeURIComponent(shop_id)}/photos/${encodeURIComponent(photo_id)}`, { method: "DELETE" });

export const publishItem = (id: string) =>
  apiFetch<StoreItem>(B, `/me/store/items/${encodeURIComponent(id)}/publish`, { method: "POST" });
export const unpublishItem = (id: string) =>
  apiFetch<StoreItem>(B, `/me/store/items/${encodeURIComponent(id)}/unpublish`, { method: "POST" });

import type {
  ActivityEvent, CatalogCounts, MagicHint, StoreScene,
} from "./types";

export const listCatalogCounts = () =>
  apiFetch<CatalogCounts>(B, `/me/store/catalog/counts`);

export const listMagicHints = (limit = 10) =>
  apiFetch<MagicHint[]>(B, `/me/store/magic-hints?limit=${limit}`);

export const listActivity = (limit = 20) =>
  apiFetch<ActivityEvent[]>(B, `/me/store/activity?limit=${limit}`);

export const listStoreScenes = (limit = 20) =>
  apiFetch<StoreScene[]>(B, `/me/store/scenes?limit=${limit}`);

export type PublishError = { missing: string[] };
