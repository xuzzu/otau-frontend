import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardCatalog } from "./DashboardCatalog";

vi.mock("@/lib/store-api/hooks", () => {
  const items = (bucket: string) => ({
    all: [{ id: "a", slug: "a", name: "A", status: "active", tag: "none",
            main_image_url: null, default_price: 1000, in_stock_current_shop: 5,
            has_active_promotion: false, magic_hint: null }],
    drafts: [{ id: "d", slug: "d", name: "D", status: "draft", tag: "none",
               main_image_url: null, default_price: null, in_stock_current_shop: 0,
               has_active_promotion: false, magic_hint: null }],
  })[bucket as "all" | "drafts"] ?? [];

  return {
    useShopContext: () => ({ selectedShopId: "s1" }),
    useStoreCatalogCounts: () => ({ data: { all: 1, active: 1, drafts: 1, attention: 1, promoted: 0, archived: 0 }, isLoading: false }),
    useStoreItems: ({ bucket }: { bucket: string }) => ({ data: items(bucket ?? "all"), isLoading: false }),
  };
});

function withClient(ui: React.ReactNode) {
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe("DashboardCatalog", () => {
  it("renders all bucket by default", () => {
    render(withClient(<DashboardCatalog />));
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.queryByText("D")).not.toBeInTheDocument();
  });

  it("switches bucket when chip clicked", async () => {
    render(withClient(<DashboardCatalog />));
    // kz label for "drafts" bucket
    fireEvent.click(screen.getByText(/Жобалар/));
    await waitFor(() => expect(screen.getByText("D")).toBeInTheDocument());
  });
});
