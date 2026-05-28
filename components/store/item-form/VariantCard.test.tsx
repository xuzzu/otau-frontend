import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VariantCard } from "./VariantCard";
import type { StoreVariant, StoreItemImage } from "@/lib/store-api/types";

// ── Taxonomy fixture ──────────────────────────────────────────────────────────
const fixture = {
  data: {
    categories: [],
    colors: [
      { id: "col1", slug: "beige", name: { kz: "Бежевый", ru: "Бежевый" }, hex: "#F5F0E8" },
    ],
    materials: [
      { id: "mat1", slug: "linen", name: { kz: "Зығыр", ru: "Лён" } },
    ],
    styles: [],
    roomTypes: [],
  },
  indexed: {
    categories: {},
    colors: {
      col1: { id: "col1", slug: "beige", name: { kz: "Бежевый", ru: "Бежевый" }, hex: "#F5F0E8" },
    },
    materials: {
      mat1: { id: "mat1", slug: "linen", name: { kz: "Зығыр", ru: "Лён" } },
    },
    styles: {},
    roomTypes: {},
  },
};

vi.mock("@/lib/hooks/useTaxonomy", () => ({
  useTaxonomy: () => ({ ...fixture, isLoading: false, isSuccess: true }),
}));

vi.mock("@/lib/i18n", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/i18n")>();
  return { ...real, useLocale: () => "kz" };
});

// ── Hook mocks ────────────────────────────────────────────────────────────────
const patchMutate = vi.fn();
const deleteMutate = vi.fn();
const stockMutate = vi.fn();

vi.mock("@/lib/store-api/hooks", () => ({
  usePatchVariant: vi.fn(() => ({ mutate: patchMutate })),
  useDeleteVariant: vi.fn(() => ({ mutate: deleteMutate })),
  useSetStock: vi.fn(() => ({ mutate: stockMutate })),
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
const baseVariant: StoreVariant & { color_id?: string | null; material_id?: string | null; size_label?: string | null } = {
  id: "v1",
  sku: "ASPARA-001",
  price: 120000,
  currency: "KZT",
  is_default: true,
  in_stock_current_shop: 5,
  color_id: null,
  material_id: null,
  size_label: null,
};

const images: StoreItemImage[] = [];

const noop = () => {};

describe("VariantCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the variant title with the correct index", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={baseVariant}
        images={images}
        index={0}
        canRemove={false}
        isDefault={true}
        onChanged={noop}
      />
    );
    expect(screen.getByText(/Нұсқа 1/)).toBeInTheDocument();
  });

  it("shows the default badge when isDefault=true", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={baseVariant}
        images={images}
        index={0}
        canRemove={false}
        isDefault={true}
        onChanged={noop}
      />
    );
    expect(screen.getByText("Негізгі")).toBeInTheDocument();
  });

  it("shows 'set default' button when isDefault=false and clicking it calls patchVariant with is_default:true", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={{ ...baseVariant, is_default: false }}
        images={images}
        index={1}
        canRemove={true}
        isDefault={false}
        onChanged={noop}
      />
    );
    const setDefaultBtn = screen.getByLabelText("Негізгі ету");
    fireEvent.click(setDefaultBtn);
    expect(patchMutate).toHaveBeenCalledWith(
      { vid: "v1", body: { is_default: true } },
      expect.any(Object)
    );
  });

  it("remove button is disabled when canRemove=false", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={baseVariant}
        images={images}
        index={0}
        canRemove={false}
        isDefault={true}
        onChanged={noop}
      />
    );
    const removeBtn = screen.getByLabelText("Жою");
    expect(removeBtn).toBeDisabled();
  });

  it("remove button is enabled and calls deleteVariant when canRemove=true", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={{ ...baseVariant, is_default: false }}
        images={images}
        index={1}
        canRemove={true}
        isDefault={false}
        onChanged={noop}
      />
    );
    const removeBtn = screen.getByLabelText("Жою");
    expect(removeBtn).not.toBeDisabled();
    fireEvent.click(removeBtn);
    expect(deleteMutate).toHaveBeenCalledWith("v1", expect.any(Object));
  });

  it("changing colour calls patchVariant with color_id", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={baseVariant}
        images={images}
        index={0}
        canRemove={false}
        isDefault={true}
        onChanged={noop}
      />
    );
    // The colour combobox: finds comboboxes (color + material selects)
    const selects = screen.getAllByRole("combobox");
    // First combobox is color (has allowNone "— нет —" and color options)
    fireEvent.change(selects[0], { target: { value: "col1" } });
    expect(patchMutate).toHaveBeenCalledWith(
      { vid: "v1", body: { color_id: "col1" } },
      expect.any(Object)
    );
  });

  it("changing material calls patchVariant with material_id", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={baseVariant}
        images={images}
        index={0}
        canRemove={false}
        isDefault={true}
        onChanged={noop}
      />
    );
    const selects = screen.getAllByRole("combobox");
    // Second combobox is material
    fireEvent.change(selects[1], { target: { value: "mat1" } });
    expect(patchMutate).toHaveBeenCalledWith(
      { vid: "v1", body: { material_id: "mat1" } },
      expect.any(Object)
    );
  });

  it("blurring the stock input calls useSetStock mutate", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={baseVariant}
        images={images}
        index={0}
        canRemove={false}
        isDefault={true}
        onChanged={noop}
      />
    );
    const stockInput = screen.getByTestId("stock-v1");
    fireEvent.change(stockInput, { target: { value: "10" } });
    fireEvent.blur(stockInput);
    expect(stockMutate).toHaveBeenCalledWith(
      { vid: "v1", in_stock: 10 },
      expect.any(Object)
    );
  });

  it("blurring the price input calls patchVariant with updated price", () => {
    render(
      <VariantCard
        itemId="i1"
        variant={baseVariant}
        images={images}
        index={0}
        canRemove={false}
        isDefault={true}
        onChanged={noop}
      />
    );
    const priceInput = screen.getByTestId("price-v1");
    fireEvent.change(priceInput, { target: { value: "150000" } });
    fireEvent.blur(priceInput);
    expect(patchMutate).toHaveBeenCalledWith(
      { vid: "v1", body: { price: 150000 } },
      expect.any(Object)
    );
  });
});
