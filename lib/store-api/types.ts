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

export type MagicHintKind =
  | "pricing_low"
  | "missing_description"
  | "missing_photo"
  | "publish_demanded";

export type MagicHint = {
  kind: MagicHintKind;
  item_id: string;
  short_label: string;
  body: string;
  action_label: string;
  evidence: Record<string, unknown>;
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
  magic_hint: MagicHint | null;
};

export type StoreItemImage = {
  id: string;
  url: string;
  is_main: boolean;
  role: string;
  sort_order: number;
  variant_id: string | null;
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
  images: StoreItemImage[];
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

export type LikesSummary = {
  total: number;
  last_7d: number;
  prev_7d: number;
  spark_14d: number[];
};
export type ImaginedSummary = {
  scenes_count: number;
  items_in_scenes_count: number;
  since: string;
};
export type StockSummary = {
  units: number;
  low_count: number;
  restocks_7d: number;
};
export type NextVisit = {
  date: string;
  recipient_name: string;
  items: string[];
  ordinal: number | null;
};
export type VisitsSummary = {
  pending_count: number;
  next: NextVisit | null;
};
export type TrustSummary = {
  rating: number | null;
  reviews_count: number;
};
export type DashboardData = {
  likes: LikesSummary;
  imagined: ImaginedSummary | null;
  stock: StockSummary | null;
  visits: VisitsSummary;
  trust: TrustSummary;
};

export type ActivityEventKind =
  | "item_liked" | "visit_requested" | "stock_event" | "magic_event";

export type ActivityEvent = {
  kind: ActivityEventKind;
  created_at: string;
  item_id: string | null;
  item_name: string | null;
  actor_label: string | null;
  delta: number | null;
  magic_kind: MagicHintKind | null;
};

export type StoreScene = {
  id: string;
  image_url: string | null;
  featured_item: { id: string; name: string; likes_today: number; carts_today: number } | null;
  audience_hint: string | null;
  created_at: string;
};

export type ItemBucket = "all" | "active" | "drafts" | "attention" | "promoted" | "archived";

export type CatalogCounts = {
  all: number;
  active: number;
  drafts: number;
  attention: number;
  promoted: number;
  archived: number;
};
