import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as catalog from "./catalog";
import { BASES } from "./env";

describe("catalog client", () => {
  const realFetch = global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockImplementation(
      async () => new Response("[]", { status: 200 }),
    );
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("listItems with no filters hits /items on catalog base", async () => {
    await catalog.listItems();

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASES.catalog}/items`);
  });

  test("listItems serializes filters into query string", async () => {
    await catalog.listItems({
      q: "sofa",
      sort: "price-asc",
      price_max: 5000,
      shop_id: "shop-1",
      style_id: "s1",
      limit: 12,
    });

    const url = String(fetchMock.mock.calls[0]![0]);
    const qs = new URL(url).searchParams;
    expect(qs.get("q")).toBe("sofa");
    expect(qs.get("sort")).toBe("price-asc");
    expect(qs.get("price_max")).toBe("5000");
    expect(qs.get("shop_id")).toBe("shop-1");
    expect(qs.get("style_id")).toBe("s1");
    expect(qs.get("limit")).toBe("12");
  });

  test("listItems with id[] appends each as ?id=", async () => {
    await catalog.listItems({ id: ["a", "b", "c"] });

    const url = String(fetchMock.mock.calls[0]![0]);
    const qs = new URL(url).searchParams;
    expect(qs.getAll("id")).toEqual(["a", "b", "c"]);
  });

  test("listItems skips undefined/null/empty values", async () => {
    await catalog.listItems({
      q: "",
      sort: undefined,
      style_id: undefined,
    });

    const url = String(fetchMock.mock.calls[0]![0]);
    expect(url).toBe(`${BASES.catalog}/items`);
  });

  test("getItemBySlug hits /items/by-slug/{slug}", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "x", slug: "boucle-sofa" }), {
        status: 200,
      }),
    );

    const out = await catalog.getItemBySlug("boucle-sofa");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.catalog}/items/by-slug/boucle-sofa`,
    );
    expect(out.slug).toBe("boucle-sofa");
  });

  test("getItemBySlug url-encodes slug with special chars", async () => {
    await catalog.getItemBySlug("a b/c");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.catalog}/items/by-slug/a%20b%2Fc`,
    );
  });

  test("getPartnerBySlug + listPartnerShopsBySlug hit by-slug routes", async () => {
    await catalog.getPartnerBySlug("forma-kz");
    await catalog.listPartnerShopsBySlug("forma-kz");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.catalog}/partners/by-slug/forma-kz`,
    );
    expect(fetchMock.mock.calls[1]![0]).toBe(
      `${BASES.catalog}/partners/by-slug/forma-kz/shops`,
    );
  });

  test("getShopBySlug + listShopItemsBySlug", async () => {
    await catalog.getShopBySlug("forma-almaty");
    await catalog.listShopItemsBySlug("forma-almaty");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.catalog}/shops/by-slug/forma-almaty`,
    );
    expect(fetchMock.mock.calls[1]![0]).toBe(
      `${BASES.catalog}/shops/by-slug/forma-almaty/items`,
    );
  });

  test("apartment-complex by-slug routes", async () => {
    await catalog.getApartmentComplexBySlug("esentai");
    await catalog.listApartmentPlansBySlug("esentai");

    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.catalog}/apartment-complexes/by-slug/esentai`,
    );
    expect(fetchMock.mock.calls[1]![0]).toBe(
      `${BASES.catalog}/apartment-complexes/by-slug/esentai/plans`,
    );
  });

  test("listTaxonomy hits all five endpoints in parallel", async () => {
    await catalog.listAllTaxonomy();

    const urls = fetchMock.mock.calls.map((c) => String(c[0])).sort();
    expect(urls).toEqual(
      [
        `${BASES.catalog}/categories`,
        `${BASES.catalog}/colors`,
        `${BASES.catalog}/materials`,
        `${BASES.catalog}/room-types`,
        `${BASES.catalog}/styles`,
      ].sort(),
    );
  });
});
