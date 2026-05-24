import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { apiFetch, ApiError } from "./http";

describe("apiFetch", () => {
  const realFetch = global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
    // Clear cookies
    document.cookie.split("; ").forEach((c) => {
      const k = c.split("=")[0];
      if (k) document.cookie = `${k}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  });
  afterEach(() => {
    global.fetch = realFetch;
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

  test("forwards otau_session cookie as X-Otau-Session header", async () => {
    document.cookie = "otau_session=abc123; path=/";
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await apiFetch("http://api.test", "/me");

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("X-Otau-Session")).toBe("abc123");
  });

  test("omits session header when cookie not set", async () => {
    fetchMock.mockResolvedValueOnce(new Response("{}", { status: 200 }));

    await apiFetch("http://api.test", "/me");

    const [, init] = fetchMock.mock.calls[0]!;
    const headers = init.headers as Headers;
    expect(headers.get("X-Otau-Session")).toBeNull();
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
