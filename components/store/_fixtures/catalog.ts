export type CatalogStatus = "live" | "low" | "oos" | "draft";

export type CatalogRow = {
  id: string;
  img: string;
  sel?: boolean;
  name: string;
  sku: string;
  cat: string;
  dims: string;
  status: CatalogStatus;
  stock: number | string;
  price: string;
  views: number;
  sold: number;
  edit: string;
  highlight?: string;
};

export const ROWS: CatalogRow[] = [
  { id: "3127", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=70", sel: true, name: "Klemo modular sofa, 3‑seat", sku: "OT‑3127", cat: "Sofas · Modular", dims: "220 × 92 × 78", status: "live", stock: 5, price: "685 000", views: 1240, sold: 14, edit: "2h" },
  { id: "3401", img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=200&q=70", sel: true, name: "Aigerim sectional, left chaise", sku: "OT‑3401", cat: "Sofas · Sectional", dims: "280 × 168 × 82", status: "oos", stock: 0, price: "912 000", views: 892, sold: 6, edit: "1d" },
  { id: "2891", img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200&q=70", name: "Linen armchair, ecru", sku: "OT‑2891", cat: "Chairs · Lounge", dims: "78 × 84 × 88", status: "low", stock: 2, price: "312 000", views: 486, sold: 11, edit: "3d" },
  { id: "3580", img: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=200&q=70", name: "Otaū × Mebel house sofa", sku: "OT‑3580", cat: "Sofas · House edition", dims: "240 × 92 × 76", status: "draft", stock: "—", price: "—", views: 0, sold: 0, edit: "8h", highlight: "draft" },
  { id: "3221", img: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=200&q=70", name: "Talqan boucle loveseat", sku: "OT‑3221", cat: "Sofas · Loveseat", dims: "158 × 86 × 80", status: "live", stock: 8, price: "485 000", views: 712, sold: 9, edit: "5d" },
  { id: "3104", img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&q=70", name: "Steppe lounge, slipcovered", sku: "OT‑3104", cat: "Sofas · Lounge", dims: "210 × 96 × 74", status: "live", stock: 4, price: "598 000", views: 540, sold: 7, edit: "1w" },
  { id: "2740", img: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&q=70", name: "Aralia rattan chair", sku: "OT‑2740", cat: "Chairs · Accent", dims: "62 × 78 × 84", status: "live", stock: 12, price: "148 000", views: 388, sold: 18, edit: "1w" },
  { id: "2992", img: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=200&q=70", name: "Studio leather armchair", sku: "OT‑2992", cat: "Chairs · Lounge", dims: "82 × 88 × 90", status: "live", stock: 3, price: "620 000", views: 264, sold: 4, edit: "2w" },
  { id: "2615", img: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=200&q=70", name: "Aitas reading chair, walnut", sku: "OT‑2615", cat: "Chairs · Accent", dims: "70 × 80 × 96", status: "live", stock: 6, price: "276 000", views: 198, sold: 5, edit: "3w" },
];

export type QuickView = { label: string; count: number; tone?: string };
export const QUICK_VIEWS: QuickView[] = [
  { label: "All listings", count: 218 },
  { label: "Live", count: 209, tone: "#3F4A39" },
  { label: "Drafts", count: 4, tone: "#9A8A72" },
  { label: "Low stock", count: 2, tone: "#D8A05B" },
  { label: "Out of stock", count: 1, tone: "#B5532E" },
  { label: "Hidden", count: 2, tone: "#9A8A72" },
  { label: "Needs photos", count: 5, tone: "#B5532E" },
];

export type FilterItem = { label: string; count?: number; on?: boolean };
export const CATEGORY_FILTERS: FilterItem[] = [
  { label: "Sofas", count: 142, on: true },
  { label: "Chairs", count: 38 },
  { label: "Tables", count: 22 },
  { label: "Storage", count: 12 },
  { label: "Lighting", count: 4 },
];
export const MATERIAL_FILTERS: FilterItem[] = [
  { label: "Linen", count: 61, on: true },
  { label: "Oak", count: 44, on: true },
  { label: "Boucle", count: 27 },
  { label: "Leather", count: 19 },
  { label: "+ 6 more" },
];
