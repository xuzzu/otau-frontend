import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CatalogCard } from "./CatalogCard";
import type { StoreItemSummary } from "@/lib/store-api/types";

const baseItem: StoreItemSummary = {
  id: "i1", slug: "aspara", name: "Aspara linen sofa",
  status: "active", tag: "none", main_image_url: null,
  default_price: 218_000, in_stock_current_shop: 14,
  has_active_promotion: false, magic_hint: null,
};

describe("CatalogCard", () => {
  it("renders name and formatted price", () => {
    render(<CatalogCard item={baseItem} />);
    expect(screen.getByText("Aspara linen sofa")).toBeInTheDocument();
    expect(screen.getByText(/218/)).toBeInTheDocument();
  });

  it("renders Low · N left badge when stock <= 3", () => {
    render(<CatalogCard item={{ ...baseItem, in_stock_current_shop: 2 }} />);
    expect(screen.getByText(/Low · 2 left/i)).toBeInTheDocument();
  });

  it("renders Draft badge when status=draft", () => {
    render(<CatalogCard item={{ ...baseItem, status: "draft" }} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders magic hint chip and body when present", () => {
    render(<CatalogCard item={{
      ...baseItem,
      magic_hint: {
        kind: "pricing_low", item_id: "i1",
        short_label: "Try ₸ 245k",
        body: "Priced 12% below similar.",
        action_label: "Try it", evidence: {},
      },
    }} />);
    expect(screen.getByText(/Try ₸ 245k/)).toBeInTheDocument();
    expect(screen.getByText(/Priced 12% below similar/)).toBeInTheDocument();
  });

  it("links to edit page including assist param when magic hint present", () => {
    render(<CatalogCard item={{
      ...baseItem,
      magic_hint: { kind: "missing_photo", item_id: "i1", short_label: "x", body: "x",
                    action_label: "Auto-fill", evidence: {} },
    }} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", expect.stringContaining("assist=missing_photo"));
  });
});
