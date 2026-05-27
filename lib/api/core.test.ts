import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as core from "./core";
import { BASES } from "./env";

describe("core client", () => {
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

  test("getMe hits /me on core base", async () => {
    await core.getMe();
    expect(fetchMock.mock.calls[0]![0]).toBe(`${BASES.core}/me`);
  });

  test("addLike POSTs target_kind/target_id", async () => {
    await core.addLike("item", "i-1");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASES.core}/me/likes`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      target_kind: "item",
      target_id: "i-1",
    });
  });

  test("removeLike encodes both params as query", async () => {
    fetchMock.mockImplementationOnce(
      async () => new Response(null, { status: 204 }),
    );
    await core.removeLike("item", "i 1");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(
      `${BASES.core}/me/likes?target_kind=item&target_id=i%201`,
    );
    expect(init.method).toBe("DELETE");
  });

  test("listJournal serializes params", async () => {
    fetchMock.mockImplementationOnce(
      async () => new Response("[]", { status: 200 }),
    );
    await core.listJournal({ category: "trend", limit: 5 });
    const url = String(fetchMock.mock.calls[0]![0]);
    const qs = new URL(url).searchParams;
    expect(qs.get("category")).toBe("trend");
    expect(qs.get("limit")).toBe("5");
  });

  test("sessionsRegister POSTs identifier + password to /sessions/register", async () => {
    await core.sessionsRegister({
      identifier: "x@y.com",
      password: "hunter2secret",
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASES.core}/sessions/register`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      identifier: "x@y.com",
      password: "hunter2secret",
    });
  });

  test("sessionsLogin POSTs identifier + password to /sessions/login", async () => {
    await core.sessionsLogin({
      identifier: "+77001234567",
      password: "mypassword",
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASES.core}/sessions/login`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      identifier: "+77001234567",
      password: "mypassword",
    });
  });

  test("sessionsLogout POSTs and resolves null on 204", async () => {
    fetchMock.mockImplementationOnce(
      async () => new Response(null, { status: 204 }),
    );
    const out = await core.sessionsLogout();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASES.core}/sessions/logout`);
    expect(init.method).toBe("POST");
    expect(out).toBeNull();
  });

  test("sessionsExtend POSTs to /sessions/extend", async () => {
    fetchMock.mockImplementationOnce(
      async () => new Response(null, { status: 204 }),
    );
    await core.sessionsExtend();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASES.core}/sessions/extend`);
    expect(init.method).toBe("POST");
  });
});
