import type { ItemStatus, ItemTag } from "@/lib/api/types";

export type StoreInfo = {
  partner_id: string;
  shops: { id: string; slug: string; name: string; city: string; address: string }[];
  current_shop: { id: string; slug: string; name: string } | null;
};

export type StoreVariant = {
  id: string;
  sku: string;
  price: number;
  currency: string;
  is_default: boolean;
  in_stock_current_shop: number;
};

export type StoreItemSummary = {
  id: string;
  slug: string;
  name: string;
  status: ItemStatus;
  tag: ItemTag;
  main_image_url: string | null;
  default_price: number | null;
  in_stock_current_shop: number;
  has_active_promotion: boolean;
};

export type StoreItem = {
  id: string; slug: string; partner_id: string; name: string;
  description: Record<string, string>;
  category_id: string;
  room_target_id: string | null;
  dims: Record<string, unknown>;
  weight_kg: number | null;
  tag: ItemTag;
  status: ItemStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  style_ids: string[];
  material_ids: string[];
  color_ids: string[];
  main_image_url: string | null;
  variants: StoreVariant[];
};

export type PromotionScope = "item" | "variant";
export type PromotionDiscountKind = "percent" | "absolute";

export type Promotion = {
  id: string; partner_id: string; shop_id: string;
  scope: PromotionScope;
  item_id: string;
  variant_id: string | null;
  discount_kind: PromotionDiscountKind;
  discount_value: number;
  starts_at: string;
  ends_at: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  status_bucket: "active" | "scheduled" | "ended";
};

export type DashboardData = {
  likes: { total: number; last_7d: number; prev_7d: number };
  visits: { pending_count: number; next: { date: string; recipient_name: string } | null };
};
