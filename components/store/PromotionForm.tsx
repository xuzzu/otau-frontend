"use client";
import { useState } from "react";
import { useCreatePromotion, usePatchPromotion } from "@/lib/store-api/hooks";
import type { Promotion, PromotionScope, PromotionDiscountKind } from "@/lib/store-api/types";

type Props =
  | { mode: "create"; initial?: { item_id?: string } }
  | { mode: "edit"; promotion: Promotion };

export function PromotionForm(props: Props) {
  const isEdit = props.mode === "edit";
  const [scope, setScope] = useState<PromotionScope>(isEdit ? props.promotion.scope : "item");
  const [item_id, setItemId] = useState(isEdit ? props.promotion.item_id : props.initial?.item_id ?? "");
  const [variant_id, setVariantId] = useState(isEdit ? props.promotion.variant_id ?? "" : "");
  const [kind, setKind] = useState<PromotionDiscountKind>(isEdit ? props.promotion.discount_kind : "percent");
  const [value, setValue] = useState(isEdit ? props.promotion.discount_value : 1500);
  const [starts_at, setStartsAt] = useState(isEdit ? props.promotion.starts_at : "");
  const [ends_at, setEndsAt] = useState(isEdit ? (props.promotion.ends_at ?? "") : "");
  const [nonExpiring, setNonExpiring] = useState(isEdit ? props.promotion.ends_at == null : false);

  const create = useCreatePromotion();
  const patch = isEdit ? usePatchPromotion(props.promotion.id) : null;

  const submit = async () => {
    const body = {
      scope, item_id, variant_id: scope === "variant" ? variant_id : undefined,
      discount_kind: kind, discount_value: value,
      starts_at: starts_at || undefined,
      ends_at: nonExpiring ? null : (ends_at || undefined),
    };
    if (isEdit) await patch!.mutateAsync(body);
    else await create.mutateAsync(body as any);
  };

  return (
    <div style={{ maxWidth: 480 }}>
      <Row label="Scope">
        <label><input type="radio" checked={scope === "item"}     onChange={() => setScope("item")} /> item (all variants)</label>{" "}
        <label><input type="radio" checked={scope === "variant"}  onChange={() => setScope("variant")} /> variant</label>
      </Row>
      <Row label="Item id"><input value={item_id} onChange={(e) => setItemId(e.target.value)} /></Row>
      {scope === "variant" && <Row label="Variant id"><input value={variant_id} onChange={(e) => setVariantId(e.target.value)} /></Row>}
      <Row label="Discount">
        <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} style={{ width: 100 }} />
        <select value={kind} onChange={(e) => setKind(e.target.value as PromotionDiscountKind)}>
          <option value="percent">%·bp (1500 = 15%)</option>
          <option value="absolute">₸ off (minor)</option>
        </select>
      </Row>
      <Row label="Starts at"><input type="datetime-local" value={starts_at.slice(0, 16)} onChange={(e) => setStartsAt(e.target.value)} /></Row>
      <Row label="Ends at">
        <label><input type="checkbox" checked={nonExpiring} onChange={(e) => setNonExpiring(e.target.checked)} /> Non-expiring</label>
        {!nonExpiring && <input type="datetime-local" value={ends_at.slice(0, 16)} onChange={(e) => setEndsAt(e.target.value)} style={{ marginLeft: 8 }} />}
      </Row>
      <button onClick={submit} style={{ padding: "6px 14px", marginTop: 12, background: "var(--color-ink)", color: "var(--color-paper)" }}>
        Save
      </button>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, padding: "4px 0" }}><span style={{ fontSize: 11, color: "var(--color-rust)" }}>{label}</span>{children}</div>;
}
