import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as gen from "./generation";
import { BASES } from "./env";

describe("generation client", () => {
  const realFetch = global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi
      .fn()
      .mockImplementation(async () => new Response("{}", { status: 200 }));
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("createGeneration POSTs JSON body to /generations", async () => {
    await gen.createGeneration({
      scope: "room",
      room_type: "Living",
      budget: 1000,
    });

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASES.generation}/generations`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      scope: "room",
      room_type: "Living",
      budget: 1000,
    });
    const headers = init.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  test("getGeneration hits /generations/{id}", async () => {
    await gen.getGeneration("g-1");
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.generation}/generations/g-1`,
    );
  });

  test("getRoomByType hits room-by-type route", async () => {
    await gen.getRoomByType("g-1", "Living");
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.generation}/generations/g-1/rooms/by-type/Living`,
    );
  });

  test("listRoomItemsByType hits /items subpath", async () => {
    fetchMock.mockImplementationOnce(
      async () => new Response("[]", { status: 200 }),
    );
    await gen.listRoomItemsByType("g-1", "Living");
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.generation}/generations/g-1/rooms/by-type/Living/items`,
    );
  });

  test("room_type url-encoded", async () => {
    await gen.getRoomByType("g-1", "Living Room");
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.generation}/generations/g-1/rooms/by-type/Living%20Room`,
    );
  });

  test("getAlternates hits /alternates subpath", async () => {
    await gen.getAlternates("g-1", "r-1");
    expect(fetchMock.mock.calls[0]![0]).toBe(
      `${BASES.generation}/generations/g-1/rooms/r-1/alternates`,
    );
  });

  test("replaceItem POSTs JSON body to /replace subpath", async () => {
    await gen.replaceItem("g-1", "r-1", "item-old", "item-new");

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      `${BASES.generation}/generations/g-1/rooms/r-1/replace`,
    );
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      old_item_id: "item-old",
      new_item_id: "item-new",
    });
    const headers = init.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
