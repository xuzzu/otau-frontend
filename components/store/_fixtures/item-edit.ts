export type RailItem = { l: string; n: string; done?: boolean; active?: boolean; warn?: boolean };
export const SECTIONS: RailItem[] = [
  { l: "Photos", n: "01", done: true, active: false },
  { l: "Basics", n: "02", done: true, active: true },
  { l: "Price & stock", n: "03", done: true },
  { l: "Dimensions", n: "04", done: true },
  { l: "Materials", n: "05", done: true },
  { l: "Category", n: "06", done: true },
  { l: "Studio / AR", n: "07", warn: true },
  { l: "Delivery", n: "08", done: true },
  { l: "Visibility", n: "09", done: true },
];

export const PHOTOS: string[] = [
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=70",
  "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&q=70",
  "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=70",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=70",
  "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=70",
  "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=400&q=70",
  "https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&q=70",
];

export const MATERIALS: string[] = ["Linen", "Oak", "Cotton", "Boucle", "Leather", "Velvet", "Rattan", "Wool", "Metal", "Glass", "Marble"];

export type ColorVariant = { c: string; n: string };
export const COLOR_VARIANTS: ColorVariant[] = [
  { c: "#E8DFCC", n: "Ecru" },
  { c: "#9A8A72", n: "Taupe" },
  { c: "#3F4A39", n: "Moss" },
  { c: "#B5532E", n: "Clay" },
  { c: "#1A1612", n: "Onyx" },
  { c: "#C9B79A", n: "Sand" },
];

export const TAGS: string[] = ["modular", "low-frame", "slipcover", "washable", "three-seat", "oak", "belgian-linen", "astana-made", "editorial"];

export type DeliveryRegion = { r: string; t: string; on: boolean };
export const DELIVERY_REGIONS: DeliveryRegion[] = [
  { r: "Astana · within ring", t: "Free · 2–4 days", on: true },
  { r: "Almaty", t: "₸18 000 · 5–7 days", on: true },
  { r: "Other KZ cities", t: "₸28 000 · 7–10 days", on: true },
  { r: "CIS · Russia/UZ/KG", t: "Quoted by case", on: false },
];
