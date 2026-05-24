import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useGeneration } from "./useGeneration";

function makeWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

const realFetch = global.fetch;

describe("useGeneration", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("does not fetch when id is null", async () => {
    renderHook(() => useGeneration(null), { wrapper: makeWrapper() });
    await new Promise((r) => setTimeout(r, 30));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("fetches once and stops polling when status is done", async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ id: "g1", status: "done", rooms: [] }), {
          status: 200,
        }),
    );
    const { result } = renderHook(() => useGeneration("g1"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.data?.status).toBe("done"));
    const callsAfterDone = fetchMock.mock.calls.length;
    await new Promise((r) => setTimeout(r, 2200));
    expect(fetchMock.mock.calls.length).toBe(callsAfterDone);
  });

  test("keeps polling while status is running", async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({ id: "g1", status: "running", rooms: [] }),
          { status: 200 },
        ),
    );
    renderHook(() => useGeneration("g1"), { wrapper: makeWrapper() });
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(0));
    const first = fetchMock.mock.calls.length;
    await new Promise((r) => setTimeout(r, 2000));
    expect(fetchMock.mock.calls.length).toBeGreaterThan(first);
  });
});
