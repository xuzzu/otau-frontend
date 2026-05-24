// Type aliases + static labelling tables for the catalog UI.
//
// The backend now ships full Item objects under "@/lib/api/types"; this
// file keeps the dataset-level taxonomy labels the UI still uses for
// chip menus until those are sourced from the live /categories endpoint.

import type { Item, ItemSummary } from "./api/types";

// Card-shape used by listings.
export type Product = ItemSummary;
// Full item w/ variants, images, model_3d.
export type ItemDetail = Item;

// Procedural model keys supported by the R3F components in components/product/models/.
export type ModelKey =
  | "sofa"
  | "armchair"
  | "coffeeTable"
  | "floorLamp"
  | "diningChair"
  | "shelf"
  | "bench"
  | "console";

// The 17 subcategories that exist in the seeded dataset.
export type Category =
  | "armchair"
  | "bar_stool"
  | "bed"
  | "coffee_table"
  | "desk"
  | "dining_chair"
  | "dining_table"
  | "dresser"
  | "floor_lamp"
  | "nightstand"
  | "office_chair"
  | "shelving_unit"
  | "sofa_corner"
  | "sofa_straight"
  | "tv_console"
  | "vanity"
  | "wardrobe";

export const CATEGORY_LABELS: Record<Category, string> = {
  armchair: "Armchairs",
  bar_stool: "Bar stools",
  bed: "Beds",
  coffee_table: "Coffee tables",
  desk: "Desks",
  dining_chair: "Dining chairs",
  dining_table: "Dining tables",
  dresser: "Dressers",
  floor_lamp: "Floor lamps",
  nightstand: "Nightstands",
  office_chair: "Office chairs",
  shelving_unit: "Shelving",
  sofa_corner: "Sofas — corner",
  sofa_straight: "Sofas — straight",
  tv_console: "TV consoles",
  vanity: "Vanities",
  wardrobe: "Wardrobes",
};

// The six top-level styles in the seeded dataset (the freeform `tag_hints`
// remain available for advanced filtering later).
export type Style =
  | "scandinavian"
  | "modern"
  | "loft"
  | "classic"
  | "minimal"
  | "japandi";

export const STYLE_LABELS: Record<Style, string> = {
  scandinavian: "Scandinavian",
  modern: "Modern",
  loft: "Loft",
  classic: "Classic",
  minimal: "Minimal",
  japandi: "Japandi",
};

export type SortKey = "curated" | "price-asc" | "price-desc" | "new";

export type FilterState = {
  q?: string;
  category?: Category[];
  style?: Style[];
  seller?: string[];      // partner slugs
  room?: string[];        // Living | Bedroom | Kitchen | Workspace
  priceMax?: number;
  sort?: SortKey;
};
