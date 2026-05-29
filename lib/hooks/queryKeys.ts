import type { ListItemsParams } from "@/lib/api/catalog";

export const qk = {
  taxonomy: ["taxonomy"] as const,
  items: (params: ListItemsParams = {}) => ["items", params] as const,
  item: (id: string) => ["item", id] as const,
  itemBySlug: (slug: string) => ["item-by-slug", slug] as const,
  partners: () => ["partners"] as const,
  partner: (id: string) => ["partner", id] as const,
  partnerBySlug: (slug: string) => ["partner-by-slug", slug] as const,
  partnerShopsBySlug: (slug: string) => ["partner-shops-by-slug", slug] as const,
  shops: () => ["shops"] as const,
  shopBySlug: (slug: string) => ["shop-by-slug", slug] as const,
  shopItemsBySlug: (slug: string) => ["shop-items-by-slug", slug] as const,
  apartmentComplexes: () => ["apartment-complexes"] as const,
  apartmentComplexBySlug: (slug: string) =>
    ["apartment-complex-by-slug", slug] as const,
  apartmentPlansBySlug: (slug: string) =>
    ["apartment-plans-by-slug", slug] as const,
  generation: (id: string) => ["generation", id] as const,
  generationRoomItemsByType: (genId: string, roomType: string) =>
    ["generation-room-items", genId, roomType] as const,
  roomScenes: (genId: string, roomId: string) =>
    ["room-scenes", genId, roomId] as const,
  me: ["me"] as const,
  cart: ["cart"] as const,
  myLikes: ["my-likes"] as const,
  journal: (params: Record<string, unknown> = {}) => ["journal", params] as const,
  journalArticle: (slug: string) => ["journal-article", slug] as const,
} as const;
