import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const patchMock = vi.fn(async () => ({}));
vi.mock("@/lib/store-api/store-catalog", () => ({
  getStoreItem: vi.fn(async () => ({
    id: "i1", slug: "klemo", name: "Klemo", brand: "Mebel", description: {},
    category_id: "corner-sofas", room_target_id: null, dims: {}, weight_kg: null,
    tag: "none", status: "draft", published_at: null, created_at: "", updated_at: "",
    style_ids: [], material_ids: [], finish_material_ids: [], color_ids: [],
    main_image_url: null, variants: [], images: [],
  })),
  patchStoreItem: (...a: unknown[]) => patchMock(...(a as [])),
}));
vi.mock("@/lib/shop-context", () => ({ useShopContext: () => ({ selectedShopId: "shop1" }) }));

import { useItemEditForm } from "./useItemEditForm";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useItemEditForm (edit)", () => {
  beforeEach(() => { patchMock.mockClear(); });
  afterEach(() => { vi.useRealTimers(); });

  test("seeds form from the loaded item", async () => {
    const { result } = renderHook(() => useItemEditForm("i1"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.form.name).toBe("Klemo"));
    expect(result.current.form.brand).toBe("Mebel");
    expect(result.current.form.category_id).toBe("corner-sofas");
  });

  test("editing a field debounce-patches once", async () => {
    // Seed with real timers, then switch to fake timers for debounce control.
    const { result } = renderHook(() => useItemEditForm("i1"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.form.name).toBe("Klemo"));
    vi.useFakeTimers();
    act(() => result.current.setField("name", "Klemo 3-seat"));
    act(() => result.current.setField("name", "Klemo sofa"));
    await act(async () => { vi.advanceTimersByTime(800); });
    expect(patchMock).toHaveBeenCalledTimes(1);
    expect((patchMock.mock.calls[0] as unknown[])[1]).toMatchObject({ name: "Klemo sofa" });
  });
});
