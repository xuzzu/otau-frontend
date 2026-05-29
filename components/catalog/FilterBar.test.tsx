import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { FilterBar } from "./FilterBar";

function wrap(ui: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const realFetch = global.fetch;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("FilterBar", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;
  });
  afterEach(() => {
    global.fetch = realFetch;
  });

  test("category flyout walks department → category → subcategories", async () => {
    fetchMock.mockImplementation(async (url) => {
      const u = String(url);
      if (u.endsWith("/categories")) {
        return new Response(
          JSON.stringify([
            { id: "d1", slug: "seating", name: { kz: "Жұмсақ жиһаз", en: "Seating" }, parent_id: null, sort_order: 0 },
            { id: "c1", slug: "sofas", name: { kz: "Дивандар", en: "Sofas" }, parent_id: "d1", sort_order: 0 },
            { id: "s1", slug: "straight-sofas", name: { kz: "Тік дивандар", en: "Straight" }, parent_id: "c1", sort_order: 0 },
            { id: "s2", slug: "corner-sofas", name: { kz: "Бұрыштық дивандар", en: "Corner" }, parent_id: "c1", sort_order: 1 },
          ]),
          { status: 200 },
        );
      }
      return new Response("[]", { status: 200 });
    });

    wrap(<FilterBar resultCount={0} />);

    const catChip = await screen.findByRole("button", {
      name: /Category|Санат|Категория/,
    });
    fireEvent.click(catChip);

    // panes cascade to the first dept → first category → its subcategories
    await waitFor(() => expect(screen.getByText("Тік дивандар")).toBeInTheDocument());
    expect(screen.getByText("Бұрыштық дивандар")).toBeInTheDocument();
    expect(screen.getAllByText("Жұмсақ жиһаз").length).toBeGreaterThan(0);
  });

  test("style options are read live from /styles (no curated gating)", async () => {
    fetchMock.mockImplementation(async (url) => {
      const u = String(url);
      if (u.endsWith("/styles")) {
        return new Response(
          JSON.stringify([
            { id: "x1", slug: "modern", name: { kz: "Модерн", en: "Modern" } },
            // 'boho' is NOT in the old curated list — it must still appear.
            { id: "x2", slug: "boho", name: { kz: "Бохо", en: "Boho" } },
          ]),
          { status: 200 },
        );
      }
      return new Response("[]", { status: 200 });
    });

    wrap(<FilterBar resultCount={0} />);

    const styleChip = await screen.findByRole("button", { name: /Style|Стиль/ });
    fireEvent.click(styleChip);

    await waitFor(() => expect(screen.getByText("Модерн")).toBeInTheDocument());
    expect(screen.getByText("Бохо")).toBeInTheDocument();
  });
});
