import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as api from "./store-catalog";
import { BASES } from "@/lib/api/env";

describe("store-catalog client", () => {
  const realFetch = global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(async () => new Response("[]", { status: 200 }));
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => { global.fetch = realFetch; });

  test("getStoreInfo hits /me/store/info", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));
    await api.getStoreInfo();
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASES.catalog}/me/store/info`);
  });

  test("listStoreItems serializes filters", async () => {
    await api.listStoreItems({ status: "active", q: "sofa", all: 1 });
    const url = String(fetchMock.mock.calls[0]![0]);
    const qs = new URL(url).searchParams;
    expect(qs.get("status")).toBe("active");
    expect(qs.get("q")).toBe("sofa");
    expect(qs.get("all")).toBe("1");
  });

  test("createPromotion posts JSON to /me/store/promotions", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ id: "p1" }), { status: 201 }));
    await api.createPromotion({
      scope: "item", item_id: "i1", discount_kind: "percent", discount_value: 1500,
    });
    const opts = fetchMock.mock.calls[0]![1]! as RequestInit;
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body as string).item_id).toBe("i1");
  });
});
