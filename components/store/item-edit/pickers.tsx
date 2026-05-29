"use client";
import { useMemo, useState, useEffect } from "react";
import { SelectField, ChipGroup } from "./fields";

export type CatNode = { id: string; parent_id: string | null; label: string };

function childrenOf(cats: CatNode[], parent: string | null): CatNode[] {
  return cats.filter((c) => c.parent_id === parent);
}
function chainOf(cats: CatNode[], leaf: string): string[] {
  const byId = new Map(cats.map((c) => [c.id, c]));
  const out: string[] = [];
  let cur: string | null = leaf;
  while (cur) { out.unshift(cur); cur = byId.get(cur)?.parent_id ?? null; }
  return out; // [dept, category?, subcategory?]
}

export function CategorySelect({ categories, value, onChange, labels }: {
  categories: CatNode[];
  value: string;
  onChange: (leafId: string) => void;
  labels: { dept: string; category: string; subcategory: string };
}) {
  // Derive the initial chain from the preset value.
  const seedChain = useMemo(() => (value ? chainOf(categories, value) : []), [categories, value]);

  // Internal state for the cascade navigation — initialised from the seed chain.
  const [dept, setDept] = useState(seedChain[0] ?? "");
  const [category, setCategory] = useState(seedChain[1] ?? "");

  // Re-seed when the external value changes (e.g. parent resets to a different leaf).
  const [d0, d1] = seedChain;
  useEffect(() => {
    setDept(d0 ?? "");
    setCategory(d1 ?? "");
  }, [d0, d1]);

  const depts = childrenOf(categories, null);
  const categoriesL2 = dept ? childrenOf(categories, dept) : [];
  const subcats = category ? childrenOf(categories, category) : [];

  const opt = (n: CatNode) => ({ value: n.id, label: n.label });

  // Subcategory select value: the current `value` prop if it sits under the active dept+category,
  // otherwise empty (the user hasn't chosen a subcat yet in this cascade).
  const subcatValue = value && seedChain[0] === dept && seedChain[1] === category ? value : "";

  function handleDept(d: string) {
    setDept(d);
    setCategory("");
    // Call onChange immediately — dept is the leaf until the user drills deeper.
    onChange(d);
  }

  function handleCategory(c: string) {
    setCategory(c);
    const kids = childrenOf(categories, c);
    // A category with no children is itself the leaf.
    onChange(c);
    // If it has children the user will pick a subcat; onChange was still called with c so
    // the parent tracks the "best so far" leaf.
    void kids;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
      <SelectField label={labels.dept} value={dept} options={depts.map(opt)}
        onChange={handleDept} />
      {dept && categoriesL2.length > 0 && (
        <SelectField label={labels.category} value={category} options={categoriesL2.map(opt)}
          onChange={handleCategory} />
      )}
      {category && subcats.length > 0 && (
        <SelectField label={labels.subcategory} value={subcatValue} options={subcats.map(opt)}
          onChange={(s) => onChange(s)} />
      )}
    </div>
  );
}

export function TaxSelect({ label, value, onChange, options, sub }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; sub?: string;
}) {
  return <SelectField label={label} value={value} onChange={onChange} options={options} sub={sub} />;
}

export function TaxChips({ label, options, selected, onToggle, sub }: {
  label: string; options: { value: string; label: string }[];
  selected: string[]; onToggle: (v: string) => void; sub?: string;
}) {
  return <ChipGroup label={label} options={options} selected={selected} onToggle={onToggle} sub={sub} />;
}
