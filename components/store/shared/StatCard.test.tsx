import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Desire" value="247" />);
    expect(screen.getByText("Desire")).toBeInTheDocument();
    expect(screen.getByText("247")).toBeInTheDocument();
  });

  it("renders sub and delta", () => {
    render(
      <StatCard
        label="Stock"
        value="92"
        valueSmall="units"
        delta={{ text: "↑ 31 likes", tone: "ok" }}
        sub="Next: Aliya · tomorrow 14:00"
      />
    );
    expect(screen.getByText("units")).toBeInTheDocument();
    expect(screen.getByText("↑ 31 likes")).toBeInTheDocument();
    expect(screen.getByText("Next: Aliya · tomorrow 14:00")).toBeInTheDocument();
  });

  it("magic variant marks itself with data attribute", () => {
    const { container } = render(
      <StatCard label="✦ Imagined" value="147" accent="magic" />
    );
    expect(container.querySelector('[data-accent="magic"]')).toBeInTheDocument();
  });
});
