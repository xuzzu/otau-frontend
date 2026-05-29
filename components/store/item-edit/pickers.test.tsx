import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CategorySelect, type CatNode } from "./pickers";

const CATS: CatNode[] = [
  { id: "seating", parent_id: null, label: "Seating" },
  { id: "sofas", parent_id: "seating", label: "Sofas" },
  { id: "corner-sofas", parent_id: "sofas", label: "Corner sofas" },
  { id: "straight-sofas", parent_id: "sofas", label: "Straight sofas" },
  { id: "lighting", parent_id: null, label: "Lighting" },
];

describe("CategorySelect", () => {
  test("derives the dept/category/leaf chain from a preset leaf", () => {
    render(<CategorySelect categories={CATS} value="corner-sofas" onChange={() => {}} labels={L} />);
    expect((screen.getByLabelText("Department") as HTMLSelectElement).value).toBe("seating");
    expect((screen.getByLabelText("Category") as HTMLSelectElement).value).toBe("sofas");
    expect((screen.getByLabelText("Subcategory") as HTMLSelectElement).value).toBe("corner-sofas");
  });

  test("selecting a subcategory reports the leaf id", () => {
    const onChange = vi.fn();
    render(<CategorySelect categories={CATS} value="" onChange={onChange} labels={L} />);
    fireEvent.change(screen.getByLabelText("Department"), { target: { value: "seating" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "sofas" } });
    fireEvent.change(screen.getByLabelText("Subcategory"), { target: { value: "straight-sofas" } });
    expect(onChange).toHaveBeenLastCalledWith("straight-sofas");
  });

  test("a category with no children is itself the leaf (no subcategory select)", () => {
    const onChange = vi.fn();
    render(<CategorySelect categories={CATS} value="" onChange={onChange} labels={L} />);
    fireEvent.change(screen.getByLabelText("Department"), { target: { value: "lighting" } });
    expect(onChange).toHaveBeenLastCalledWith("lighting");
    expect(screen.queryByLabelText("Subcategory")).toBeNull();
  });
});

const L = { dept: "Department", category: "Category", subcategory: "Subcategory" };
