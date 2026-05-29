import { describe, expect, test, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TextField, SelectField, ChipGroup, DeferredField } from "./fields";

describe("item-edit fields", () => {
  test("TextField calls onChange with new value", () => {
    const onChange = vi.fn();
    render(<TextField label="Title" value="a" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "ab" } });
    expect(onChange).toHaveBeenCalledWith("ab");
  });

  test("SelectField renders options and reports value", () => {
    const onChange = vi.fn();
    render(<SelectField label="Room" value="" onChange={onChange}
      options={[{ value: "r1", label: "Living" }]} />);
    fireEvent.change(screen.getByLabelText("Room"), { target: { value: "r1" } });
    expect(onChange).toHaveBeenCalledWith("r1");
  });

  test("ChipGroup toggles selection", () => {
    const onToggle = vi.fn();
    render(<ChipGroup label="Materials" options={[{ value: "m1", label: "Oak" }]}
      selected={[]} onToggle={onToggle} />);
    fireEvent.click(screen.getByText("Oak"));
    expect(onToggle).toHaveBeenCalledWith("m1");
  });

  test("DeferredField marks content disabled with a Soon tag", () => {
    render(<DeferredField label="Tax class"><input /></DeferredField>);
    expect(screen.getByText(/soon/i)).toBeInTheDocument();
  });
});
