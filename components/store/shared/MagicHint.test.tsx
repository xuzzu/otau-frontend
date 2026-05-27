import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MagicHintBody, MagicHintChip } from "./MagicHint";

describe("MagicHint", () => {
  it("MagicHintChip renders amber star + short label", () => {
    render(<MagicHintChip shortLabel="Try ₸ 245k" />);
    expect(screen.getByText(/Try ₸ 245k/)).toBeInTheDocument();
    expect(screen.getByText("✦")).toBeInTheDocument();
  });

  it("MagicHintBody renders italic serif body and amber star", () => {
    render(<MagicHintBody body="Priced 12% below similar — pattern from 9 listings." />);
    expect(screen.getByText("✦")).toBeInTheDocument();
    expect(screen.getByText(/Priced 12% below similar/)).toBeInTheDocument();
  });
});
