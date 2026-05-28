import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { PricingSection } from "./PricingSection";
import type { StoreItem, StoreVariant } from "@/lib/store-api/types";

// ── Taxonomy fixture ──────────────────────────────────────────────────────────
const fixture = {
  data: { categories: [], colors: [], materials: [], styles: [], roomTypes: [] },
  indexed: { categories: {}, colors: {}, materials: {}, styles: {}, roomTypes: {} },
};

vi.mock("@/lib/hooks/useTaxonomy", () => ({
  useTaxonomy: () => ({ ...fixture, isLoading: false, isSuccess: true }),
}));

vi.mock("@/lib/i18n", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/i18n")>();
  return { ...real, useLocale: () => "kz" };
});

// ── Hook mocks ────────────────────────────────────────────────────────────────
const addMutate = vi.fn();
const patchMutate = vi.fn();
const stockMutate = vi.fn();

vi.mock("@/lib/store-api/hooks", () => ({
  useAddVariant: vi.fn(() => ({ mutate: addMutate })),
  usePatchVariant: vi.fn(() => ({ mutate: patchMutate })),
  useSetStock: vi.fn(() => ({ mutate: stockMutate })),
  useDeleteVariant: vi.fn(() => ({ mutate: vi.fn() })),
  useUploadImage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  usePatchImage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteImage: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("@/lib/api/env", () => ({
  BASES: { catalog: "http://localhost:8002", core: "", generation: "" },
  resolveCatalogAsset: (p: string | null | undefined) =>
    p ? `http://localhost:8002${p.startsWith("/") ? p : `/${p}`}` : null,
  resolveGenerationAsset: (p: string | null | undefined) => p ?? null,
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────
const v1: StoreVariant = {
  id: "v1",
  sku: "ASPARA-001",
  price: 120000,
  currency: "KZT",
  is_default: true,
  in_stock_current_shop: 5,
};

const v2: StoreVariant = {
  id: "v2",
  sku: "ASPARA-002",
  price: 135000,
  currency: "KZT",
  is_default: false,
  in_stock_current_shop: 3,
};

function makeItem(variants: StoreVariant[]): StoreItem {
  return {
    id: "item1",
    slug: "aspara",
    partner_id: "p1",
    name: "Aspara диван",
    description: { kz: "", ru: "" },
    category_id: "cat1",
    room_target_id: null,
    dims: {},
    weight_kg: null,
    tag: "none",
    status: "draft",
    published_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    style_ids: [],
    material_ids: [],
    color_ids: [],
    main_image_url: null,
    variants,
    images: [],
  };
}

const noop = () => {};

describe("PricingSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("single-variant item renders in single mode (toggle unchecked)", () => {
    render(<PricingSection item={makeItem([v1])} onChanged={noop} />);
    const toggle = screen.getByTestId("variants-toggle");
    expect(toggle).not.toBeChecked();
    // No variant cards in single mode
    expect(screen.queryByTestId("variant-card-v1")).not.toBeInTheDocument();
    // Single SKU input is visible
    expect(screen.getByTestId("single-sku")).toBeInTheDocument();
  });

  it("flipping toggle on shows variant card(s)", () => {
    render(<PricingSection item={makeItem([v1])} onChanged={noop} />);
    const toggle = screen.getByTestId("variants-toggle");
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    // VariantCard for v1 should now appear
    expect(screen.getByTestId("variant-card-v1")).toBeInTheDocument();
  });

  it("two-variant item renders in variants mode (toggle checked, 2 cards)", () => {
    render(<PricingSection item={makeItem([v1, v2])} onChanged={noop} />);
    const toggle = screen.getByTestId("variants-toggle");
    expect(toggle).toBeChecked();
    expect(screen.getByTestId("variant-card-v1")).toBeInTheDocument();
    expect(screen.getByTestId("variant-card-v2")).toBeInTheDocument();
  });

  it("toggle is disabled when >1 variant exists (can't turn off)", () => {
    render(<PricingSection item={makeItem([v1, v2])} onChanged={noop} />);
    const toggle = screen.getByTestId("variants-toggle");
    expect(toggle).toBeDisabled();
  });

  it("clicking '+ Add variant' calls useAddVariant mutate", () => {
    render(<PricingSection item={makeItem([v1])} onChanged={noop} />);
    // Enable variants mode first
    fireEvent.click(screen.getByTestId("variants-toggle"));
    const addBtn = screen.getByTestId("add-variant-btn");
    fireEvent.click(addBtn);
    expect(addMutate).toHaveBeenCalledWith(
      { sku: "", price: 0 },
      expect.any(Object)
    );
  });

  it("toggling off is possible when exactly one variant exists", () => {
    render(<PricingSection item={makeItem([v1])} onChanged={noop} />);
    // Enable first
    const toggle = screen.getByTestId("variants-toggle");
    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    // Toggle off — should work since only 1 variant
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });
});
