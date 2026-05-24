import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSessionsVerify } from "./index";
import { qk } from "./queryKeys";

function wrapperOf(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const realFetch = global.fetch;

describe("useSessionsVerify", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("on success invalidates me + cart + myLikes", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    client.setQueryData(qk.me, { id: "u-old" });
    client.setQueryData(qk.cart, { items: [] });
    client.setQueryData(qk.myLikes, []);

    const invalidate = vi.spyOn(client, "invalidateQueries");

    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            id: "u-new",
            type: "client",
            status: "active",
            email: "x@y.com",
          }),
          { status: 200 },
        ),
    );

    const { result } = renderHook(() => useSessionsVerify(), {
      wrapper: wrapperOf(client),
    });
    result.current.mutate({
      kind: "email_otp",
      identifier: "x@y.com",
      code: "042837",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: qk.me });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: qk.cart });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: qk.myLikes });
  });

  test("surfaces 400 as ApiError without invalidating", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidate = vi.spyOn(client, "invalidateQueries");

    fetchMock.mockImplementation(
      async () =>
        new Response('{"detail":"Invalid verification code"}', { status: 400 }),
    );

    const { result } = renderHook(() => useSessionsVerify(), {
      wrapper: wrapperOf(client),
    });
    result.current.mutate({
      kind: "email_otp",
      identifier: "x@y.com",
      code: "wrong",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as { status?: number })?.status).toBe(400);
    expect(invalidate).not.toHaveBeenCalled();
  });
});
