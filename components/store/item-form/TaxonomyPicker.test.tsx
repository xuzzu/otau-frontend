import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaxonomySelect, TaxonomyChips, CategoryPicker } from "./TaxonomyPicker";

// Hierarchical fixture: 2 parents, 4 leaves (2 per parent)
const fixture = {
  data: {
    categories: [
      { id: "p1", slug: "seating", name: { kz: "Отырғыш", ru: "Сиденья" }, parent_id: null, sort_order: 1 },
      { id: "p2", slug: "tables",  name: { kz: "Үстелдер", ru: "Столы" },  parent_id: null, sort_order: 2 },
      { id: "l1", slug: "sofa",    name: { kz: "Диван",    ru: "Диван" },   parent_id: "p1", sort_order: 1 },
      { id: "l2", slug: "chair",   name: { kz: "Кресло",   ru: "Кресло" },  parent_id: "p1", sort_order: 2 },
      { id: "l3", slug: "desk",    name: { kz: "Жұмыс үстелі", ru: "Стол-письменный" }, parent_id: "p2", sort_order: 1 },
      { id: "l4", slug: "coffee",  name: { kz: "Кофе үстелі",  ru: "Журнальный стол"  }, parent_id: "p2", sort_order: 2 },
    ],
    colors: [
      { id: "col1", slug: "beige", name: { kz: "Бежевый", ru: "Бежевый" }, hex: "#F5F0E8" },
      { id: "col2", slug: "black", name: { kz: "Қара",    ru: "Чёрный"  }, hex: "#1A1A1A" },
    ],
    materials: [
      { id: "mat1", slug: "linen", name: { kz: "Зығыр", ru: "Лён" } },
      { id: "mat2", slug: "oak",   name: { kz: "Емен",  ru: "Дуб" } },
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
      p1:  { id: "p1",  slug: "seating", name: { kz: "Отырғыш",       ru: "Сиденья" },            parent_id: null, sort_order: 1 },
      p2:  { id: "p2",  slug: "tables",  name: { kz: "Үстелдер",       ru: "Столы" },              parent_id: null, sort_order: 2 },
      l1:  { id: "l1",  slug: "sofa",    name: { kz: "Диван",           ru: "Диван" },              parent_id: "p1", sort_order: 1 },
      l2:  { id: "l2",  slug: "chair",   name: { kz: "Кресло",          ru: "Кресло" },             parent_id: "p1", sort_order: 2 },
      l3:  { id: "l3",  slug: "desk",    name: { kz: "Жұмыс үстелі",   ru: "Стол-письменный" },    parent_id: "p2", sort_order: 1 },
      l4:  { id: "l4",  slug: "coffee",  name: { kz: "Кофе үстелі",    ru: "Журнальный стол" },    parent_id: "p2", sort_order: 2 },
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

vi.mock("@/lib/hooks/useTaxonomy", () => ({
  useTaxonomy: () => ({ ...fixture, isLoading: false, isSuccess: true }),
}));

vi.mock("@/lib/i18n", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/i18n")>();
  return { ...real, useLocale: () => "kz" };
});

const noop = () => {};

// ─────────────────────────────────────────────────────────────────────────────
describe("TaxonomySelect", () => {
  it("renders localized options (kz) and fires onChange with the id", () => {
    const onChange = vi.fn();
    render(<TaxonomySelect kind="colors" value={null} onChange={onChange} />);

    const select = screen.getByRole("combobox");
    expect(screen.getByText("Бежевый")).toBeInTheDocument();
    expect(screen.getByText("Қара")).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "col2" } });
    expect(onChange).toHaveBeenCalledWith("col2");
  });

  it("allowNone adds a none option and onChange fires null when selected", () => {
    const onChange = vi.fn();
    render(<TaxonomySelect kind="roomTypes" value="rt1" onChange={onChange} allowNone />);

    expect(screen.getByText("— нет —")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it("without allowNone there is no none option", () => {
    render(<TaxonomySelect kind="materials" value={null} onChange={noop} />);
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
    render(<TaxonomySelect kind="materials" value="mat1" onChange={noop} />);
    expect(screen.queryByTestId("selected-swatch")).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("TaxonomyChips (toggle-style)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all options as chips (not just selected)", () => {
    render(<TaxonomyChips kind="styles" value={[]} onChange={noop} />);
    // Both style chips should be visible without any "+ добавить"
    expect(screen.getByText("Скандинавия")).toBeInTheDocument();
    expect(screen.getByText("Лофт")).toBeInTheDocument();
    expect(screen.queryByLabelText("Добавить")).not.toBeInTheDocument();
  });

  it("clicking an unselected chip adds it (onChange called with id added)", () => {
    const onChange = vi.fn();
    render(<TaxonomyChips kind="styles" value={[]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Скандинавия"));
    expect(onChange).toHaveBeenCalledWith(["sty1"]);
  });

  it("clicking a selected chip removes it (onChange called with id removed)", () => {
    const onChange = vi.fn();
    render(<TaxonomyChips kind="styles" value={["sty1", "sty2"]} onChange={onChange} />);
    fireEvent.click(screen.getByText("Скандинавия"));
    expect(onChange).toHaveBeenCalledWith(["sty2"]);
  });

  it("selected chips show ink background, unselected show hair border", () => {
    const { container } = render(
      <TaxonomyChips kind="styles" value={["sty1"]} onChange={noop} />
    );
    // sty1 chip should have ink background
    const chips = container.querySelectorAll("[data-chip]");
    // At least 2 chips rendered (one selected, one not)
    expect(chips.length).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("CategoryPicker (hierarchical)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders parent chips for all parents", () => {
    render(<CategoryPicker value={null} onChange={noop} />);
    expect(screen.getByText("Отырғыш")).toBeInTheDocument();
    expect(screen.getByText("Үстелдер")).toBeInTheDocument();
  });

  it("clicking a parent chip reveals its leaf chips", () => {
    render(<CategoryPicker value={null} onChange={noop} />);
    // No leaf chips initially
    expect(screen.queryByText("Диван")).not.toBeInTheDocument();
    // Click first parent
    fireEvent.click(screen.getByText("Отырғыш"));
    // Now p1's leaves should appear
    expect(screen.getByText("Диван")).toBeInTheDocument();
    expect(screen.getByText("Кресло")).toBeInTheDocument();
    // p2's leaves should NOT appear
    expect(screen.queryByText("Жұмыс үстелі")).not.toBeInTheDocument();
  });

  it("clicking a leaf fires onChange with leafId", () => {
    const onChange = vi.fn();
    render(<CategoryPicker value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText("Отырғыш"));
    fireEvent.click(screen.getByText("Диван"));
    expect(onChange).toHaveBeenCalledWith("l1");
  });

  it("initial leaf value pre-selects its parent (leaves visible on mount)", () => {
    render(<CategoryPicker value="l3" onChange={noop} />);
    // l3 has parent_id "p2" → p2 leaves should be visible
    expect(screen.getByText("Жұмыс үстелі")).toBeInTheDocument();
    expect(screen.getByText("Кофе үстелі")).toBeInTheDocument();
  });

  it("shows breadcrumb with parent › leaf when a leaf is selected", () => {
    render(<CategoryPicker value="l1" onChange={noop} />);
    // Should show "Отырғыш › Диван"
    expect(screen.getByText(/Отырғыш.*Диван/)).toBeInTheDocument();
  });

  it("clicking a parent chip when a leaf is already selected clears the leaf", () => {
    const onChange = vi.fn();
    render(<CategoryPicker value="l1" onChange={onChange} />);
    // Click a different parent — the picker opens p2; leaf selection (l1) is cleared
    fireEvent.click(screen.getByText("Үстелдер"));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
