"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useCreateItem, useDeleteItem, useArchiveItem, useRestoreItem,
  usePatchItem, useAddVariant, useDeleteVariant, usePromotions,
} from "@/lib/store-api/hooks";
import { VariantStockEditor } from "./VariantStockEditor";
import { ImageEditor } from "./ImageEditor";
import type { StoreItem } from "@/lib/store-api/types";
import { useT } from "@/lib/i18n";

type Props =
  | { mode: "create"; item?: undefined }
  | { mode: "edit"; item: StoreItem };

// Inner component for edit-only sections that need hooks unconditionally
function EditSections({ item }: { item: StoreItem }) {
  const addVariant = useAddVariant(item.id);
  const delVariant = useDeleteVariant(item.id);
  const promos = usePromotions("active");
  const activeForThisItem = (promos.data ?? []).filter((p) => p.item_id === item.id);

  return (
    <>
      <section style={{ borderBottom: "1px dashed var(--color-hair)", padding: "8px 0" }}>
        <SectionLabel>Variants &amp; stock (this shop)</SectionLabel>
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">SKU</th>
              <th align="left">Price</th>
              <th align="left">In stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {item.variants.map((v) => (
              <tr key={v.id}>
                <td>{v.sku}{v.is_default ? " ★" : ""}</td>
                <td>{v.price}</td>
                <td><VariantStockEditor item_id={item.id} variant={v} /></td>
                <td>
                  {item.variants.length > 1 && (
                    <button onClick={() => delVariant.mutate(v.id)}>✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <NewVariantInline addVariant={addVariant} />
      </section>

      <section style={{ borderBottom: "1px dashed var(--color-hair)", padding: "8px 0" }}>
        <SectionLabel>Images</SectionLabel>
        <ImageEditor
          item_id={item.id}
          images={item.images ?? []}
          mainUrl={item.main_image_url}
        />
      </section>

      <section style={{ borderBottom: "1px dashed var(--color-hair)", padding: "8px 0" }}>
        <SectionLabel>Promotion (this shop)</SectionLabel>
        {activeForThisItem.length === 0 ? (
          <Link href={`/store/promotions/new?item_id=${item.id}`}>+ Add promotion</Link>
        ) : (
          <ul>
            {activeForThisItem.map((p) => (
              <li key={p.id}>
                {p.discount_kind === "percent"
                  ? `-${(p.discount_value / 100).toFixed(2)}%`
                  : `-${p.discount_value} ₸`} · until {p.ends_at ?? "no end"}
                <Link href={`/store/promotions/${p.id}/edit`} style={{ marginLeft: 8 }}>edit</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

// Inner component for edit-only action buttons
function EditActions({ item }: { item: StoreItem }) {
  const router = useRouter();
  const archive = useArchiveItem(item.id);
  const restore = useRestoreItem(item.id);
  const del = useDeleteItem(item.id);

  return (
    <>
      {item.status !== "archived" && (
        <button onClick={() => archive.mutate()} style={btnGhost}>Archive</button>
      )}
      {item.status === "archived" && (
        <button onClick={() => restore.mutate()} style={btnGhost}>Restore</button>
      )}
      {item.status === "draft" && (
        <button
          onClick={async () => { await del.mutateAsync(); router.replace("/store/catalog"); }}
          style={{ ...btnGhost, color: "#a64545" }}
        >Delete</button>
      )}
    </>
  );
}

export function ItemForm(props: Props) {
  const { t } = useT();
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const [name, setName] = useState(isEdit ? props.item.name : "");
  const [slug, setSlug] = useState(isEdit ? props.item.slug : "");
  const [category_id, setCategoryId] = useState(isEdit ? props.item.category_id : "");
  const [description, setDescription] = useState<Record<string, string>>(
    isEdit ? props.item.description : { kz: "", ru: "" }
  );

  const create = useCreateItem();
  const patch = usePatchItem(isEdit ? props.item.id : "");

  const handleSave = async () => {
    if (isEdit) {
      await patch.mutateAsync({ name, slug, description, category_id });
    } else {
      const created = await create.mutateAsync({
        slug, name, description, category_id, default_variant_sku: `${slug}-default`,
      });
      router.replace(`/store/catalog/${created.id}/edit`);
    }
  };

  const handlePreview = async () => {
    await handleSave();
    window.open(`/catalog/${encodeURIComponent(slug)}?preview=1`, "_blank");
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <section style={{ borderBottom: "1px dashed var(--color-hair)", padding: "8px 0" }}>
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Slug">
          <input value={slug} onChange={(e) => setSlug(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Category id">
          <input value={category_id} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle} placeholder="cat-..." />
        </Field>
        <Field label="Desc · kz">
          <textarea
            value={description.kz ?? ""}
            onChange={(e) => setDescription({ ...description, kz: e.target.value })}
            style={{ ...inputStyle, height: 60 }}
          />
        </Field>
        <Field label="Desc · ru">
          <textarea
            value={description.ru ?? ""}
            onChange={(e) => setDescription({ ...description, ru: e.target.value })}
            style={{ ...inputStyle, height: 60 }}
          />
        </Field>
      </section>

      {isEdit && <EditSections item={props.item} />}

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={handleSave} style={btnPrimary}>{t("store.save")}</button>
        <button onClick={handlePreview} style={btnGhost}>{t("store.preview")} ↗</button>
        {isEdit && <EditActions item={props.item} />}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "4px 8px", border: "1px solid var(--color-hair)",
  background: "white", fontFamily: "inherit", fontSize: 13,
};
const btnPrimary: React.CSSProperties = {
  padding: "6px 14px", background: "var(--color-ink)", color: "var(--color-paper)",
  border: 0, cursor: "pointer", fontSize: 13,
};
const btnGhost: React.CSSProperties = {
  padding: "6px 14px", background: "transparent", color: "var(--color-ink)",
  border: "1px solid var(--color-ink)", cursor: "pointer", fontSize: 13,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, alignItems: "center", padding: "3px 0" }}>
      <span style={{ fontSize: 11, color: "var(--color-rust, #9A8A72)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "var(--color-rust, #6b5d44)", textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </div>
  );
}

function NewVariantInline({ addVariant }: { addVariant: ReturnType<typeof useAddVariant> }) {
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState(0);
  return (
    <div style={{ display: "flex", gap: 6, padding: "4px 0" }}>
      <input placeholder="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
      <input placeholder="price" type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <button onClick={() => { if (sku) { addVariant.mutate({ sku, price }); setSku(""); setPrice(0); } }}>
        + Add variant
      </button>
    </div>
  );
}
