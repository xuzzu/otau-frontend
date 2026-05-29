"use client";
import { useItemEdit } from "./context";
import { useTaxonomy } from "@/lib/hooks/useTaxonomy";
import { useLocale, pickText } from "@/lib/i18n";
import {
  usePatchVariant,
  useDeleteVariant,
  useSetStock,
  useAddVariant,
  useUploadImage,
  useDeleteImage,
} from "@/lib/store-api/hooks";
import type { StoreVariant } from "@/lib/store-api/types";

const MAX_PHOTOS = 5;

export function VariantCard({ variant }: { variant: StoreVariant }) {
  const { item } = useItemEdit();
  const itemId = item!.id;
  const { indexed } = useTaxonomy();
  const locale = useLocale();
  const patchV = usePatchVariant(itemId);
  const delV = useDeleteVariant(itemId);
  const setStock = useSetStock(itemId);
  const upload = useUploadImage(itemId);
  const delImg = useDeleteImage(itemId);
  const colorOpts = Object.values(indexed?.colors ?? {});
  const photos = (item?.images ?? []).filter((im) => im.variant_id === variant.id);
  const selectedColor = indexed?.colors[variant.color_id ?? ""];

  return (
    <div style={{ border: "1px solid #E8DFD0", background: "#FBF8F2", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Color swatch + select */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {selectedColor && (
          <span style={{
            width: 18, height: 18, borderRadius: 2,
            background: selectedColor.hex,
            border: "1px solid rgba(26,22,18,.2)",
            flexShrink: 0,
          }} />
        )}
        <select
          aria-label="Color"
          value={variant.color_id ?? ""}
          onChange={(e) =>
            patchV.mutate({ vid: variant.id, body: { color_id: e.target.value || undefined } })
          }
          style={{ flex: 1, fontSize: 12, background: "transparent", border: "1px solid #E8DFD0", padding: "4px 6px" }}
        >
          <option value="">— no color —</option>
          {colorOpts.map((c) => (
            <option key={c.id} value={c.id}>
              {pickText(c.name, locale)}
            </option>
          ))}
        </select>
      </div>

      {/* SKU */}
      <div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase", marginBottom: 3 }}>SKU</div>
        <input
          aria-label="SKU"
          defaultValue={variant.sku}
          onBlur={(e) => patchV.mutate({ vid: variant.id, body: { sku: e.target.value } })}
          style={{ width: "100%", fontSize: 12, padding: "5px 8px", background: "#FBF8F2", border: "1px solid #E8DFD0", color: "#1A1612", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Price */}
      <div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase", marginBottom: 3 }}>Price · ₸</div>
        <input
          aria-label="Price"
          inputMode="numeric"
          defaultValue={variant.price}
          onBlur={(e) => patchV.mutate({ vid: variant.id, body: { price: Number(e.target.value) } })}
          style={{ width: "100%", fontSize: 12, padding: "5px 8px", background: "#FBF8F2", border: "1px solid #E8DFD0", color: "#1A1612", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* In stock */}
      <div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase", marginBottom: 3 }}>In stock</div>
        <input
          aria-label="In stock"
          inputMode="numeric"
          defaultValue={variant.in_stock_current_shop}
          onBlur={(e) => setStock.mutate({ vid: variant.id, in_stock: Number(e.target.value) })}
          style={{ width: "100%", fontSize: 12, padding: "5px 8px", background: "#FBF8F2", border: "1px solid #E8DFD0", color: "#1A1612", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Default radio + Remove */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, cursor: "pointer" }}>
          <input
            type="radio"
            name="default-variant"
            checked={variant.is_default}
            onChange={() => patchV.mutate({ vid: variant.id, body: { is_default: true } })}
          />
          Default
        </label>
        <button
          type="button"
          onClick={() => delV.mutate(variant.id)}
          className="mono"
          style={{ fontSize: 9, letterSpacing: "0.10em", color: "#B5532E", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          Remove
        </button>
      </div>

      {/* Per-variant photo grid */}
      <div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase", marginBottom: 5 }}>
          Photos · {photos.length}/{MAX_PHOTOS}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ position: "relative", aspectRatio: "1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <button
                type="button"
                aria-label="Delete photo"
                onClick={() => delImg.mutate(p.id)}
                style={{
                  position: "absolute", top: 2, right: 2,
                  width: 16, height: 16, lineHeight: "16px", textAlign: "center",
                  background: "rgba(26,22,18,.65)", color: "#FBF8F2",
                  border: "none", cursor: "pointer", fontSize: 10, padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label style={{
              aspectRatio: "1", border: "1.5px dashed #B8A98F",
              display: "grid", placeItems: "center", cursor: "pointer",
              fontSize: 18, color: "#9A8A72",
            }}>
              +
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload.mutate({ file: f, variant_id: variant.id });
                }}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export function AddVariantButton() {
  const { item } = useItemEdit();
  const add = useAddVariant(item!.id);
  return (
    <button
      type="button"
      onClick={() => add.mutate({ sku: `${item!.slug}-${Date.now()}`, price: 0 })}
      style={{
        aspectRatio: "1", border: "1.5px dashed #B8A98F",
        minHeight: 88, background: "#FBF8F2",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 4, cursor: "pointer", color: "#5B5043",
      }}
    >
      <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 24, color: "#9A8A72" }}>+</span>
      <span className="mono" style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>variant</span>
    </button>
  );
}
