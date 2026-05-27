import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ActivityFeed } from "./ActivityFeed";
import type { ActivityEvent } from "@/lib/store-api/types";

const events: ActivityEvent[] = [
  { kind: "item_liked", created_at: new Date(Date.now() - 2 * 60_000).toISOString(),
    item_id: "i1", item_name: "Aspara linen sofa", actor_label: "Anonymous",
    delta: null, magic_kind: null },
  { kind: "stock_event", created_at: new Date(Date.now() - 60 * 60_000).toISOString(),
    item_id: "i2", item_name: "Walnut bench", actor_label: null,
    delta: 6, magic_kind: null },
  { kind: "magic_event", created_at: new Date(Date.now() - 3 * 3600_000).toISOString(),
    item_id: "i3", item_name: "Brass lamp", actor_label: "Magic",
    delta: null, magic_kind: "missing_description" },
];

describe("ActivityFeed", () => {
  it("renders each event with its body template", () => {
    render(<ActivityFeed events={events} />);
    // kz: "{who} ұнатты {item}" → "Anonymous ұнатты Aspara linen sofa"
    expect(screen.getByText(/ұнатты Aspara linen sofa/i)).toBeInTheDocument();
    // kz: "Толықтыру оқиғасы · {sign}{n} {item}" → "Толықтыру оқиғасы · +6 Walnut bench"
    expect(screen.getByText(/Толықтыру оқиғасы/i)).toBeInTheDocument();
    // kz: "Magic сипаттама жасады: {item}" → "Magic сипаттама жасады: Brass lamp"
    expect(screen.getByText(/Magic сипаттама жасады/i)).toBeInTheDocument();
  });

  it("shows relative time labels", () => {
    render(<ActivityFeed events={events} />);
    expect(screen.getByText("2m")).toBeInTheDocument();
    expect(screen.getByText("1h")).toBeInTheDocument();
    expect(screen.getByText("3h")).toBeInTheDocument();
  });
});
