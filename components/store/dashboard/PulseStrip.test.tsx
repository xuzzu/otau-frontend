import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { PulseStrip } from "./PulseStrip";
import type { DashboardData } from "@/lib/store-api/types";

const fixture: DashboardData = {
  likes: { total: 247, last_7d: 12, prev_7d: 4, spark_14d: [1,2,1,3,2,4,3,5,4,6,5,7,6,8] },
  imagined: { scenes_count: 147, items_in_scenes_count: 23, since: "2026-05-20T00:00:00Z" },
  stock: { units: 92, low_count: 2, restocks_7d: 1 },
  visits: { pending_count: 3, next: { date: "2026-05-28T14:00:00Z", recipient_name: "Aliya", items: [], ordinal: 2 } },
  trust: { rating: 4.9, reviews_count: 42 },
};

describe("PulseStrip", () => {
  it("renders all five KPI cards", () => {
    render(<PulseStrip data={fixture} />);
    expect(screen.getByText("Desire")).toBeInTheDocument();
    expect(screen.getByText("✦ Imagined")).toBeInTheDocument();
    expect(screen.getByText("Stock")).toBeInTheDocument();
    expect(screen.getByText("Visits")).toBeInTheDocument();
    expect(screen.getByText("Trust")).toBeInTheDocument();
  });

  it("renders 247 likes total", () => {
    render(<PulseStrip data={fixture} />);
    expect(screen.getByText("247")).toBeInTheDocument();
  });

  it("renders the low-stock warning when low_count > 0", () => {
    render(<PulseStrip data={fixture} />);
    expect(screen.getByText(/2 below threshold/)).toBeInTheDocument();
  });

  it("renders trust as awaiting first review when rating null", () => {
    const empty: DashboardData = {
      ...fixture,
      trust: { rating: null, reviews_count: 0 },
    };
    render(<PulseStrip data={empty} />);
    expect(screen.getByText(/awaiting first review/)).toBeInTheDocument();
  });
});
