import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { SceneViewport } from "./SceneViewport";
import type { GenerationRoom } from "@/lib/api/types";
import type { HotspotRow } from "@/lib/studio/joinHotspots";

function makeRoom(overrides: Partial<GenerationRoom> = {}): GenerationRoom {
  return {
    id: "r1",
    generation_id: "g1",
    room_type: "Living",
    status: "done",
    concept: {},
    selected_item_ids: [],
    selected_variant_ids: [],
    alternates: {},
    prompt_text: "",
    image_url: "/storage/scenes/g1/living/scene.png",
    image_url_2: null,
    thumbnail_url: null,
    camera_pose: {},
    retry_count: 0,
    error: null,
    hotspots: [],
    hotspots_2: [],
    hotspot_error: null,
    hotspot_error_2: null,
    image_width: null,
    image_height: null,
    image_width_2: null,
    image_height_2: null,
    started_at: null,
    completed_at: null,
    created_at: "2026-05-25T00:00:00Z",
    updated_at: "2026-05-25T00:00:00Z",
    ...overrides,
  };
}

function row(id: string, n: number, x = 0.5, y = 0.5): HotspotRow {
  return {
    n,
    item: {
      id,
      slug: id,
      partner_id: "p",
      name: `Item ${id}`,
      category_id: "c",
      room_target_id: null,
      tag: "none",
      status: "active",
      main_image_url: null,
      default_price: null,
      currency: "KZT",
    },
    hotspot: {
      item_id: id,
      label: `L ${id}`,
      point: { x, y },
      bbox: { x1: 0, y1: 0, x2: 1, y2: 1 },
      confidence: 0.9,
    },
  };
}

describe("SceneViewport", () => {
  test("aspectRatio defaults to 3 / 2 when dims missing", () => {
    const { container } = render(
      <SceneViewport
        genRoom={makeRoom()}
        rows={[]}
        activeId={null}
        onActivate={() => {}}
        onHoverEnter={() => {}}
        onHoverLeave={() => {}}
      />,
    );
    const box = container.querySelector('[data-testid="scene-box"]') as HTMLElement;
    expect(box.style.aspectRatio).toBe("3 / 2");
  });

  test("aspectRatio derives from image dims when present", () => {
    const { container } = render(
      <SceneViewport
        genRoom={makeRoom({ image_width: 1024, image_height: 1024 })}
        rows={[]}
        activeId={null}
        onActivate={() => {}}
        onHoverEnter={() => {}}
        onHoverLeave={() => {}}
      />,
    );
    const box = container.querySelector('[data-testid="scene-box"]') as HTMLElement;
    expect(box.style.aspectRatio).toBe("1024 / 1024");
  });

  test("renders one Hotspot button per row with hotspot", () => {
    const { getAllByRole } = render(
      <SceneViewport
        genRoom={makeRoom({ image_width: 600, image_height: 400 })}
        rows={[row("a", 1, 0.1, 0.2), row("b", 2, 0.7, 0.8)]}
        activeId={null}
        onActivate={() => {}}
        onHoverEnter={() => {}}
        onHoverLeave={() => {}}
      />,
    );
    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  test("rows without hotspot are skipped", () => {
    const r = row("a", 1);
    r.hotspot = null;
    const { queryAllByRole } = render(
      <SceneViewport
        genRoom={makeRoom({ image_width: 600, image_height: 400 })}
        rows={[r]}
        activeId={null}
        onActivate={() => {}}
        onHoverEnter={() => {}}
        onHoverLeave={() => {}}
      />,
    );
    expect(queryAllByRole("button")).toHaveLength(0);
  });
});
