"use client";

import { useState } from "react";
import { SectionHeader } from "@/components/store/shared/SectionHeader";
import { VariantCard } from "./VariantCard";
import { PhotoGallery } from "./PhotoGallery";
import { useAddVariant, usePatchVariant, useSetStock } from "@/lib/store-api/hooks";
import { useT } from "@/lib/i18n";
import type { StoreItem, StoreVariant, StoreItemImage } from "@/lib/store-api/types";

// Extend StoreVariant with the optional fields the API may return
type FullVariant = StoreVariant & {
  color_id?: string | null;
  material_id?: string | null;
  size_label?: string | null;
};

export function PricingSection({
  item,
  onChanged,
}: {
  item: StoreItem;
  onChanged: () => void;
}) {
  const { t } = useT();

  // Toggle is ON when item already has >1 variant, or user flipped it on
  const [variantsEnabled, setVariantsEnabled] = useState(
    (item.variants?.length ?? 1) > 1
  );

  const hasVariants = variantsEnabled;
  const variants = (item.variants ?? []) as FullVariant[];
  const defaultVariant: FullVariant | undefined =
    variants.find((v) => v.is_default) ?? variants[0];

  const addVariant = useAddVariant(item.id);
  const patchVariant = usePatchVariant(item.id);
  const setStock = useSetStock(item.id);

  // Group images by variant_id.
  // For single mode, include images with variant_id === defaultVariant.id OR null.
  function imagesForVariant(vid: string, includingNull = false): StoreItemImage[] {
    return (item.images ?? []).filter((img) =>
      includingNull
        ? img.variant_id === vid || img.variant_id === null
        : img.variant_id === vid
    );
  }

  function handleToggleOn() {
    setVariantsEnabled(true);
  }

  function handleToggleOff() {
    if (variants.length <= 1) {
      setVariantsEnabled(false);
    }
    // else: user needs to delete extra variants first (button is disabled)
  }

  function handleAddVariant() {
    addVariant.mutate({ sku: "", price: 0 }, { onSuccess: () => onChanged() });
  }

  // For single-product mode: SKU/price/stock triplet inline
  const [sku, setSku] = useState(defaultVariant?.sku ?? "");
  const [price, setPrice] = useState(String(defaultVariant?.price ?? 0));
  const [stock, setStock2] = useState(
    String(defaultVariant?.in_stock_current_shop ?? 0)
  );

  function handleSkuBlur() {
    if (!defaultVariant) return;
    if (sku !== defaultVariant.sku) {
      patchVariant.mutate(
        { vid: defaultVariant.id, body: { sku } },
        { onSuccess: () => onChanged() }
      );
    }
  }

  function handlePriceBlur() {
    if (!defaultVariant) return;
    const val = Number(price);
    if (!isNaN(val) && val !== defaultVariant.price) {
      patchVariant.mutate(
        { vid: defaultVariant.id, body: { price: val } },
        { onSuccess: () => onChanged() }
      );
    }
  }

  function handleStockBlur() {
    if (!defaultVariant) return;
    const val = Number(stock);
    if (!isNaN(val) && val !== defaultVariant.in_stock_current_shop) {
      setStock.mutate(
        { vid: defaultVariant.id, in_stock: val },
        { onSuccess: () => onChanged() }
      );
    }
  }

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

  const canTurnOffVariants = variants.length <= 1;

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeader
        kicker={t("store.itemform.pricing.kicker")}
        title={t("store.itemform.pricing.title")}
        rightAction={
          <VariantsToggle
            enabled={hasVariants}
            canTurnOff={canTurnOffVariants}
            onToggleOn={handleToggleOn}
            onToggleOff={handleToggleOff}
            label={t("store.itemform.toggle.variants")}
            disabledTooltip={t("store.itemform.toggle.off_disabled")}
          />
        }
      />

      {!hasVariants && defaultVariant && (
        <SingleProductView
          itemId={item.id}
          variant={defaultVariant}
          images={imagesForVariant(defaultVariant.id, true)}
          onChanged={onChanged}
          sku={sku}
          setSku={setSku}
          onSkuBlur={handleSkuBlur}
          price={price}
          setPrice={setPrice}
          onPriceBlur={handlePriceBlur}
          stock={stock}
          setStock={setStock2}
          onStockBlur={handleStockBlur}
          inputStyle={inputStyle}
          t={t}
        />
      )}

      {hasVariants && (
        <div>
          {variants.map((v, i) => (
            <VariantCard
              key={v.id}
              itemId={item.id}
              variant={v}
              images={imagesForVariant(v.id)}
              index={i}
              canRemove={variants.length > 1}
              isDefault={v.is_default}
              onChanged={onChanged}
            />
          ))}

          <button
            data-testid="add-variant-btn"
            onClick={handleAddVariant}
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "none",
              border: "1px dashed var(--color-clay)",
              borderRadius: 4,
              padding: "8px 16px",
              color: "var(--color-clay)",
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {t("store.itemform.add_variant")}
          </button>
        </div>
      )}
    </section>
  );
}

// ─── SingleProductView ────────────────────────────────────────────────────────

function SingleProductView({
  itemId,
  variant,
  images,
  onChanged,
  sku,
  setSku,
  onSkuBlur,
  price,
  setPrice,
  onPriceBlur,
  stock,
  setStock,
  onStockBlur,
  inputStyle,
  t,
}: {
  itemId: string;
  variant: FullVariant;
  images: StoreItemImage[];
  onChanged: () => void;
  sku: string;
  setSku: (v: string) => void;
  onSkuBlur: () => void;
  price: string;
  setPrice: (v: string) => void;
  onPriceBlur: () => void;
  stock: string;
  setStock: (v: string) => void;
  onStockBlur: () => void;
  inputStyle: React.CSSProperties;
  t: (k: string) => string;
}) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <PhotoGallery
          itemId={itemId}
          variantId={variant.id}
          images={images}
          max={4}
          onChanged={onChanged}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <FieldCol label={t("store.itemform.field.sku")}>
          <input
            data-testid="single-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            onBlur={onSkuBlur}
            style={inputStyle}
          />
        </FieldCol>
        <FieldCol label={t("store.itemform.field.price")}>
          <input
            data-testid="single-price"
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={onPriceBlur}
            style={inputStyle}
          />
        </FieldCol>
        <FieldCol label={t("store.itemform.field.stock")}>
          <input
            data-testid="single-stock"
            type="number"
            min={0}
            step={1}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            onBlur={onStockBlur}
            style={inputStyle}
          />
        </FieldCol>
      </div>
    </div>
  );
}

// ─── VariantsToggle ───────────────────────────────────────────────────────────

function VariantsToggle({
  enabled,
  canTurnOff,
  onToggleOn,
  onToggleOff,
  label,
  disabledTooltip,
}: {
  enabled: boolean;
  canTurnOff: boolean;
  onToggleOn: () => void;
  onToggleOff: () => void;
  label: string;
  disabledTooltip: string;
}) {
  return (
    <label
      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
      title={enabled && !canTurnOff ? disabledTooltip : undefined}
    >
      <input
        data-testid="variants-toggle"
        type="checkbox"
        checked={enabled}
        disabled={enabled && !canTurnOff}
        onChange={(e) => {
          if (e.target.checked) {
            onToggleOn();
          } else {
            onToggleOff();
          }
        }}
      />
      <span
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--color-clay)",
        }}
      >
        {label}
      </span>
    </label>
  );
}

// ─── FieldCol ─────────────────────────────────────────────────────────────────

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
