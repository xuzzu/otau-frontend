import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BasicsSection } from "./BasicsSection";
import type { BasicsValue } from "./BasicsSection";

// ── Taxonomy fixture ───────────────────────────────────────────────────────────
const fixture = {
  data: {
    categories: [
      { id: "cat1", slug: "divan", name: { kz: "Диван", ru: "Диван" } },
      { id: "cat2", slug: "kreslo", name: { kz: "Кресло", ru: "Кресло" } },
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
      cat1: { id: "cat1", slug: "divan",  name: { kz: "Диван",  ru: "Диван"  } },
      cat2: { id: "cat2", slug: "kreslo", name: { kz: "Кресло", ru: "Кресло" } },
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

  it("selecting a category fires onChange with category_id", () => {
    const onChange = vi.fn();
    render(<BasicsSection value={defaultValue} onChange={onChange} />);

    // The category select is a combobox — pick the first one (Диван = cat1, Кресло = cat2)
    const selects = screen.getAllByRole("combobox");
    // First combobox should be category (no allowNone)
    fireEvent.change(selects[0], { target: { value: "cat2" } });

    expect(onChange).toHaveBeenCalledWith({ category_id: "cat2" });
  });

  it("adding a style chip fires onChange with the new style_ids array", () => {
    const onChange = vi.fn();
    render(<BasicsSection value={defaultValue} onChange={onChange} />);

    // Open the styles chip popover
    const addBtns = screen.getAllByLabelText("Добавить");
    // First "+ добавить" should be for styles
    fireEvent.click(addBtns[0]);

    // Click Скандинавия (sty1)
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

    // Room select is the second combobox (has allowNone "— нет —")
    const selects = screen.getAllByRole("combobox");
    const roomSelect = selects.find((s) => {
      // The room select has "— нет —" option
      return Array.from(s.querySelectorAll("option")).some(
        (o) => (o as HTMLOptionElement).value === ""
      );
    });
    expect(roomSelect).toBeDefined();
    fireEvent.change(roomSelect!, { target: { value: "rt1" } });

    expect(onChange).toHaveBeenCalledWith({ room_target_id: "rt1" });
  });
});
