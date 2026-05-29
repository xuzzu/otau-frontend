import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ReplaceItemPopover from "./ReplaceItemPopover";
import * as gen from "@/lib/api/generation";
import type { AlternatesResponse, RoomScenesResponse } from "@/lib/api/types";

function rect(): DOMRect {
  return {
    left: 100,
    top: 100,
    right: 200,
    bottom: 200,
    width: 100,
    height: 100,
    x: 100,
    y: 100,
    toJSON: () => ({}),
  } as DOMRect;
}

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function wrap(ui: React.ReactNode, qc: QueryClient) {
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

const NO_SCENES: RoomScenesResponse = { scenes: [], items: {} };

function renderPopover(
  props: Partial<React.ComponentProps<typeof ReplaceItemPopover>> = {},
) {
  return render(
    wrap(
      <ReplaceItemPopover
        genId="g1"
        roomId="r1"
        originalItemId="orig_1"
        selectedItemIds={["orig_1", "B"]}
        anchorRect={rect()}
        onClose={() => {}}
        onSelected={() => {}}
        {...props}
      />,
      makeQC(),
    ),
  );
}

describe("ReplaceItemPopover", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(gen, "getRoomScenes").mockResolvedValue(NO_SCENES);
  });

  test("renders alternates from the API for the clicked item", async () => {
    const resp: AlternatesResponse = {
      by_item: {
        orig_1: [
          { id: "a1", name: "Cream Sofa", default_price: 1000, main_image_url: "/storage/items/a1.png", category_id: "sofas" },
          { id: "a2", name: "Linen Loveseat", default_price: 850, main_image_url: null, category_id: "sofas" },
        ],
      },
    };
    vi.spyOn(gen, "getAlternates").mockResolvedValue(resp);

    renderPopover();

    expect(await screen.findByText("Cream Sofa")).toBeInTheDocument();
    expect(screen.getByText("Linen Loveseat")).toBeInTheDocument();
  });

  test("clicking an alternate fires onSelected with its id", async () => {
    vi.spyOn(gen, "getAlternates").mockResolvedValue({
      by_item: {
        orig_1: [
          { id: "a1", name: "Cream Sofa", default_price: 1000, main_image_url: null, category_id: "sofas" },
        ],
      },
    });
    const onSelected = vi.fn();

    renderPopover({ onSelected });

    const card = await screen.findByRole("button", { name: /Cream Sofa/i });
    fireEvent.click(card);
    expect(onSelected).toHaveBeenCalledWith("a1");
  });

  test("renders an empty-state message when there are no alternates", async () => {
    vi.spyOn(gen, "getAlternates").mockResolvedValue({ by_item: {} });

    renderPopover();

    // Default lang is "kz" — studio.replace.empty resolves to the Kazakh string.
    expect(await screen.findByText("Балама нұсқа жоқ")).toBeInTheDocument();
  });

  test("marks a previously-rendered swap as instant under the 'used' section", async () => {
    vi.spyOn(gen, "getAlternates").mockResolvedValue({
      by_item: {
        orig_1: [
          { id: "a1", name: "Cream Sofa", default_price: 1000, main_image_url: null, category_id: "sofas" },
          { id: "a2", name: "Linen Loveseat", default_price: 850, main_image_url: null, category_id: "sofas" },
        ],
      },
    });
    // A scene where the slot held "a1" alongside the unchanged "B" => swapping
    // orig_1 -> a1 is an instant cache hit.
    vi.spyOn(gen, "getRoomScenes").mockResolvedValue({
      scenes: [
        { items_signature: "sig", selected_item_ids: ["a1", "B"], image_url: "/x.png", replaced_item_id: "orig_1", inserted_item_id: "a1", created_at: "2026-01-01" },
      ],
      items: {
        a1: { id: "a1", name: "Cream Sofa", default_price: 1000, main_image_url: null, category_id: "sofas" },
      },
    });

    renderPopover();

    // a1 should be in the "used / instant" section; a2 stays a re-render alt.
    expect(await screen.findByText("Сахнада бар · бірден")).toBeInTheDocument();
    expect(screen.getByText("Cream Sofa")).toBeInTheDocument();
    expect(screen.getByText("Linen Loveseat")).toBeInTheDocument();
  });

  test("Escape key triggers onClose", async () => {
    vi.spyOn(gen, "getAlternates").mockResolvedValue({ by_item: {} });
    const onClose = vi.fn();

    renderPopover({ onClose });

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
