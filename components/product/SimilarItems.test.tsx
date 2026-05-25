import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { SimilarItems } from "./SimilarItems";
import type { Item, ItemSummary } from "@/lib/api/types";

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const product: Item = {
  id: "P",
  slug: "p",
  partner_id: "X",
  name: "Hero Product",
  description: {},
  category_id: "CAT",
  room_target_id: "ROOM",
  segmentation_prompt: "",
  dims: {},
  weight_kg: null,
  min_lead_time_days: null,
  tag: "none",
  status: "active",
  published_at: null,
  created_at: "",
  updated_at: "",
  variants: [],
  images: [],
  model_3d: null,
  style_ids: ["STYLE"],
  material_ids: [],
  color_ids: [],
};

const mkSummary = (id: string, name: string): ItemSummary => ({
  id,
  slug: id,
  partner_id: "X",
  name,
  category_id: "CAT",
  room_target_id: "ROOM",
  tag: "none",
  status: "active",
  main_image_url: null,
  default_price: 100,
  currency: "KZT",
});

const realFetch = global.fetch;

describe("SimilarItems", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("renders style row and room row, excluding the current product", async () => {
    const styleHits = [
      mkSummary("P", "self — should be excluded"),
      mkSummary("S1", "Style One"),
      mkSummary("S2", "Style Two"),
      mkSummary("S3", "Style Three"),
    ];
    const roomHits = [
      mkSummary("S1", "Style One — also room, should not duplicate"),
      mkSummary("R1", "Room One"),
      mkSummary("R2", "Room Two"),
    ];

    fetchMock.mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes("style_id=STYLE")) {
        return new Response(JSON.stringify(styleHits), { status: 200 });
      }
      if (u.includes("room_target_id=ROOM")) {
        return new Response(JSON.stringify(roomHits), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });

    wrap(<SimilarItems product={product} />);

    // Each summary renders a <Link> to /catalog/<slug> with the product name as text.
    // The Photo fallback may also render the name; assert via the link role.
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Style One/ })).toBeInTheDocument(),
    );
    expect(screen.getByRole("link", { name: /Style Two/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Style Three/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Room One/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Room Two/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /self — should be excluded/ })).toBeNull();
    expect(
      screen.queryByRole("link", {
        name: /Style One — also room, should not duplicate/,
      }),
    ).toBeNull();
  });

  test("renders nothing when both rows are empty after dedup", async () => {
    fetchMock.mockImplementation(async () =>
      new Response("[]", { status: 200 }),
    );
    const { container } = wrap(<SimilarItems product={product} />);
    await waitFor(() => {
      expect(container.textContent ?? "").not.toMatch(
        /In the same style|For the same room|Осы стильде|В таком же стиле/,
      );
    });
  });
});
