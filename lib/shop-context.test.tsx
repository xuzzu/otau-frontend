import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShopProvider, useShopContext } from "./shop-context";
import { getCurrentShopId } from "./shop-id";

function Probe() {
  const { selectedShopId, selectShop, shops } = useShopContext();
  return (
    <div>
      <p data-testid="selected">{selectedShopId}</p>
      {shops.map((s) => (
        <button key={s.id} onClick={() => selectShop(s.id)}>{s.name}</button>
      ))}
    </div>
  );
}

describe("ShopProvider", () => {
  const qc = new QueryClient();
  beforeEach(() => {
    document.cookie = "store_shop_id=; path=/; max-age=0";
  });
  afterEach(() => {
    document.cookie = "store_shop_id=; path=/; max-age=0";
  });

  test("defaults to first shop and syncs to module ref", () => {
    render(
      <QueryClientProvider client={qc}>
        <ShopProvider shops={[{ id: "a", slug: "a", name: "A" }, { id: "b", slug: "b", name: "B" }]}>
          <Probe />
        </ShopProvider>
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("selected").textContent).toBe("a");
    expect(getCurrentShopId()).toBe("a");
  });

  test("selectShop updates state and module ref", () => {
    render(
      <QueryClientProvider client={qc}>
        <ShopProvider shops={[{ id: "a", slug: "a", name: "A" }, { id: "b", slug: "b", name: "B" }]}>
          <Probe />
        </ShopProvider>
      </QueryClientProvider>,
    );
    act(() => { screen.getByText("B").click(); });
    expect(screen.getByTestId("selected").textContent).toBe("b");
    expect(getCurrentShopId()).toBe("b");
  });
});
