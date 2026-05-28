"use client";

import { useMemo, useRef, useState } from "react";
import { useTaxonomy } from "@/lib/hooks/useTaxonomy";
import { useLocale, pickText } from "@/lib/i18n";
import type { Taxonomy } from "@/lib/api/catalog";

// ─── shared types ─────────────────────────────────────────────────────────────

type SingleKind = "categories" | "roomTypes" | "colors" | "materials";
type MultiKind = "styles" | "materials";

// ─── TaxonomySelect ────────────────────────────────────────────────────────────

export function TaxonomySelect({
  kind,
  value,
  onChange,
  allowNone = false,
}: {
  kind: SingleKind;
  value: string | null;
  onChange: (id: string | null) => void;
  allowNone?: boolean;
}) {
  const locale = useLocale();
  const { indexed } = useTaxonomy();

  const entries = useMemo<{ id: string; label: string; hex?: string }[]>(() => {
    if (!indexed) return [];
    // indexed[kind] is the right record map for any SingleKind
    const map = indexed[kind] as Record<string, { id: string; name: Record<string, string>; hex?: string }>;
    return Object.values(map).map((rec) => ({
      id: rec.id,
      label: pickText(rec.name, locale),
      hex: rec.hex,
    }));
  }, [indexed, kind, locale]);

  const isColors = kind === "colors";

  // Current hex (for the selected swatch)
  const selectedHex = isColors && value && indexed
    ? (indexed.colors[value] as { hex?: string } | undefined)?.hex
    : undefined;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Swatch for the currently selected colour */}
      {isColors && selectedHex && (
        <span
          aria-hidden="true"
          data-testid="selected-swatch"
          style={{
            display: "inline-block",
            width: 16,
            height: 16,
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
          fontSize: 13,
          color: "var(--color-ink)",
          background: "var(--color-cream)",
          border: "1px solid var(--color-hair)",
          borderRadius: 4,
          padding: "5px 8px",
          cursor: "pointer",
          flex: 1,
        }}
      >
        {allowNone && (
          <option value="">— нет —</option>
        )}
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
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  // All records for this kind
  const allEntries = useMemo<{ id: string; label: string }[]>(() => {
    if (!indexed) return [];
    const map = indexed[kind] as Record<string, { id: string; name: Record<string, string> }>;
    return Object.values(map).map((rec) => ({
      id: rec.id,
      label: pickText(rec.name, locale),
    }));
  }, [indexed, kind, locale]);

  // Remaining (not yet selected) + filtered by search
  const remaining = useMemo(
    () =>
      allEntries.filter(
        (e) =>
          !value.includes(e.id) &&
          e.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [allEntries, value, search],
  );

  function addId(id: string) {
    onChange([...value, id]);
    setSearch("");
    setOpen(false);
  }

  function removeId(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  const labelFor = (id: string) =>
    allEntries.find((e) => e.id === id)?.label ?? id;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
      {/* Selected chips */}
      {value.map((id) => (
        <span
          key={id}
          className="mono"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "var(--color-ink)",
            color: "var(--color-cream)",
            borderRadius: 3,
            padding: "3px 8px",
            fontSize: 11,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}
        >
          {labelFor(id)}
          <button
            aria-label={`Убрать ${labelFor(id)}`}
            onClick={() => removeId(id)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-cream)",
              cursor: "pointer",
              padding: 0,
              fontSize: 13,
              lineHeight: 1,
              opacity: 0.7,
            }}
          >
            ×
          </button>
        </span>
      ))}

      {/* "+ add" trigger */}
      <div style={{ position: "relative" }}>
        <button
          aria-label="Добавить"
          onClick={() => setOpen((v) => !v)}
          className="mono"
          style={{
            background: "none",
            border: "1px dashed var(--color-clay)",
            borderRadius: 3,
            padding: "3px 10px",
            fontSize: 11,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "var(--color-clay)",
            cursor: "pointer",
          }}
        >
          + добавить
        </button>

        {open && (
          <div
            ref={popoverRef}
            role="listbox"
            aria-label={`Выбор ${kind}`}
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              zIndex: 40,
              background: "var(--color-cream)",
              border: "1px solid var(--color-hair)",
              borderRadius: 6,
              padding: 8,
              minWidth: 200,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <input
              autoFocus
              type="text"
              placeholder="Поиск…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: 12,
                width: "100%",
                border: "none",
                borderBottom: "1px solid var(--color-hair)",
                background: "transparent",
                padding: "4px 2px 6px",
                outline: "none",
                marginBottom: 6,
                boxSizing: "border-box",
              }}
            />
            <div style={{ maxHeight: 180, overflowY: "auto" }}>
              {remaining.length === 0 ? (
                <div
                  className="mono"
                  style={{ fontSize: 11, color: "var(--color-clay)", padding: "4px 2px" }}
                >
                  Нет вариантов
                </div>
              ) : (
                remaining.map((e) => (
                  <button
                    key={e.id}
                    role="option"
                    aria-selected={false}
                    onClick={() => addId(e.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "5px 6px",
                      fontFamily: "var(--font-geist-sans)",
                      fontSize: 13,
                      cursor: "pointer",
                      borderRadius: 3,
                      color: "var(--color-ink)",
                    }}
                  >
                    {e.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
