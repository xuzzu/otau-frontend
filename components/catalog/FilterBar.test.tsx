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

  test("category options come from /categories and style options are limited to curated", async () => {
    fetchMock.mockImplementation(async (url) => {
      const u = String(url);
      if (u.endsWith("/categories")) {
        return new Response(
          JSON.stringify([
            { id: "1", slug: "coffee-table", name: { en: "coffee_table" } },
            { id: "2", slug: "wardrobe", name: { en: "wardrobe" } },
          ]),
          { status: 200 },
        );
      }
      if (u.endsWith("/styles")) {
        return new Response(
          JSON.stringify([
            { id: "10", slug: "modern", name: { en: "modern" } },
            { id: "11", slug: "accent-amber", name: { en: "accent-amber" } },
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
    await waitFor(() =>
      expect(screen.getByText("Coffee Table")).toBeInTheDocument(),
    );
    expect(screen.getByText("Wardrobe")).toBeInTheDocument();

    // Close the category menu before opening style
    fireEvent.keyDown(document, { key: "Escape" });

    const styleChip = screen.getByRole("button", { name: /Style|Стиль/ });
    fireEvent.click(styleChip);
    await waitFor(() => expect(screen.getByText("Modern")).toBeInTheDocument());
    expect(screen.queryByText(/accent-amber/i)).toBeNull();
  });
});
