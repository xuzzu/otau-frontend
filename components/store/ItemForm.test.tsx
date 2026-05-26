import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShopProvider } from "@/lib/shop-context";
import { ItemForm } from "./ItemForm";
import type { StoreItem } from "@/lib/store-api/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

// Mock the store-catalog API so no real network calls happen
vi.mock("@/lib/store-api/store-catalog", () => ({
  listStoreItems: vi.fn(),
  getStoreItem: vi.fn(),
  createStoreItem: vi.fn(),
  patchStoreItem: vi.fn(),
  archiveStoreItem: vi.fn(),
  restoreStoreItem: vi.fn(),
  deleteStoreItem: vi.fn(),
  removeAvailability: vi.fn(),
  addVariant: vi.fn(),
  patchVariant: vi.fn(),
  deleteVariant: vi.fn(),
  addImage: vi.fn(),
  patchImage: vi.fn(),
  deleteImage: vi.fn(),
  setStock: vi.fn(),
  restockEvent: vi.fn(),
  listPromotions: vi.fn().mockResolvedValue([]),
  createPromotion: vi.fn(),
  patchPromotion: vi.fn(),
  endPromotion: vi.fn(),
  patchShop: vi.fn(),
  addShopPhoto: vi.fn(),
  deleteShopPhoto: vi.fn(),
  getStoreInfo: vi.fn(),
}));

// Mock store-core as well
vi.mock("@/lib/store-api/store-core", () => ({
  getStoreDashboard: vi.fn(),
}));

describe("ItemForm", () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrap = (ui: React.ReactNode) => (
    <QueryClientProvider client={qc}>
      <ShopProvider shops={[{ id: "s1", slug: "s1", name: "S1" }]}>{ui}</ShopProvider>
    </QueryClientProvider>
  );

  test("create mode renders empty fields", () => {
    render(wrap(<ItemForm mode="create" />));
    // Save button shows i18n text (Kazakh: Сақтау, Russian: Сохранить)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    // The form fields are present
    expect(screen.getByPlaceholderText("cat-...")).toBeTruthy();
  });

  test("edit mode renders item name", () => {
    const item: StoreItem = {
      id: "i1", slug: "x", partner_id: "p1", name: "Aman Sofa",
      description: { kz: "", ru: "" }, category_id: "c1", room_target_id: null,
      dims: {}, weight_kg: null, tag: "none" as any, status: "active" as any,
      published_at: null, created_at: "", updated_at: "",
      style_ids: [], material_ids: [], color_ids: [],
      main_image_url: null, variants: [], images: [],
    };
    render(wrap(<ItemForm mode="edit" item={item} />));
    expect((screen.getByDisplayValue("Aman Sofa") as HTMLInputElement).value).toBe("Aman Sofa");
  });
});
