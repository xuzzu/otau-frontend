import type { Hotspot, ItemSummary } from "@/lib/api/types";

export type HotspotRow = {
  item: ItemSummary;
  hotspot: Hotspot | null;
  n: number;
};

export function joinHotspotsToItems(
  items: ItemSummary[],
  hotspots: Hotspot[],
  hiddenIds: Set<string>,
): HotspotRow[] {
  const byItemId = new Map<string, Hotspot>();
  for (const h of hotspots) {
    if (!byItemId.has(h.item_id)) byItemId.set(h.item_id, h);
  }
  const rows: HotspotRow[] = [];
  let n = 0;
  for (const item of items) {
    if (hiddenIds.has(item.id)) continue;
    n += 1;
    rows.push({ item, hotspot: byItemId.get(item.id) ?? null, n });
  }
  return rows;
}
