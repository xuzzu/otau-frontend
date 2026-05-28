"use client";

import { SectionHeader } from "@/components/store/shared/SectionHeader";
import { TaxonomySelect, TaxonomyChips, CategoryPicker } from "./TaxonomyPicker";
import { useT } from "@/lib/i18n";

export type BasicsValue = {
  name: string;
  category_id: string;
  room_target_id: string | null;
  style_ids: string[];
  material_ids: string[];
  description: Record<string, string>;
  dims: { w?: number; d?: number; h?: number };
  weight_kg: number | null;
};

export function BasicsSection({
  value,
  onChange,
}: {
  value: BasicsValue;
  onChange: (patch: Partial<BasicsValue>) => void;
}) {
  const { t } = useT();

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: 15,
    color: "var(--color-ink)",
    background: "var(--color-cream)",
    border: "1px solid var(--color-hair)",
    borderRadius: 4,
    padding: "10px 11px",
    width: "100%",
    boxSizing: "border-box",
  };

  const dimInputStyle: React.CSSProperties = {
    ...inputStyle,
    width: 88,
  };

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeader
        kicker={t("store.itemform.basics.kicker")}
        title={t("store.itemform.basics.title")}
      />

      {/* Name — full width */}
      <FieldRow label={t("store.itemform.field.name")}>
        <input
          data-testid="basics-name"
          value={value.name}
          onChange={(e) => onChange({ name: e.target.value })}
          style={inputStyle}
          placeholder="Диван Aspara · лён"
        />
      </FieldRow>

      {/* Category — full width (chip block) */}
      <FieldRow label={t("store.itemform.field.category")} required>
        <CategoryPicker
          value={value.category_id || null}
          onChange={(id) => onChange({ category_id: id ?? "" })}
        />
      </FieldRow>

      {/* Room — half width */}
      <FieldRow label={t("store.itemform.field.room")}>
        <div style={{ maxWidth: 400 }}>
          <TaxonomySelect
            kind="roomTypes"
            value={value.room_target_id}
            onChange={(id) => onChange({ room_target_id: id })}
            allowNone
          />
        </div>
      </FieldRow>

      {/* Styles — full width (chips) */}
      <FieldRow label={t("store.itemform.field.styles")}>
        <TaxonomyChips
          kind="styles"
          value={value.style_ids}
          onChange={(ids) => onChange({ style_ids: ids })}
        />
      </FieldRow>

      {/* Materials — full width (chips) */}
      <FieldRow label={t("store.itemform.field.materials")}>
        <TaxonomyChips
          kind="materials"
          value={value.material_ids}
          onChange={(ids) => onChange({ material_ids: ids })}
        />
      </FieldRow>

      {/* Description kz / ru — 2-column side-by-side */}
      <FieldRow label={t("store.itemform.field.desc_kz") + " / " + t("store.itemform.field.desc_ru")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-clay)",
              }}
            >
              {t("store.itemform.field.desc_kz")}
            </span>
            <textarea
              data-testid="basics-desc-kz"
              value={value.description.kz ?? ""}
              onChange={(e) =>
                onChange({ description: { ...value.description, kz: e.target.value } })
              }
              style={{ ...inputStyle, height: 88, resize: "vertical" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-clay)",
              }}
            >
              {t("store.itemform.field.desc_ru")}
            </span>
            <textarea
              data-testid="basics-desc-ru"
              value={value.description.ru ?? ""}
              onChange={(e) =>
                onChange({ description: { ...value.description, ru: e.target.value } })
              }
              style={{ ...inputStyle, height: 88, resize: "vertical" }}
            />
          </div>
        </div>
      </FieldRow>

      {/* Dimensions row */}
      <FieldRow label={t("store.itemform.field.dims")}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <DimInput
            label={t("store.itemform.dim.w")}
            value={value.dims.w}
            onChange={(v) => onChange({ dims: { ...value.dims, w: v } })}
            style={dimInputStyle}
          />
          <DimInput
            label={t("store.itemform.dim.d")}
            value={value.dims.d}
            onChange={(v) => onChange({ dims: { ...value.dims, d: v } })}
            style={dimInputStyle}
          />
          <DimInput
            label={t("store.itemform.dim.h")}
            value={value.dims.h}
            onChange={(v) => onChange({ dims: { ...value.dims, h: v } })}
            style={dimInputStyle}
          />
        </div>
      </FieldRow>

      {/* Weight */}
      <FieldRow label={t("store.itemform.field.weight")}>
        <input
          data-testid="basics-weight"
          type="number"
          min={0}
          step={0.1}
          value={value.weight_kg ?? ""}
          onChange={(e) =>
            onChange({ weight_kg: e.target.value === "" ? null : Number(e.target.value) })
          }
          style={{ ...dimInputStyle, width: 120 }}
        />
      </FieldRow>
    </section>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        gap: 16,
        alignItems: "start",
        marginBottom: 18,
      }}
    >
      <span
        className="mono"
        style={{
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-clay)",
          paddingTop: 11,
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: "var(--color-ink)", marginLeft: 2 }}>
            *
          </span>
        )}
      </span>
      <div>{children}</div>
    </div>
  );
}

function DimInput({
  label,
  value,
  onChange,
  style,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  style: React.CSSProperties;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        className="mono"
        style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-clay)" }}
      >
        {label}
      </span>
      <input
        type="number"
        min={0}
        step={1}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : Number(e.target.value))
        }
        style={style}
      />
    </label>
  );
}
