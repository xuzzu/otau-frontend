import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaxonomySelect, TaxonomyChips } from "./TaxonomyPicker";

// Small taxonomy fixture — names in kz (default locale) and ru
const fixture = {
  data: {
    categories: [
      { id: "cat1", slug: "divan", name: { kz: "Диван", ru: "Диван" } },
      { id: "cat2", slug: "kreslo", name: { kz: "Кресло", ru: "Кресло" } },
    ],
    colors: [
      { id: "col1", slug: "beige", name: { kz: "Бежевый", ru: "Бежевый" }, hex: "#F5F0E8" },
      { id: "col2", slug: "black", name: { kz: "Қара", ru: "Чёрный" }, hex: "#1A1A1A" },
    ],
    materials: [
      { id: "mat1", slug: "linen", name: { kz: "Зығыр", ru: "Лён" } },
      { id: "mat2", slug: "oak",   name: { kz: "Емен", ru: "Дуб" } },
    ],
    styles: [
      { id: "sty1", slug: "scandinavian", name: { kz: "Скандинавия", ru: "Скандинавский" } },
      { id: "sty2", slug: "loft",         name: { kz: "Лофт", ru: "Лофт" } },
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
    colors: {
      col1: { id: "col1", slug: "beige", name: { kz: "Бежевый", ru: "Бежевый" }, hex: "#F5F0E8" },
      col2: { id: "col2", slug: "black", name: { kz: "Қара",    ru: "Чёрный"  }, hex: "#1A1A1A" },
    },
    materials: {
      mat1: { id: "mat1", slug: "linen", name: { kz: "Зығыр", ru: "Лён" } },
      mat2: { id: "mat2", slug: "oak",   name: { kz: "Емен",  ru: "Дуб" } },
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

// Mock useTaxonomy
vi.mock("@/lib/hooks/useTaxonomy", () => ({
  useTaxonomy: () => ({ ...fixture, isLoading: false, isSuccess: true }),
}));

// Mock useLocale to always return "kz" (the default locale)
vi.mock("@/lib/i18n", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/i18n")>();
  return { ...real, useLocale: () => "kz" };
});

const noop = () => {};

describe("TaxonomySelect", () => {
  it("renders localized options (kz) and fires onChange with the id", () => {
    const onChange = vi.fn();
    render(<TaxonomySelect kind="categories" value={null} onChange={onChange} />);

    const select = screen.getByRole("combobox");
    // kz labels
    expect(screen.getByText("Диван")).toBeInTheDocument();
    expect(screen.getByText("Кресло")).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "cat2" } });
    expect(onChange).toHaveBeenCalledWith("cat2");
  });

  it("allowNone adds a none option and onChange fires null when selected", () => {
    const onChange = vi.fn();
    render(<TaxonomySelect kind="roomTypes" value="rt1" onChange={onChange} allowNone />);

    const select = screen.getByRole("combobox");
    // None option
    expect(screen.getByText("— нет —")).toBeInTheDocument();

    // Select the empty value
    fireEvent.change(select, { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("without allowNone there is no none option", () => {
    render(<TaxonomySelect kind="categories" value={null} onChange={noop} />);
    expect(screen.queryByText("— нет —")).not.toBeInTheDocument();
  });

  it("renders a colour swatch element when kind=colors and a value is selected", () => {
    render(<TaxonomySelect kind="colors" value="col1" onChange={noop} />);
    expect(screen.getByTestId("selected-swatch")).toBeInTheDocument();
  });

  it("does not render a swatch when kind=colors but no value selected", () => {
    render(<TaxonomySelect kind="colors" value={null} onChange={noop} />);
    expect(screen.queryByTestId("selected-swatch")).not.toBeInTheDocument();
  });

  it("does not render a swatch for non-colour kinds", () => {
    render(<TaxonomySelect kind="categories" value="cat1" onChange={noop} />);
    expect(screen.queryByTestId("selected-swatch")).not.toBeInTheDocument();
  });
});

describe("TaxonomyChips", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders selected chips with localized (kz) labels", () => {
    render(<TaxonomyChips kind="styles" value={["sty1"]} onChange={noop} />);
    // kz label
    expect(screen.getByText(/Скандинавия/)).toBeInTheDocument();
  });

  it("clicking + открыть popover reveals remaining options", () => {
    render(<TaxonomyChips kind="styles" value={["sty1"]} onChange={noop} />);
    fireEvent.click(screen.getByLabelText("Добавить"));
    // sty2 is not yet selected; its kz name should appear
    expect(screen.getByText("Лофт")).toBeInTheDocument();
    // sty1 is selected so it shouldn't appear in the popover
    expect(screen.queryByRole("option", { name: "Скандинавия" })).not.toBeInTheDocument();
  });

  it("clicking an option fires onChange with the id appended", () => {
    const onChange = vi.fn();
    render(<TaxonomyChips kind="styles" value={["sty1"]} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Добавить"));
    fireEvent.click(screen.getByText("Лофт"));
    expect(onChange).toHaveBeenCalledWith(["sty1", "sty2"]);
  });

  it("clicking × on a chip fires onChange with the id removed", () => {
    const onChange = vi.fn();
    render(<TaxonomyChips kind="styles" value={["sty1", "sty2"]} onChange={onChange} />);
    const removeBtn = screen.getByLabelText("Убрать Скандинавия");
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(["sty2"]);
  });

  it("search input filters the popover options", () => {
    render(<TaxonomyChips kind="materials" value={[]} onChange={noop} />);
    fireEvent.click(screen.getByLabelText("Добавить"));
    const searchInput = screen.getByPlaceholderText("Поиск…");
    // Filter to only Зығыр (kz: linen)
    fireEvent.change(searchInput, { target: { value: "Зығыр" } });
    expect(screen.getByText("Зығыр")).toBeInTheDocument();
    // Емен should not match
    expect(screen.queryByText("Емен")).not.toBeInTheDocument();
  });
});
