import { describe, expect, test } from "vitest";
import { joinHotspotsToItems } from "./joinHotspots";
import type { Hotspot, ItemSummary } from "@/lib/api/types";

function makeItem(id: string, partial: Partial<ItemSummary> = {}): ItemSummary {
  return {
    id,
    slug: id,
    partner_id: "p1",
    name: `Item ${id}`,
    category_id: "c1",
    room_target_id: null,
    tag: "none",
    status: "active",
    main_image_url: null,
    default_price: null,
    currency: "KZT",
    ...partial,
  };
}

function makeHotspot(item_id: string, x: number, y: number): Hotspot {
  return {
    item_id,
    label: `Label ${item_id}`,
    point: { x, y },
    bbox: { x1: x - 0.05, y1: y - 0.05, x2: x + 0.05, y2: y + 0.05 },
    confidence: 0.9,
  };
}

describe("joinHotspotsToItems", () => {
  test("empty inputs -> empty output", () => {
    expect(joinHotspotsToItems([], [], new Set())).toEqual([]);
  });

  test("1:1 join with sequential numbering", () => {
    const items = [makeItem("a"), makeItem("b"), makeItem("c")];
    const hotspots = [
      makeHotspot("a", 0.1, 0.2),
      makeHotspot("b", 0.5, 0.5),
      makeHotspot("c", 0.9, 0.8),
    ];
    const rows = joinHotspotsToItems(items, hotspots, new Set());
    expect(rows.map((r) => r.n)).toEqual([1, 2, 3]);
    expect(rows[0].hotspot?.point.x).toBe(0.1);
    expect(rows[2].hotspot?.label).toBe("Label c");
  });

  test("hidden item drops its hotspot and renumbers", () => {
    const items = [makeItem("a"), makeItem("b"), makeItem("c")];
    const hotspots = [
      makeHotspot("a", 0, 0),
      makeHotspot("b", 0, 0),
      makeHotspot("c", 0, 0),
    ];
    const rows = joinHotspotsToItems(items, hotspots, new Set(["b"]));
    expect(rows.map((r) => r.item.id)).toEqual(["a", "c"]);
    expect(rows.map((r) => r.n)).toEqual([1, 2]);
  });

  test("hotspot for unknown item_id is dropped", () => {
    const items = [makeItem("a")];
    const hotspots = [makeHotspot("ghost", 0, 0), makeHotspot("a", 0, 0)];
    const rows = joinHotspotsToItems(items, hotspots, new Set());
    expect(rows).toHaveLength(1);
    expect(rows[0].hotspot?.item_id).toBe("a");
  });

  test("duplicate hotspot ids -> first wins", () => {
    const items = [makeItem("a")];
    const hotspots = [makeHotspot("a", 0.1, 0.1), makeHotspot("a", 0.9, 0.9)];
    const rows = joinHotspotsToItems(items, hotspots, new Set());
    expect(rows[0].hotspot?.point.x).toBe(0.1);
  });

  test("item without matching hotspot still appears with hotspot=null", () => {
    const items = [makeItem("a"), makeItem("b")];
    const hotspots = [makeHotspot("b", 0.5, 0.5)];
    const rows = joinHotspotsToItems(items, hotspots, new Set());
    expect(rows.map((r) => r.item.id)).toEqual(["a", "b"]);
    expect(rows[0].hotspot).toBeNull();
    expect(rows[1].hotspot?.item_id).toBe("b");
  });
});
