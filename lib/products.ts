// Type aliases + procedural-model keys used by the catalog UI.
//
// Categories and Styles are now sourced from the live /categories and
// /styles taxonomy endpoints, not from a closed enum here. The previous
// closed unions (with snake-case keys) drove a slug mismatch bug
// against the backend's hyphenated slugs.

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

// Curated styles the frontend chooses to expose in the filter UI.
// All other style rows in the catalog DB are tag-hints from the old
// migration and stay hidden until the data is cleaned up.
export const CURATED_STYLE_SLUGS = [
  "scandinavian",
  "modern",
  "loft",
  "classic",
  "minimal",
  "japandi",
] as const;
export type CuratedStyleSlug = (typeof CURATED_STYLE_SLUGS)[number];
// Back-compat alias for the design wizard, which only ever uses curated styles.
export type Style = CuratedStyleSlug;

export const CURATED_STYLE_LABELS: Record<CuratedStyleSlug, string> = {
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
  category?: string[];
  style?: string[];
  seller?: string[];
  room?: string[];
  priceMax?: number;
  sort?: SortKey;
};

// Title-cases a backend slug like "coffee-table" or "coffee_table" into
// "Coffee Table" for chip labels until the DB ships nice display names.
export function prettyTaxonomyLabel(rawName: string, slug: string): string {
  const candidate = rawName || slug;
  return candidate
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
