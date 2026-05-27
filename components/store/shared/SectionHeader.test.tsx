import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SectionHeader } from "./SectionHeader";

describe("SectionHeader", () => {
  it("renders kicker, title, and right-side meta", () => {
    render(
      <SectionHeader
        kicker="№ 01 · Pulse · last 7 days"
        title="How the shop is breathing"
        rightMeta="vs prior week"
      />
    );
    expect(screen.getByText("№ 01 · Pulse · last 7 days")).toBeInTheDocument();
    expect(screen.getByText("How the shop is breathing")).toBeInTheDocument();
    expect(screen.getByText("vs prior week")).toBeInTheDocument();
  });

  it("renders title as a level-2 heading", () => {
    render(<SectionHeader kicker="x" title="Catalog" />);
    expect(screen.getByRole("heading", { level: 2, name: "Catalog" })).toBeInTheDocument();
  });
});
