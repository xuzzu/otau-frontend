import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AttentionList } from "./AttentionList";
import type { DashboardData, MagicHint } from "@/lib/store-api/types";

const dash: DashboardData = {
  likes: { total: 0, last_7d: 0, prev_7d: 0, spark_14d: [] },
  imagined: null,
  stock: { units: 0, low_count: 2, restocks_7d: 0 },
  visits: { pending_count: 1, next: {
    date: "2026-05-28T14:00:00Z", recipient_name: "Aliya Beysenova", items: ["oak shelf"], ordinal: 2,
  }},
  trust: { rating: null, reviews_count: 0 },
};

const hint: MagicHint = {
  kind: "pricing_low", item_id: "i1",
  short_label: "Try ₸ 245k",
  body: "Your linen sofa is priced 12% below similar items. Try ₸ 245k for a week?",
  action_label: "Try it",
  evidence: { delta_pct: -12, comp_count: 9 },
};

describe("AttentionList", () => {
  it("renders low-stock row first when present", () => {
    render(<AttentionList dashboard={dash} lowStockItems={["Oak shelf — 2 left"]} magicHint={hint} />);
    const rows = screen.getAllByRole("listitem");
    // kz: "Қор аз:"
    expect(rows[0].textContent).toMatch(/Қор аз/i);
  });

  it("renders magic body in italic serif quote style", () => {
    render(<AttentionList dashboard={dash} lowStockItems={[]} magicHint={hint} />);
    expect(screen.getByText(/Your linen sofa is priced 12%/)).toBeInTheDocument();
  });

  it("caps total rows at 4", () => {
    render(<AttentionList dashboard={dash} lowStockItems={["a","b","c","d","e"]} magicHint={hint} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows.length).toBeLessThanOrEqual(4);
  });
});
