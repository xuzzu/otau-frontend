import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ReplaceItemPopover from "./ReplaceItemPopover";
import * as gen from "@/lib/api/generation";
import type { AlternatesResponse } from "@/lib/api/types";

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

describe("ReplaceItemPopover", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("renders alternates from the API for the clicked item", async () => {
    const resp: AlternatesResponse = {
      by_item: {
        orig_1: [
          {
            id: "a1",
            name: "Cream Sofa",
            default_price: 1000,
            main_image_url: "/storage/items/a1.png",
            category_id: "sofas",
          },
          {
            id: "a2",
            name: "Linen Loveseat",
            default_price: 850,
            main_image_url: null,
            category_id: "sofas",
          },
        ],
      },
    };
    vi.spyOn(gen, "getAlternates").mockResolvedValue(resp);

    render(
      wrap(
        <ReplaceItemPopover
          genId="g1"
          roomId="r1"
          originalItemId="orig_1"
          anchorRect={rect()}
          onClose={() => {}}
          onSelected={() => {}}
        />,
        makeQC(),
      ),
    );

    expect(await screen.findByText("Cream Sofa")).toBeInTheDocument();
    expect(screen.getByText("Linen Loveseat")).toBeInTheDocument();
  });

  test("clicking an alternate fires onSelected with its id", async () => {
    vi.spyOn(gen, "getAlternates").mockResolvedValue({
      by_item: {
        orig_1: [
          {
            id: "a1",
            name: "Cream Sofa",
            default_price: 1000,
            main_image_url: null,
            category_id: "sofas",
          },
        ],
      },
    });
    const onSelected = vi.fn();

    render(
      wrap(
        <ReplaceItemPopover
          genId="g1"
          roomId="r1"
          originalItemId="orig_1"
          anchorRect={rect()}
          onClose={() => {}}
          onSelected={onSelected}
        />,
        makeQC(),
      ),
    );

    const card = await screen.findByRole("button", { name: /Cream Sofa/i });
    fireEvent.click(card);
    expect(onSelected).toHaveBeenCalledWith("a1");
  });

  test("renders an empty-state message when there are no alternates", async () => {
    vi.spyOn(gen, "getAlternates").mockResolvedValue({
      by_item: {},
    });

    render(
      wrap(
        <ReplaceItemPopover
          genId="g1"
          roomId="r1"
          originalItemId="orig_1"
          anchorRect={rect()}
          onClose={() => {}}
          onSelected={() => {}}
        />,
        makeQC(),
      ),
    );

    // The i18n key is still "studio.replace.empty" until Task 14; useT() returns
    // the key itself when missing, which is sufficient to assert here.
    expect(
      await screen.findByText("studio.replace.empty"),
    ).toBeInTheDocument();
  });

  test("Escape key triggers onClose", async () => {
    vi.spyOn(gen, "getAlternates").mockResolvedValue({ by_item: {} });
    const onClose = vi.fn();

    render(
      wrap(
        <ReplaceItemPopover
          genId="g1"
          roomId="r1"
          originalItemId="orig_1"
          anchorRect={rect()}
          onClose={onClose}
          onSelected={() => {}}
        />,
        makeQC(),
      ),
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
