"use client";

import { useMemo, useState } from "react";
import { useTaxonomy } from "@/lib/hooks/useTaxonomy";
import { useLocale, pickText } from "@/lib/i18n";

// ─── shared types ─────────────────────────────────────────────────────────────

type MultiKind = "styles" | "materials";

// ─── TaxonomySelect ────────────────────────────────────────────────────────────
// Used for: colours (w/ swatch), materials (variant card), room (allowNone)

export function TaxonomySelect({
  kind,
  value,
  onChange,
  allowNone = false,
}: {
  kind: "categories" | "roomTypes" | "colors" | "materials";
  value: string | null;
  onChange: (id: string | null) => void;
  allowNone?: boolean;
}) {
  const locale = useLocale();
  const { indexed } = useTaxonomy();

  const entries = useMemo<{ id: string; label: string; hex?: string }[]>(() => {
    if (!indexed) return [];
    const map = indexed[kind] as Record<string, { id: string; name: Record<string, string>; hex?: string }>;
    return Object.values(map).map((rec) => ({
      id: rec.id,
      label: pickText(rec.name, locale),
      hex: rec.hex,
    }));
  }, [indexed, kind, locale]);

  const isColors = kind === "colors";
  const selectedHex = isColors && value && indexed
    ? (indexed.colors[value] as { hex?: string } | undefined)?.hex
    : undefined;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {isColors && selectedHex && (
        <span
          aria-hidden="true"
          data-testid="selected-swatch"
          style={{
            display: "inline-block",
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: selectedHex,
            border: "1px solid var(--color-hair)",
            flexShrink: 0,
          }}
        />
      )}
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: 14,
          color: "var(--color-ink)",
          background: "var(--color-cream)",
          border: "1px solid var(--color-hair)",
          borderRadius: 4,
          padding: "7px 10px",
          cursor: "pointer",
          flex: 1,
        }}
      >
        {allowNone && <option value="">— нет —</option>}
        {entries.map((e) => (
          <option key={e.id} value={e.id}>
            {e.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── TaxonomyChips ─────────────────────────────────────────────────────────────
// Toggle chips — all options always visible.
// Selected = ink fill (click → deselect), unselected = hair-bordered (click → select).

export function TaxonomyChips({
  kind,
  value,
  onChange,
}: {
  kind: MultiKind;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const locale = useLocale();
  const { indexed } = useTaxonomy();

  const allEntries = useMemo<{ id: string; label: string }[]>(() => {
    if (!indexed) return [];
    const map = indexed[kind] as Record<string, { id: string; name: Record<string, string> }>;
    return Object.values(map).map((rec) => ({
      id: rec.id,
      label: pickText(rec.name, locale),
    }));
  }, [indexed, kind, locale]);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {allEntries.map(({ id, label }) => {
        const selected = value.includes(id);
        return (
          <button
            key={id}
            data-chip
            aria-pressed={selected}
            onClick={() => toggle(id)}
            className="mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              background: selected ? "var(--color-ink)" : "transparent",
              color: selected ? "var(--color-cream)" : "var(--color-ink)",
              border: selected
                ? "1px solid var(--color-ink)"
                : "1px solid var(--color-hair)",
              borderRadius: 3,
              padding: "5px 12px",
              fontSize: 13,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── CategoryPicker ────────────────────────────────────────────────────────────
// Two-step hierarchical picker:
//   Row 1: parent chips (5 parents)
//   Row 2: leaf chips for the open parent (revealed on click)
// Pre-selects the parent on mount when `value` is a leaf id.

export function CategoryPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (leafId: string | null) => void;
}) {
  const locale = useLocale();
  const { indexed } = useTaxonomy();

  // Derive parents + leaf map from indexed.categories
  const { parents, leavesByParent } = useMemo(() => {
    if (!indexed) {
      return {
        parents: [] as { id: string; label: string; sort_order: number }[],
        leavesByParent: {} as Record<string, { id: string; label: string; sort_order: number }[]>,
      };
    }

    const all = Object.values(indexed.categories) as {
      id: string;
      name: Record<string, string>;
      parent_id: string | null;
      sort_order?: number;
    }[];

    const parents = all
      .filter((c) => c.parent_id === null)
      .sort(
        (a, b) =>
          (a.sort_order ?? 99) - (b.sort_order ?? 99) ||
          pickText(a.name, locale).localeCompare(pickText(b.name, locale))
      )
      .map((c) => ({ id: c.id, label: pickText(c.name, locale), sort_order: c.sort_order ?? 99 }));

    const leavesByParent: Record<string, { id: string; label: string; sort_order: number }[]> = {};
    for (const c of all) {
      if (c.parent_id !== null) {
        if (!leavesByParent[c.parent_id]) leavesByParent[c.parent_id] = [];
        leavesByParent[c.parent_id].push({
          id: c.id,
          label: pickText(c.name, locale),
          sort_order: c.sort_order ?? 99,
        });
      }
    }
    for (const pid of Object.keys(leavesByParent)) {
      leavesByParent[pid].sort(
        (a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label)
      );
    }

    return { parents, leavesByParent };
  }, [indexed, locale]);

  // Determine which parent to open: if value is a leaf, open its parent
  const initialParentId = useMemo(() => {
    if (!value || !indexed) return null;
    const leaf = indexed.categories[value] as { parent_id: string | null } | undefined;
    return leaf?.parent_id ?? null;
  }, [value, indexed]);

  const [openParentId, setOpenParentId] = useState<string | null>(initialParentId);

  function handleParentClick(pid: string) {
    if (openParentId === pid) {
      // Clicking the open parent collapses it (don't touch leaf selection)
      setOpenParentId(null);
    } else {
      setOpenParentId(pid);
      // If the currently selected leaf is NOT under this parent, clear it
      if (value !== null && indexed) {
        const leaf = indexed.categories[value] as { parent_id: string | null } | undefined;
        if (leaf?.parent_id !== pid) {
          onChange(null);
        }
      }
    }
  }

  function handleLeafClick(leafId: string) {
    onChange(leafId);
  }

  // Breadcrumb: "ParentName › LeafName"
  const breadcrumb = useMemo(() => {
    if (!value || !indexed) return null;
    const leaf = indexed.categories[value] as
      | { name: Record<string, string>; parent_id: string | null }
      | undefined;
    if (!leaf) return null;
    const leafLabel = pickText(leaf.name, locale);
    if (!leaf.parent_id) return null;
    const parent = indexed.categories[leaf.parent_id] as
      | { name: Record<string, string> }
      | undefined;
    if (!parent) return null;
    const parentLabel = pickText(parent.name, locale);
    return `${parentLabel} › ${leafLabel}`;
  }, [value, indexed, locale]);

  const currentLeaves = openParentId ? (leavesByParent[openParentId] ?? []) : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Parent chips row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {parents.map(({ id, label }) => {
          const isOpen = openParentId === id;
          // Ink-filled when: this parent is open OR the selected leaf belongs to it
          const leafBelongsHere =
            value !== null &&
            indexed &&
            (indexed.categories[value] as { parent_id: string | null } | undefined)?.parent_id === id;
          const isActive = isOpen || !!leafBelongsHere;

          return (
            <button
              key={id}
              data-chip
              aria-pressed={isActive}
              onClick={() => handleParentClick(id)}
              className="mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                background: isActive ? "var(--color-ink)" : "transparent",
                color: isActive ? "var(--color-cream)" : "var(--color-ink)",
                border: isActive
                  ? "1px solid var(--color-ink)"
                  : "1px solid var(--color-hair)",
                borderRadius: 3,
                padding: "6px 14px",
                fontSize: 14,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Leaf chips row (only shown when a parent is open) */}
      {openParentId && currentLeaves.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingLeft: 4 }}>
          {currentLeaves.map(({ id, label }) => {
            const selected = value === id;
            return (
              <button
                key={id}
                data-chip
                aria-pressed={selected}
                onClick={() => handleLeafClick(id)}
                className="mono"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: selected ? "var(--color-ink)" : "var(--color-cream)",
                  color: selected ? "var(--color-cream)" : "var(--color-ink)",
                  border: selected
                    ? "1px solid var(--color-ink)"
                    : "1px solid var(--color-hair)",
                  borderRadius: 3,
                  padding: "5px 12px",
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Breadcrumb */}
      {breadcrumb && (
        <div
          className="mono"
          style={{
            fontSize: 12,
            letterSpacing: "0.06em",
            color: "var(--color-clay)",
            marginTop: 2,
          }}
        >
          {breadcrumb}
        </div>
      )}
    </div>
  );
}
