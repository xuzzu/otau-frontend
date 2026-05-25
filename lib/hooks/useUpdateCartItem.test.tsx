import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMyCart, useUpdateCartItem } from "./index";
import { qk } from "./queryKeys";
import type { Cart } from "@/lib/api/types";

function wrapperOf(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const seed: Cart = {
  id: "C1",
  user_id: "u",
  status: "active",
  items: [
    {
      id: "CI1",
      cart_id: "C1",
      variant_id: "V1",
      item_id: "I1",
      shop_id: null,
      quantity: 1,
      unit_price: 100,
      currency: "KZT",
      created_at: "2026-05-25T00:00:00Z",
    },
  ],
  total: 100,
  currency: "KZT",
  created_at: "2026-05-25T00:00:00Z",
  updated_at: "2026-05-25T00:00:00Z",
};

const realFetch = global.fetch;

describe("useUpdateCartItem", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("optimistically updates quantity and PATCHes", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData<Cart>(qk.cart, seed);

    let serverCart: Cart = seed;
    fetchMock.mockImplementation(async (url, init) => {
      if (init?.method === "PATCH" && String(url).includes("/me/cart/items/CI1")) {
        const updated = { ...serverCart.items[0], quantity: 3 };
        serverCart = { ...serverCart, items: [updated] };
        return new Response(JSON.stringify(updated), { status: 200 });
      }
      return new Response(JSON.stringify(serverCart), { status: 200 });
    });

    const wrapper = wrapperOf(client);
    const { result: cart } = renderHook(() => useMyCart(), { wrapper });
    const { result: patch } = renderHook(() => useUpdateCartItem(), { wrapper });

    await waitFor(() => expect(cart.current.data?.items[0].quantity).toBe(1));
    patch.current.mutate({ item_id: "CI1", quantity: 3 });

    await waitFor(() =>
      expect(cart.current.data?.items[0].quantity).toBe(3),
    );
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).includes("/me/cart/items/CI1") && init?.method === "PATCH",
      ),
    ).toBe(true);
  });

  test("rolls back on server error", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    client.setQueryData<Cart>(qk.cart, seed);

    fetchMock.mockImplementation(async (_url, init) => {
      if (init?.method === "PATCH") {
        return new Response('{"detail":"nope"}', { status: 500 });
      }
      return new Response(JSON.stringify(seed), { status: 200 });
    });

    const wrapper = wrapperOf(client);
    const { result: cart } = renderHook(() => useMyCart(), { wrapper });
    const { result: patch } = renderHook(() => useUpdateCartItem(), { wrapper });

    patch.current.mutate({ item_id: "CI1", quantity: 7 });
    await waitFor(() => expect(patch.current.isError).toBe(true));
    expect(cart.current.data?.items[0].quantity).toBe(1);
  });
});
