export type I18nText = Record<string, string>;

// --- Catalog: taxonomy ---

export type Category = {
  id: string;
  slug: string;
  name: I18nText;
};
export type Color = { id: string; slug: string; name: I18nText; hex: string };
export type Material = { id: string; slug: string; name: I18nText };
export type Style = { id: string; slug: string; name: I18nText };
export type RoomType = { id: string; slug: string; name: I18nText };

// --- Catalog: partners + shops ---

export type Partner = {
  id: string;
  slug: string;
  name: string;
  tagline: I18nText;
  story: I18nText;
  founded_year: number | null;
  hero_photo_url: string | null;
  detail_photo_url: string | null;
  website_url: string | null;
  instagram_handle: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ShopPhoto = {
  id: string;
  shop_id: string;
  url: string;
  caption: I18nText;
  sort_order: number;
};

export type Shop = {
  id: string;
  partner_id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  working_hours: Record<string, unknown>;
  founded_year: number | null;
  hero_photo_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  photos: ShopPhoto[];
};

// --- Catalog: items ---

export type ItemVariant = {
  id: string;
  item_id: string;
  sku: string;
  color_id: string | null;
  material_id: string | null;
  size_label: string | null;
  price: number;
  currency: string;
  in_stock: number;
  is_default: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ItemImage = {
  id: string;
  item_id: string;
  variant_id: string | null;
  url: string;
  role: string;
  is_main: boolean;
  sort_order: number;
};

export type Item3DModel = {
  id: string;
  item_id: string;
  variant_id: string | null;
  format: string;
  asset_url: string | null;
  procedural_params: Record<string, unknown>;
  file_size_bytes: number | null;
  source: string;
  created_at: string;
};

export type ItemTag =
  | "editor_pick"
  | "new"
  | "low_stock"
  | "house_edition"
  | "sale"
  | "none";

export type ItemStatus = "draft" | "active" | "archived";

export type ItemSummary = {
  id: string;
  slug: string;
  partner_id: string;
  name: string;
  category_id: string;
  room_target_id: string | null;
  tag: ItemTag;
  status: ItemStatus;
  main_image_url: string | null;
  default_price: number | null;
  currency: string;
};

export type Item = {
  id: string;
  slug: string;
  partner_id: string;
  name: string;
  description: I18nText;
  category_id: string;
  room_target_id: string | null;
  segmentation_prompt: string;
  dims: Record<string, unknown>;
  weight_kg: number | null;
  min_lead_time_days: number | null;
  tag: ItemTag;
  status: ItemStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  variants: ItemVariant[];
  images: ItemImage[];
  model_3d: Item3DModel | null;
  style_ids: string[];
  material_ids: string[];
  color_ids: string[];
};

// --- Catalog: apartments ---

export type ApartmentComplex = {
  id: string;
  slug: string;
  name: string;
  city: string;
  developer: string | null;
  hero_image_url: string | null;
  description: I18nText;
  lat: number | null;
  lng: number | null;
  created_at: string;
  updated_at: string;
};

export type ApartmentPlanRoom = { name: string; area_sqm: number } & Record<
  string,
  unknown
>;

export type ApartmentPlan = {
  id: string;
  complex_id: string;
  name: string;
  floor: number | null;
  unit_id: string | null;
  area_sqm: number;
  bedroom_count: number;
  floor_plan_image_url: string | null;
  rooms: ApartmentPlanRoom[];
  created_at: string;
  updated_at: string;
};

// --- Generation ---

export type GenerationScope = "room" | "apartment";
export type GenerationStatus =
  | "queued"
  | "running"
  | "done"
  | "failed"
  | "cancelled";
export type RoomStatus =
  | "queued"
  | "concepting"
  | "retrieving"
  | "rendering"
  | "hotspotting"
  | "done"
  | "failed";

export type HotspotPoint = { x: number; y: number };

export type HotspotBbox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type Hotspot = {
  item_id: string;
  label: string;
  point: HotspotPoint;
  bbox: HotspotBbox;
  confidence: number | null;
};

export type GenerationRoom = {
  id: string;
  generation_id: string;
  room_type: string;
  status: RoomStatus;
  concept: Record<string, unknown>;
  selected_item_ids: string[];
  selected_variant_ids: string[];
  prompt_text: string;
  image_url: string | null;
  thumbnail_url: string | null;
  camera_pose: Record<string, unknown>;
  retry_count: number;
  error: string | null;
  hotspots: Hotspot[];
  hotspot_error: string | null;
  image_width: number | null;
  image_height: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Generation = {
  id: string;
  user_id: string;
  apartment_plan_id: string | null;
  scope: GenerationScope;
  room_type: string | null;
  style_slugs: string[];
  budget: number;
  budget_per_room: Record<string, number>;
  prompt_text: string;
  mode: string;
  model_provider: string;
  model_version: string;
  status: GenerationStatus;
  error_summary: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  rooms: GenerationRoom[];
};

export type CreateGenerationBody = {
  scope: GenerationScope;
  room_type?: string | null;
  style_slugs?: string[];
  budget: number;
  apartment_plan_id?: string | null;
  prompt_text?: string;
};

// --- Core (subset used by frontend) ---

export type UserType = "guest" | "client" | "internal";
export type UserStatus = "anonymous" | "active" | "suspended" | "deleted";

export type User = {
  id: string;
  type: UserType;
  status: UserStatus;
  phone: string | null;
  email: string | null;
  display_name: string | null;
  locale: string;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CredentialKind = "email_otp" | "sms_otp";

export type SessionUpgradeBody = {
  kind: CredentialKind;
  identifier: string;
};

export type SessionVerifyBody = SessionUpgradeBody & {
  code: string;
};

export type OtpStartedOut = {
  sent_to: string;
  dev_code: string | null;
};

export type CartItem = {
  id: string;
  variant_id: string;
  item_id: string;
  shop_id: string;
  quantity: number;
  price_snapshot: number;
  currency_snapshot: string;
  added_at: string;
};

export type Cart = {
  id: string;
  user_id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
};

export type Like = {
  id: string;
  user_id: string;
  target_kind: "item" | "variant" | "partner" | "shop" | "scene";
  target_id: string;
  created_at: string;
};

export type ShowroomVisitRequest = {
  id: string;
  user_id: string;
  shop_id: string;
  preferred_date: string | null;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type JournalArticle = {
  id: string;
  slug: string;
  category: string;
  title: I18nText;
  lede: I18nText;
  body: I18nText;
  hero_photo_url: string | null;
  read_minutes: number;
  author_name: string;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};
