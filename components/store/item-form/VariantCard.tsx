"use client";

import { useRef, useState } from "react";
import { usePatchVariant, useDeleteVariant, useSetStock } from "@/lib/store-api/hooks";
import { TaxonomySelect } from "./TaxonomyPicker";
import { PhotoGallery } from "./PhotoGallery";
import { useT } from "@/lib/i18n";
import type { StoreVariant, StoreItemImage } from "@/lib/store-api/types";

export function VariantCard({
  itemId,
  variant,
  images,
  index,
  canRemove,
  isDefault,
  onChanged,
}: {
  itemId: string;
  variant: StoreVariant & {
    color_id?: string | null;
    material_id?: string | null;
    size_label?: string | null;
  };
  images: StoreItemImage[];
  index: number;
  canRemove: boolean;
  isDefault: boolean;
  onChanged: () => void;
}) {
  const { t } = useT();
  const patchVariant = usePatchVariant(itemId);
  const deleteVariant = useDeleteVariant(itemId);
  const setStock = useSetStock(itemId);

  // Local editable state (patched on blur for text fields)
  const [sku, setSku] = useState(variant.sku ?? "");
  const [price, setPrice] = useState(String(variant.price ?? 0));
  const [stock, setStock2] = useState(String(variant.in_stock_current_shop ?? 0));
  const [sizeLabel, setSizeLabel] = useState(
    (variant as { size_label?: string | null }).size_label ?? ""
  );

  const inputStyle: React.CSSProperties = {
    fontFamily: "var(--font-geist-sans)",
    fontSize: 13,
    color: "var(--color-ink)",
    background: "var(--color-cream)",
    border: "1px solid var(--color-hair)",
    borderRadius: 4,
    padding: "5px 8px",
    width: "100%",
    boxSizing: "border-box",
  };

  function handleSetDefault() {
    if (!isDefault) {
      patchVariant.mutate(
        { vid: variant.id, body: { is_default: true } },
        { onSuccess: () => onChanged() }
      );
    }
  }

  function handleRemove() {
    if (canRemove) {
      deleteVariant.mutate(variant.id, { onSuccess: () => onChanged() });
    }
  }

  function handleColorChange(id: string | null) {
    patchVariant.mutate(
      { vid: variant.id, body: { color_id: id ?? undefined } },
      { onSuccess: () => onChanged() }
    );
  }

  function handleMaterialChange(id: string | null) {
    patchVariant.mutate(
      { vid: variant.id, body: { material_id: id ?? undefined } },
      { onSuccess: () => onChanged() }
    );
  }

  function handleSkuBlur() {
    if (sku !== variant.sku) {
      patchVariant.mutate(
        { vid: variant.id, body: { sku } },
        { onSuccess: () => onChanged() }
      );
    }
  }

  function handlePriceBlur() {
    const val = Number(price);
    if (!isNaN(val) && val !== variant.price) {
      patchVariant.mutate(
        { vid: variant.id, body: { price: val } },
        { onSuccess: () => onChanged() }
      );
    }
  }

  function handleStockBlur() {
    const val = Number(stock);
    if (!isNaN(val) && val !== variant.in_stock_current_shop) {
      setStock.mutate(
        { vid: variant.id, in_stock: val },
        { onSuccess: () => onChanged() }
      );
    }
  }

  function handleSizeLabelBlur() {
    const current = (variant as { size_label?: string | null }).size_label ?? "";
    if (sizeLabel !== current) {
      patchVariant.mutate(
        { vid: variant.id, body: { size_label: sizeLabel } },
        { onSuccess: () => onChanged() }
      );
    }
  }

  return (
    <div
      data-testid={`variant-card-${variant.id}`}
      style={{
        border: `1px solid ${isDefault ? "var(--color-ink)" : "var(--color-hair)"}`,
        borderRadius: 8,
        padding: 20,
        marginBottom: 16,
        background: "var(--color-cream)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h3
            className="serif"
            style={{ fontSize: 20, margin: 0, lineHeight: 1 }}
          >
            {t("store.itemform.variant.title", { n: String(index + 1) })}
          </h3>

          {/* Default radio */}
          {isDefault ? (
            <span
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                background: "var(--color-ink)",
                color: "var(--color-cream)",
                borderRadius: 3,
                padding: "2px 6px",
              }}
            >
              {t("store.itemform.variant.default")}
            </span>
          ) : (
            <button
              aria-label={t("store.itemform.variant.set_default")}
              onClick={handleSetDefault}
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                background: "none",
                border: "1px dashed var(--color-clay)",
                borderRadius: 3,
                padding: "2px 6px",
                color: "var(--color-clay)",
                cursor: "pointer",
              }}
            >
              {t("store.itemform.variant.set_default")}
            </button>
          )}
        </div>

        {/* Remove button */}
        <button
          aria-label={t("store.itemform.variant.remove")}
          onClick={handleRemove}
          disabled={!canRemove}
          style={{
            background: "none",
            border: "none",
            color: canRemove ? "var(--color-clay)" : "var(--color-hair)",
            cursor: canRemove ? "pointer" : "not-allowed",
            fontSize: 18,
            lineHeight: 1,
            padding: "2px 4px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Colour, Material, Size row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <FieldCol label={t("store.itemform.field.color")}>
          <TaxonomySelect
            kind="colors"
            value={(variant as { color_id?: string | null }).color_id ?? null}
            onChange={handleColorChange}
            allowNone
          />
        </FieldCol>
        <FieldCol label={t("store.itemform.field.material")}>
          <TaxonomySelect
            kind="materials"
            value={(variant as { material_id?: string | null }).material_id ?? null}
            onChange={handleMaterialChange}
            allowNone
          />
        </FieldCol>
        <FieldCol label={t("store.itemform.field.size")}>
          <input
            data-testid={`size-label-${variant.id}`}
            value={sizeLabel}
            onChange={(e) => setSizeLabel(e.target.value)}
            onBlur={handleSizeLabelBlur}
            style={inputStyle}
            placeholder="S / M / 160×80…"
          />
        </FieldCol>
      </div>

      {/* Photos */}
      <div style={{ marginBottom: 16 }}>
        <PhotoGallery
          itemId={itemId}
          variantId={variant.id}
          images={images}
          max={4}
          onChanged={onChanged}
        />
      </div>

      {/* SKU / Price / Stock row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FieldCol label={t("store.itemform.field.sku")}>
          <input
            data-testid={`sku-${variant.id}`}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onBlur={handleSkuBlur}
            style={inputStyle}
          />
        </FieldCol>
        <FieldCol label={t("store.itemform.field.price")}>
          <input
            data-testid={`price-${variant.id}`}
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={handlePriceBlur}
            style={inputStyle}
          />
        </FieldCol>
        <FieldCol label={t("store.itemform.field.stock")}>
          <input
            data-testid={`stock-${variant.id}`}
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock2(e.target.value)}
            onBlur={handleStockBlur}
            style={inputStyle}
          />
        </FieldCol>
      </div>
    </div>
  );
}

// ─── helper ───────────────────────────────────────────────────────────────────

function FieldCol({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-clay)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}
