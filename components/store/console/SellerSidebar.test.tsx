import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SellerSidebar } from "./SellerSidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/store/catalog" }));

describe("SellerSidebar", () => {
  it("renders nav and coming-soon rows", () => {
    render(<SellerSidebar />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getByText("Promotions")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });
});
