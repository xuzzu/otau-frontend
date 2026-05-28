import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShopProvider } from "@/lib/shop-context";
import { ItemForm, slugify } from "./ItemForm";
import type { StoreItem } from "@/lib/store-api/types";

// ─── mocks ────────────────────────────────────────────────────────────────────

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: vi.fn() }),
}));

const mockCreateStoreItem = vi.fn();
const mockPatchStoreItem = vi.fn();
const mockPublishItem = vi.fn();

vi.mock("@/lib/store-api/store-catalog", () => ({
  listStoreItems: vi.fn(),
  getStoreItem: vi.fn(),
  createStoreItem: (...args: unknown[]) => mockCreateStoreItem(...args),
  patchStoreItem: (...args: unknown[]) => mockPatchStoreItem(...args),
  archiveStoreItem: vi.fn().mockResolvedValue({}),
  restoreStoreItem: vi.fn().mockResolvedValue({}),
  deleteStoreItem: vi.fn().mockResolvedValue({}),
  removeAvailability: vi.fn(),
  addVariant: vi.fn(),
  patchVariant: vi.fn(),
  deleteVariant: vi.fn(),
  uploadItemImage: vi.fn(),
  addImage: vi.fn(),
  patchImage: vi.fn(),
  deleteImage: vi.fn(),
  setStock: vi.fn(),
  restockEvent: vi.fn(),
  listPromotions: vi.fn().mockResolvedValue([]),
  publishItem: (...args: unknown[]) => mockPublishItem(...args),
  unpublishItem: vi.fn().mockResolvedValue({}),
  createPromotion: vi.fn(),
  patchPromotion: vi.fn(),
  endPromotion: vi.fn(),
  patchShop: vi.fn(),
  addShopPhoto: vi.fn(),
  deleteShopPhoto: vi.fn(),
  getStoreInfo: vi.fn(),
  listCatalogCounts: vi.fn(),
  listMagicHints: vi.fn(),
  listActivity: vi.fn(),
  listStoreScenes: vi.fn(),
  listPromotionsFiltered: vi.fn(),
}));

vi.mock("@/lib/store-api/store-core", () => ({
  getStoreDashboard: vi.fn(),
}));

vi.mock("@/lib/hooks/useTaxonomy", () => ({
  useTaxonomy: () => ({
    indexed: {
      categories: {
        // 1 parent + 1 leaf so CategoryPicker can render them
        par1: { id: "par1", slug: "seating", name: { kz: "Отырғыш", ru: "Сиденья" }, parent_id: null, sort_order: 1 },
        cat1: { id: "cat1", slug: "sofa",    name: { kz: "Диван",    ru: "Диван"   }, parent_id: "par1", sort_order: 1 },
      },
      colors: {},
      materials: {},
      styles: {},
      roomTypes: {},
    },
    isLoading: false,
    isSuccess: true,
    data: {
      categories: [
        { id: "par1", slug: "seating", name: { kz: "Отырғыш", ru: "Сиденья" }, parent_id: null,   sort_order: 1 },
        { id: "cat1", slug: "sofa",    name: { kz: "Диван",    ru: "Диван"   }, parent_id: "par1", sort_order: 1 },
      ],
      colors: [],
      materials: [],
      styles: [],
      roomTypes: [],
    },
  }),
}));

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeQc() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

function wrap(ui: React.ReactNode, qc?: QueryClient) {
  const client = qc ?? makeQc();
  return (
    <QueryClientProvider client={client}>
      <ShopProvider shops={[{ id: "shop1", slug: "shop1", name: "Shop 1" }]}>
        {ui}
      </ShopProvider>
    </QueryClientProvider>
  );
}

const baseItem: StoreItem = {
  id: "item1",
  slug: "aman-sofa",
  partner_id: "p1",
  name: "Aman Sofa",
  description: { kz: "Жақсы", ru: "Хороший" },
  category_id: "cat1",
  room_target_id: null,
  dims: {},
  weight_kg: null,
  tag: "none" as any,
  status: "draft" as any,
  published_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  style_ids: [],
  material_ids: [],
  color_ids: [],
  main_image_url: null,
  variants: [
    {
      id: "v1",
      sku: "aman-default",
      price: 120000,
      currency: "KZT",
      is_default: true,
      in_stock_current_shop: 2,
      color_id: null,
      material_id: null,
      size_label: null,
    },
  ],
  images: [],
};

// ─── slugify unit tests ────────────────────────────────────────────────────────

describe("slugify", () => {
  it("transliterates Cyrillic to latin", () => {
    expect(slugify("Диван Аспара")).toBe("divan-aspara");
  });

  it("lowercases and strips symbols", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
  });

  it("collapses multiple dashes", () => {
    expect(slugify("a  b  c")).toBe("a-b-c");
  });

  it("returns fallback for empty result", () => {
    const result = slugify("!!! @@@");
    expect(result).toMatch(/^item-[a-z0-9]+$/);
  });
});

// ─── create mode tests ────────────────────────────────────────────────────────

describe("ItemForm – create mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a heading in create mode (kz or ru)", () => {
    render(wrap(<ItemForm mode="create" />));
    // Either Kazakh "Тауар қосу" or Russian "Добавить товар" — both are valid
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBeTruthy();
  });

  it("save draft button is disabled when name is empty", () => {
    render(wrap(<ItemForm mode="create" />));
    const btn = screen.getByTestId("save-draft-btn");
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("save draft button is disabled when category_id is empty", () => {
    render(wrap(<ItemForm mode="create" />));
    const nameInput = screen.getByTestId("basics-name");
    fireEvent.change(nameInput, { target: { value: "Test Item" } });
    const btn = screen.getByTestId("save-draft-btn");
    // category_id still empty
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });

  it("save draft button is enabled when name and category are set", () => {
    render(wrap(<ItemForm mode="create" />));
    const nameInput = screen.getByTestId("basics-name");
    fireEvent.change(nameInput, { target: { value: "Test Item" } });

    // CategoryPicker: click parent chip then leaf chip
    fireEvent.click(screen.getByText("Отырғыш"));
    fireEvent.click(screen.getByText("Диван"));

    // Advance past debounce so auto-draft fires (it marks button as fired)
    // but for this test we just check the canSaveDraft state before debounce fires
    const btn = screen.getByTestId("save-draft-btn");
    expect((btn as HTMLButtonElement).disabled).toBe(false);
  });

  it("clicking save draft calls createStoreItem with a slug and routes to edit page", async () => {
    const createdItem = { ...baseItem, id: "new-item-id", slug: "test-item" };
    mockCreateStoreItem.mockResolvedValue(createdItem);

    render(wrap(<ItemForm mode="create" />));

    // Fill name
    const nameInput = screen.getByTestId("basics-name");
    fireEvent.change(nameInput, { target: { value: "Test Item" } });

    // CategoryPicker: click parent chip then leaf chip
    fireEvent.click(screen.getByText("Отырғыш"));
    fireEvent.click(screen.getByText("Диван"));

    // Click save draft (manual fallback) — this fires before the debounce resolves
    // because we haven't advanced timers yet
    const btn = screen.getByTestId("save-draft-btn");
    fireEvent.click(btn);

    // Flush all timers and microtasks
    await vi.runAllTimersAsync();

    expect(mockCreateStoreItem).toHaveBeenCalled();
    const firstCallArg = mockCreateStoreItem.mock.calls[0][0];
    expect(firstCallArg).toMatchObject({
      slug: expect.stringMatching(/^[a-z0-9-]+$/),
      name: "Test Item",
      category_id: "cat1",
    });

    expect(mockReplace).toHaveBeenCalledWith("/store/catalog/new-item-id/edit");
  });

  // ─── auto-draft tests ──────────────────────────────────────────────────────

  it("auto-draft does NOT fire when only name is set (no category)", async () => {
    mockCreateStoreItem.mockResolvedValue({ ...baseItem, id: "new1" });

    render(wrap(<ItemForm mode="create" />));

    const nameInput = screen.getByTestId("basics-name");
    fireEvent.change(nameInput, { target: { value: "My Sofa" } });

    // Advance well past debounce + flush all pending timers/microtasks
    await vi.runAllTimersAsync();

    expect(mockCreateStoreItem).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("auto-draft does NOT fire when only category is set (no name)", async () => {
    mockCreateStoreItem.mockResolvedValue({ ...baseItem, id: "new1" });

    render(wrap(<ItemForm mode="create" />));

    // Set category only (no name)
    fireEvent.click(screen.getByText("Отырғыш"));
    fireEvent.click(screen.getByText("Диван"));

    await vi.runAllTimersAsync();

    expect(mockCreateStoreItem).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("auto-draft fires once when both name (>=2 chars) and category are set", async () => {
    const createdItem = { ...baseItem, id: "new1" };
    mockCreateStoreItem.mockResolvedValue(createdItem);

    render(wrap(<ItemForm mode="create" />));

    const nameInput = screen.getByTestId("basics-name");
    fireEvent.change(nameInput, { target: { value: "My Sofa" } });

    fireEvent.click(screen.getByText("Отырғыш"));
    fireEvent.click(screen.getByText("Диван"));

    // Advance all timers and flush async chain
    await vi.runAllTimersAsync();

    expect(mockCreateStoreItem).toHaveBeenCalledTimes(1);
    const arg = mockCreateStoreItem.mock.calls[0][0];
    expect(arg).toMatchObject({
      slug: expect.stringMatching(/^[a-z0-9-]+$/),
      name: "My Sofa",
      category_id: "cat1",
    });
    expect(mockReplace).toHaveBeenCalledWith("/store/catalog/new1/edit");
  });

  it("auto-draft fires only once even if timers advance again", async () => {
    const createdItem = { ...baseItem, id: "new1" };
    mockCreateStoreItem.mockResolvedValue(createdItem);

    render(wrap(<ItemForm mode="create" />));

    const nameInput = screen.getByTestId("basics-name");
    fireEvent.change(nameInput, { target: { value: "My Sofa" } });

    fireEvent.click(screen.getByText("Отырғыш"));
    fireEvent.click(screen.getByText("Диван"));

    // First pass — fires once
    await vi.runAllTimersAsync();

    expect(mockCreateStoreItem).toHaveBeenCalledTimes(1);

    // Second pass — should NOT fire again (guard is set)
    await vi.runAllTimersAsync();

    // Still only once
    expect(mockCreateStoreItem).toHaveBeenCalledTimes(1);
  });

  it("auto-draft requires name length >= 2", async () => {
    mockCreateStoreItem.mockResolvedValue({ ...baseItem, id: "new1" });

    render(wrap(<ItemForm mode="create" />));

    const nameInput = screen.getByTestId("basics-name");
    // Single character — too short
    fireEvent.change(nameInput, { target: { value: "A" } });

    fireEvent.click(screen.getByText("Отырғыш"));
    fireEvent.click(screen.getByText("Диван"));

    await vi.runAllTimersAsync();

    expect(mockCreateStoreItem).not.toHaveBeenCalled();
  });
});

// ─── edit mode tests ──────────────────────────────────────────────────────────

describe("ItemForm – edit mode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the item name pre-filled", () => {
    render(wrap(<ItemForm mode="edit" item={baseItem} />));
    expect((screen.getByTestId("basics-name") as HTMLInputElement).value).toBe("Aman Sofa");
  });

  it("save calls patchStoreItem with derived color_ids and material_ids union", async () => {
    const itemWithVariants: StoreItem = {
      ...baseItem,
      variants: [
        { ...baseItem.variants[0], color_id: "col1", material_id: "mat1" },
        {
          id: "v2",
          sku: "aman-v2",
          price: 140000,
          currency: "KZT",
          is_default: false,
          in_stock_current_shop: 0,
          color_id: "col2",
          material_id: "mat2",
        },
      ],
      material_ids: ["mat3"], // item-level material
    };

    mockPatchStoreItem.mockResolvedValue(itemWithVariants);

    render(wrap(<ItemForm mode="edit" item={itemWithVariants} />));

    const saveBtn = screen.getByTestId("save-btn");
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockPatchStoreItem).toHaveBeenCalledWith(
        "item1",
        expect.objectContaining({
          // color_ids derived from variants
          color_ids: expect.arrayContaining(["col1", "col2"]),
          // material_ids = basics union variants
          material_ids: expect.arrayContaining(["mat3", "mat1", "mat2"]),
        })
      );
    });
  });

  it("publish button is disabled when no images", () => {
    render(wrap(<ItemForm mode="edit" item={{ ...baseItem, images: [] }} />));
    const publishBtn = screen.getByTestId("publish-btn");
    expect((publishBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("publish checklist shown when no images", () => {
    render(wrap(<ItemForm mode="edit" item={{ ...baseItem, images: [] }} />));
    // Checklist title should be visible (kz or ru)
    const body = document.body.textContent ?? "";
    // "Для публикации нужно" (ru) or "Жариялау үшін қажет:" (kz)
    const hasChecklist =
      body.includes("публикации") ||
      body.includes("Жариялау");
    expect(hasChecklist).toBe(true);
  });

  it("publish checklist shows missing image item", () => {
    render(wrap(<ItemForm mode="edit" item={{ ...baseItem, images: [] }} />));
    const body = document.body.textContent ?? "";
    // "Нужно хотя бы одно фото" (ru) or "Кем дегенде бір фотосурет қажет" (kz)
    const hasMissingImage =
      body.includes("фото") ||
      body.includes("фотосурет");
    expect(hasMissingImage).toBe(true);
  });

  it("shows unpublish button for active item instead of publish", () => {
    const activeItem: StoreItem = { ...baseItem, status: "active" as any };
    render(wrap(<ItemForm mode="edit" item={activeItem} />));
    // Publish button should not exist
    expect(screen.queryByTestId("publish-btn")).toBeNull();
    // Some unpublish/снять button should exist
    const body = document.body.textContent ?? "";
    const hasUnpublish =
      body.includes("Снять") ||
      body.includes("Жарияламау");
    expect(hasUnpublish).toBe(true);
  });

  it("delete button only shown for draft items", () => {
    render(wrap(<ItemForm mode="edit" item={baseItem} />));
    expect(screen.getByTestId("delete-btn")).toBeTruthy();
  });

  it("delete button not shown for active items", () => {
    render(wrap(<ItemForm mode="edit" item={{ ...baseItem, status: "active" as any }} />));
    expect(screen.queryByTestId("delete-btn")).toBeNull();
  });
});
