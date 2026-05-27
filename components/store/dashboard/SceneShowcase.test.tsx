import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SceneShowcase } from "./SceneShowcase";
import type { StoreScene } from "@/lib/store-api/types";

const scenes: StoreScene[] = [
  { id: "sc1", image_url: "https://x/1.jpg",
    featured_item: { id: "i1", name: "Aspara linen sofa", likes_today: 12, carts_today: 3 },
    audience_hint: "a Bostandyk apartment", created_at: "2026-05-27T06:12:00Z" },
  { id: "sc2", image_url: "https://x/2.jpg",
    featured_item: { id: "i2", name: "Bukhar oak shelf", likes_today: 2, carts_today: 0 },
    audience_hint: null, created_at: "2026-05-26T22:00:00Z" },
];

describe("SceneShowcase", () => {
  it("renders empty state when no scenes", () => {
    render(<SceneShowcase scenes={[]} />);
    expect(screen.getByText(/haven't been imagined yet/i)).toBeInTheDocument();
  });

  it("renders hero of first scene by default", () => {
    render(<SceneShowcase scenes={scenes} />);
    // itemName appears in both the title and the caption — use getAllByText
    const matches = screen.getAllByText(/Aspara linen sofa/);
    expect(matches.length).toBeGreaterThan(0);
  });

  it("clicking a thumbnail swaps the hero", () => {
    render(<SceneShowcase scenes={scenes} />);
    fireEvent.click(screen.getByLabelText("Scene 2 of 2"));
    // itemName appears in both the title and the caption — use getAllByText
    const matches = screen.getAllByText(/Bukhar oak shelf/);
    expect(matches.length).toBeGreaterThan(0);
  });
});
