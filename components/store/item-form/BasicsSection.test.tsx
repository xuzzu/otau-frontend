import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BasicsSection } from "./BasicsSection";
import type { BasicsValue } from "./BasicsSection";

// ── Taxonomy fixture (hierarchical categories) ─────────────────────────────────
const fixture = {
  data: {
    categories: [
      { id: "p1", slug: "seating", name: { kz: "Отырғыш", ru: "Сиденья" }, parent_id: null, sort_order: 1 },
      { id: "p2", slug: "tables",  name: { kz: "Үстелдер", ru: "Столы" },  parent_id: null, sort_order: 2 },
      { id: "l1", slug: "sofa",    name: { kz: "Диван",    ru: "Диван" },   parent_id: "p1", sort_order: 1 },
      { id: "l2", slug: "chair",   name: { kz: "Кресло",   ru: "Кресло" },  parent_id: "p1", sort_order: 2 },
    ],
    colors: [],
    materials: [
      { id: "mat1", slug: "linen", name: { kz: "Зығыр", ru: "Лён" } },
    ],
    styles: [
      { id: "sty1", slug: "scandinavian", name: { kz: "Скандинавия", ru: "Скандинавский" } },
      { id: "sty2", slug: "loft",         name: { kz: "Лофт",        ru: "Лофт"          } },
    ],
    roomTypes: [
      { id: "rt1", slug: "living", name: { kz: "Қонақ бөлме", ru: "Гостиная" } },
    ],
  },
  indexed: {
    categories: {
      p1: { id: "p1", slug: "seating", name: { kz: "Отырғыш", ru: "Сиденья" }, parent_id: null, sort_order: 1 },
      p2: { id: "p2", slug: "tables",  name: { kz: "Үстелдер", ru: "Столы" },  parent_id: null, sort_order: 2 },
      l1: { id: "l1", slug: "sofa",    name: { kz: "Диван",    ru: "Диван" },   parent_id: "p1", sort_order: 1 },
      l2: { id: "l2", slug: "chair",   name: { kz: "Кресло",   ru: "Кресло" },  parent_id: "p1", sort_order: 2 },
    },
    colors: {},
    materials: {
      mat1: { id: "mat1", slug: "linen", name: { kz: "Зығыр", ru: "Лён" } },
    },
    styles: {
      sty1: { id: "sty1", slug: "scandinavian", name: { kz: "Скандинавия", ru: "Скандинавский" } },
      sty2: { id: "sty2", slug: "loft",         name: { kz: "Лофт",        ru: "Лофт"          } },
    },
    roomTypes: {
      rt1: { id: "rt1", slug: "living", name: { kz: "Қонақ бөлме", ru: "Гостиная" } },
    },
  },
};

vi.mock("@/lib/hooks/useTaxonomy", () => ({
  useTaxonomy: () => ({ ...fixture, isLoading: false, isSuccess: true }),
}));

vi.mock("@/lib/i18n", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/i18n")>();
  return { ...real, useLocale: () => "kz" };
});

// ── Helpers ────────────────────────────────────────────────────────────────────
const defaultValue: BasicsValue = {
  name: "",
  category_id: "",
  room_target_id: null,
  style_ids: [],
  material_ids: [],
  description: { kz: "", ru: "" },
  dims: {},
  weight_kg: null,
};

const noop = () => {};

describe("BasicsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("typing into name input fires onChange with updated name", () => {
    const onChange = vi.fn();
    render(<BasicsSection value={defaultValue} onChange={onChange} />);

    const nameInput = screen.getByTestId("basics-name");
    fireEvent.change(nameInput, { target: { value: "Aspara диван" } });

    expect(onChange).toHaveBeenCalledWith({ name: "Aspara диван" });
  });

  it("CategoryPicker renders parent chips; clicking parent then leaf fires onChange with category_id", () => {
    const onChange = vi.fn();
    render(<BasicsSection value={defaultValue} onChange={onChange} />);

    // Parent chips are rendered by CategoryPicker
    expect(screen.getByText("Отырғыш")).toBeInTheDocument();

    // Click parent to reveal leaves
    fireEvent.click(screen.getByText("Отырғыш"));
    expect(screen.getByText("Диван")).toBeInTheDocument();

    // Click leaf → onChange fires with category_id = "l1"
    fireEvent.click(screen.getByText("Диван"));
    expect(onChange).toHaveBeenCalledWith({ category_id: "l1" });
  });

  it("clicking a style chip fires onChange with the new style_ids array", () => {
    const onChange = vi.fn();
    render(<BasicsSection value={defaultValue} onChange={onChange} />);

    // Style chips are now always visible (no popover)
    fireEvent.click(screen.getByText("Скандинавия"));

    expect(onChange).toHaveBeenCalledWith({ style_ids: ["sty1"] });
  });

  it("renders the name input with the current value", () => {
    render(
      <BasicsSection
        value={{ ...defaultValue, name: "Кресло Forma" }}
        onChange={noop}
      />
    );
    expect(screen.getByTestId("basics-name")).toHaveValue("Кресло Forma");
  });

  it("changing description kz fires onChange with merged description", () => {
    const onChange = vi.fn();
    render(
      <BasicsSection
        value={{ ...defaultValue, description: { kz: "Ескі", ru: "Старый" } }}
        onChange={onChange}
      />
    );

    const kzArea = screen.getByTestId("basics-desc-kz");
    fireEvent.change(kzArea, { target: { value: "Жаңа" } });

    expect(onChange).toHaveBeenCalledWith({
      description: { kz: "Жаңа", ru: "Старый" },
    });
  });

  it("selecting room type fires onChange with room_target_id", () => {
    const onChange = vi.fn();
    render(<BasicsSection value={defaultValue} onChange={onChange} />);

    // Room select is now the only combobox (category uses CategoryPicker chips)
    const roomSelect = screen.getByRole("combobox");
    expect(roomSelect).toBeDefined();
    fireEvent.change(roomSelect, { target: { value: "rt1" } });

    expect(onChange).toHaveBeenCalledWith({ room_target_id: "rt1" });
  });
});
