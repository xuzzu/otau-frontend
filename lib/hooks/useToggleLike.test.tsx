import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMyLikes, useToggleLike } from "./index";
import { qk } from "./queryKeys";

function wrapperOf(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const realFetch = global.fetch;

describe("useToggleLike", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("optimistically adds a like and posts to /me/likes", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    let serverLikes: unknown[] = [];
    fetchMock.mockImplementation(async (url, init) => {
      if (String(url).endsWith("/me/likes")) {
        if (init?.method === "POST") {
          const like = {
            id: "L1",
            user_id: "u",
            target_kind: "item",
            target_id: "i1",
            created_at: new Date().toISOString(),
          };
          serverLikes.push(like);
          return new Response(JSON.stringify(like), { status: 201 });
        }
        return new Response(JSON.stringify(serverLikes), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });

    const wrapper = wrapperOf(client);
    const { result: likes } = renderHook(() => useMyLikes(), { wrapper });
    const { result: toggle } = renderHook(() => useToggleLike(), { wrapper });

    await waitFor(() => expect(likes.current.isSuccess).toBe(true));
    toggle.current.mutate({ target_kind: "item", target_id: "i1", currentlyLiked: false });

    await waitFor(() =>
      expect(likes.current.data?.some((l) => l.target_id === "i1")).toBe(true),
    );
    expect(
      fetchMock.mock.calls.some(
        ([url, init]) =>
          String(url).endsWith("/me/likes") && init?.method === "POST",
      ),
    ).toBe(true);
  });

  test("optimistically removes a like and DELETEs", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    let serverLikes: unknown[] = [
      {
        id: "L1",
        user_id: "u",
        target_kind: "item",
        target_id: "i1",
        created_at: "2026-01-01T00:00:00Z",
      },
    ];

    fetchMock.mockImplementation(async (_url, init) => {
      if (init?.method === "DELETE") {
        serverLikes = [];
        return new Response(null, { status: 204 });
      }
      return new Response(JSON.stringify(serverLikes), { status: 200 });
    });

    const wrapper = wrapperOf(client);
    const { result: likes } = renderHook(() => useMyLikes(), { wrapper });
    const { result: toggle } = renderHook(() => useToggleLike(), { wrapper });

    await waitFor(() => expect(likes.current.data?.length).toBe(1));
    toggle.current.mutate({ target_kind: "item", target_id: "i1", currentlyLiked: true });

    await waitFor(() =>
      expect(likes.current.data?.some((l) => l.target_id === "i1")).toBe(false),
    );
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE"),
    ).toBe(true);
  });

  test("rolls back optimistic update on server error", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    client.setQueryData(qk.myLikes, []);

    fetchMock.mockImplementation(async (_url, init) => {
      if (init?.method === "POST") {
        return new Response('{"detail":"nope"}', { status: 500 });
      }
      return new Response("[]", { status: 200 });
    });

    const wrapper = wrapperOf(client);
    const { result: likes } = renderHook(() => useMyLikes(), { wrapper });
    const { result: toggle } = renderHook(() => useToggleLike(), { wrapper });

    toggle.current.mutate({ target_kind: "item", target_id: "i1", currentlyLiked: false });

    await waitFor(() => expect(toggle.current.isError).toBe(true));
    // Rolled back to empty
    expect(likes.current.data?.length ?? 0).toBe(0);
  });
});
