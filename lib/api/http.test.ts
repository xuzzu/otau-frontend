import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { apiFetch, ApiError } from "./http";
import { setCurrentUserId } from "./identity";

describe("apiFetch", () => {
  const realFetch = global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
    setCurrentUserId(null);
  });
  afterEach(() => {
    global.fetch = realFetch;
    setCurrentUserId(null);
  });

  test("builds URL from base + path and parses JSON", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const out = await apiFetch<{ ok: boolean }>(
      "http://api.test",
      "/items",
    );

    expect(out).toEqual({ ok: true });
    const [url] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://api.test/items");
  });

  test("sets Accept: application/json by default", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response("{}", { status: 200 }),
    );

    await apiFetch("http://api.test", "/x");

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("Accept")).toBe("application/json");
  });

  test("sets credentials: 'include' so cross-origin httponly cookies are sent", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await apiFetch("http://api.test", "/me");

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init.credentials).toBe("include");
  });

  test("attaches X-User-Id header when current user id is known", async () => {
    setCurrentUserId("user-abc");
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await apiFetch("http://api.test", "/generations");

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("X-User-Id")).toBe("user-abc");
  });

  test("omits X-User-Id when no current user id is set", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await apiFetch("http://api.test", "/generations");

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("X-User-Id")).toBeNull();
  });

  test("respects an explicit X-User-Id override in init headers", async () => {
    setCurrentUserId("user-abc");
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await apiFetch("http://api.test", "/x", {
      headers: { "X-User-Id": "override" },
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("X-User-Id")).toBe("override");
  });

  test("throws ApiError with status + body on non-2xx", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"detail":"Item not found"}', { status: 404 }),
    );

    await expect(apiFetch("http://api.test", "/items/x")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
    });
  });

  test("ApiError exposes status and path", async () => {
    fetchMock.mockResolvedValueOnce(new Response("oops", { status: 500 }));

    let err: unknown;
    try {
      await apiFetch("http://api.test", "/foo");
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
    expect((err as ApiError).path).toBe("/foo");
  });

  test("returns null for 204 No Content", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

    const out = await apiFetch("http://api.test", "/x", { method: "DELETE" });

    expect(out).toBeNull();
  });

  test("merges extra headers passed via init", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await apiFetch("http://api.test", "/x", {
      headers: { "X-Custom": "val" },
    });

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("X-Custom")).toBe("val");
    expect(headers.get("Accept")).toBe("application/json");
  });
});
