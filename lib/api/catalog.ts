import { BASES } from "./env";
import { apiFetch } from "./http";
import type {
  ApartmentComplex,
  ApartmentPlan,
  Category,
  Color,
  Item,
  ItemStatus,
  ItemSummary,
  Material,
  Partner,
  RoomType,
  Shop,
  Style,
} from "./types";

const B = BASES.catalog;

function qs(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) {
      for (const item of v) sp.append(k, String(item));
    } else {
      sp.set(k, String(v));
    }
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// --- Items ---

export type ListItemsParams = {
  id?: string[];
  partner_id?: string;
  shop_id?: string;
  category_id?: string;
  room_target_id?: string;
  tag?: string;
  status?: ItemStatus;
  style_id?: string;
  q?: string;
  price_max?: number;
  sort?: "curated" | "price-asc" | "price-desc" | "new";
  limit?: number;
  offset?: number;
};

export const listItems = (params: ListItemsParams = {}) =>
  apiFetch<ItemSummary[]>(B, `/items${qs(params as Record<string, unknown>)}`);

export const getItem = (item_id: string) =>
  apiFetch<Item>(B, `/items/${encodeURIComponent(item_id)}`);

export const getItemBySlug = (slug: string, opts?: { preview?: boolean }) =>
  apiFetch<Item>(B, `/items/by-slug/${encodeURIComponent(slug)}${opts?.preview ? "?preview=1" : ""}`);

// --- Partners + shops ---

export const listPartners = (params?: { status?: string }) =>
  apiFetch<Partner[]>(B, `/partners${qs(params)}`);

export const getPartner = (id: string) =>
  apiFetch<Partner>(B, `/partners/${encodeURIComponent(id)}`);

export const getPartnerBySlug = (slug: string) =>
  apiFetch<Partner>(B, `/partners/by-slug/${encodeURIComponent(slug)}`);

export const listPartnerShops = (partner_id: string) =>
  apiFetch<Shop[]>(B, `/partners/${encodeURIComponent(partner_id)}/shops`);

export const listPartnerShopsBySlug = (slug: string) =>
  apiFetch<Shop[]>(B, `/partners/by-slug/${encodeURIComponent(slug)}/shops`);

export const listShops = (params?: { city?: string }) =>
  apiFetch<Shop[]>(B, `/shops${qs(params)}`);

export const getShop = (id: string) =>
  apiFetch<Shop>(B, `/shops/${encodeURIComponent(id)}`);

export const getShopBySlug = (slug: string) =>
  apiFetch<Shop>(B, `/shops/by-slug/${encodeURIComponent(slug)}`);

export const listShopItems = (shop_id: string) =>
  apiFetch<ItemSummary[]>(B, `/shops/${encodeURIComponent(shop_id)}/items`);

export const listShopItemsBySlug = (slug: string) =>
  apiFetch<ItemSummary[]>(B, `/shops/by-slug/${encodeURIComponent(slug)}/items`);

// --- Apartments ---

export const listApartmentComplexes = (params?: { city?: string }) =>
  apiFetch<ApartmentComplex[]>(B, `/apartment-complexes${qs(params)}`);

export const getApartmentComplex = (id: string) =>
  apiFetch<ApartmentComplex>(B, `/apartment-complexes/${encodeURIComponent(id)}`);

export const getApartmentComplexBySlug = (slug: string) =>
  apiFetch<ApartmentComplex>(
    B,
    `/apartment-complexes/by-slug/${encodeURIComponent(slug)}`,
  );

export const listApartmentPlans = (complex_id: string) =>
  apiFetch<ApartmentPlan[]>(
    B,
    `/apartment-complexes/${encodeURIComponent(complex_id)}/plans`,
  );

export const listApartmentPlansBySlug = (slug: string) =>
  apiFetch<ApartmentPlan[]>(
    B,
    `/apartment-complexes/by-slug/${encodeURIComponent(slug)}/plans`,
  );

export const getApartmentPlan = (plan_id: string) =>
  apiFetch<ApartmentPlan>(B, `/apartment-plans/${encodeURIComponent(plan_id)}`);

// --- Taxonomy ---

export const listCategories = () => apiFetch<Category[]>(B, `/categories`);
export const listColors = () => apiFetch<Color[]>(B, `/colors`);
export const listMaterials = () => apiFetch<Material[]>(B, `/materials`);
export const listStyles = () => apiFetch<Style[]>(B, `/styles`);
export const listRoomTypes = () => apiFetch<RoomType[]>(B, `/room-types`);

export type Taxonomy = {
  categories: Category[];
  colors: Color[];
  materials: Material[];
  styles: Style[];
  roomTypes: RoomType[];
};

export async function listAllTaxonomy(): Promise<Taxonomy> {
  const [categories, colors, materials, styles, roomTypes] = await Promise.all([
    listCategories(),
    listColors(),
    listMaterials(),
    listStyles(),
    listRoomTypes(),
  ]);
  return { categories, colors, materials, styles, roomTypes };
}
