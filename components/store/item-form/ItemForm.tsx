"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BasicsSection, type BasicsValue } from "./BasicsSection";
import { PricingSection } from "./PricingSection";
import { SectionHeader } from "@/components/store/shared/SectionHeader";
import {
  useCreateItem,
  usePatchItem,
  usePublishItem,
  useUnpublishItem,
  useArchiveItem,
  useRestoreItem,
  useDeleteItem,
} from "@/lib/store-api/hooks";
import { useT } from "@/lib/i18n";
import type { StoreItem } from "@/lib/store-api/types";

type Props =
  | { mode: "create"; item?: undefined }
  | { mode: "edit"; item: StoreItem };

// ─── helpers ──────────────────────────────────────────────────────────────────

const CYRILLIC_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  // Kazakh extras
  ә: "a", ғ: "g", қ: "k", ң: "n", ө: "o", ұ: "u", ү: "u", і: "i",
};

export function slugify(name: string): string {
  const transliterated = name
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC_MAP[ch] ?? ch)
    .join("");

  const slug = transliterated
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug.length > 0 ? slug : `item-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── create-mode starting price block ─────────────────────────────────────────

function StartingPriceBlock({
  sku,
  setSku,
  price,
  setPrice,
  t,
}: {
  sku: string;
  setSku: (v: string) => void;
  price: number;
  setPrice: (v: number) => void;
  t: (k: string) => string;
}) {
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

  return (
    <section style={{ marginBottom: 40 }}>
      <SectionHeader
        kicker="03 · SKU & Цена"
        title={t("store.itemform.starting_price.title")}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          maxWidth: 400,
        }}
      >
        <FieldCol label={t("store.itemform.field.sku")}>
          <input
            data-testid="starting-sku"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            style={inputStyle}
            placeholder="my-sofa-01"
          />
        </FieldCol>
        <FieldCol label={t("store.itemform.field.price")}>
          <input
            data-testid="starting-price"
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            style={inputStyle}
          />
        </FieldCol>
      </div>
    </section>
  );
}

// ─── publish checklist ─────────────────────────────────────────────────────────

function getClientMissing(item: StoreItem): string[] {
  const missing: string[] = [];
  if (!item.name?.trim()) missing.push("name");
  if (!item.category_id) missing.push("category");
  if (!item.images?.length) missing.push("image");
  for (const v of item.variants ?? []) {
    if (!v.price || v.price <= 0) missing.push(`variant:${v.id}:price`);
    if (!v.sku?.trim()) missing.push(`variant:${v.id}:sku`);
  }
  return missing;
}

function missingLabel(key: string, t: (k: string) => string): string {
  if (key === "name") return t("store.itemform.publish.missing.name");
  if (key === "category") return t("store.itemform.publish.missing.category");
  if (key === "image") return t("store.itemform.publish.missing.image");
  if (key.endsWith(":price")) return t("store.itemform.publish.missing.variant_price");
  if (key.endsWith(":sku")) return t("store.itemform.publish.missing.variant_sku");
  return key;
}

function PublishChecklist({ missing, t }: { missing: string[]; t: (k: string) => string }) {
  if (!missing.length) return null;
  return (
    <div
      role="alert"
      className="mono"
      style={{
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "var(--color-clay)",
        background: "rgba(0,0,0,0.03)",
        border: "1px dashed var(--color-clay)",
        borderRadius: 6,
        padding: "10px 14px",
        marginTop: 10,
      }}
    >
      <div
        style={{
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          marginBottom: 6,
          color: "var(--color-ink)",
        }}
      >
        {t("store.itemform.publish.checklist_title")}
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {missing.map((k) => (
          <li key={k} style={{ marginBottom: 3 }}>
            · {missingLabel(k, t)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── action buttons ────────────────────────────────────────────────────────────

const btnPrimary: React.CSSProperties = {
  padding: "8px 20px",
  background: "var(--color-ink)",
  color: "var(--color-cream)",
  border: 0,
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "var(--font-geist-sans)",
  borderRadius: 4,
};

const btnGhost: React.CSSProperties = {
  padding: "8px 20px",
  background: "transparent",
  color: "var(--color-ink)",
  border: "1px solid var(--color-ink)",
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "var(--font-geist-sans)",
  borderRadius: 4,
};

const btnDanger: React.CSSProperties = {
  ...btnGhost,
  color: "var(--color-terracotta, #b94f40)",
  border: "1px solid var(--color-terracotta, #b94f40)",
};

// ─── main component ────────────────────────────────────────────────────────────

export function ItemForm(props: Props) {
  const { t } = useT();
  const router = useRouter();

  // Initial basics state
  const initialBasics: BasicsValue = props.mode === "edit"
    ? {
        name: props.item.name,
        category_id: props.item.category_id,
        room_target_id: props.item.room_target_id ?? null,
        style_ids: props.item.style_ids ?? [],
        material_ids: props.item.material_ids ?? [],
        description: { kz: "", ru: "", ...(props.item.description ?? {}) },
        dims: (props.item.dims ?? {}) as BasicsValue["dims"],
        weight_kg: props.item.weight_kg ?? null,
      }
    : {
        name: "",
        category_id: "",
        room_target_id: null,
        style_ids: [],
        material_ids: [],
        description: { kz: "", ru: "" },
        dims: {},
        weight_kg: null,
      };

  const [basics, setBasics] = useState<BasicsValue>(initialBasics);
  const [startingSku, setStartingSku] = useState("");
  const [startingPrice, setStartingPrice] = useState(0);

  // Publish error state (from API 422)
  const [publishMissing, setPublishMissing] = useState<string[]>([]);

  const create = useCreateItem();
  const patch = usePatchItem(props.mode === "edit" ? props.item.id : "");
  const publish = usePublishItem(props.mode === "edit" ? props.item.id : "");
  const unpublish = useUnpublishItem(props.mode === "edit" ? props.item.id : "");
  const archive = useArchiveItem(props.mode === "edit" ? props.item.id : "");
  const restore = useRestoreItem(props.mode === "edit" ? props.item.id : "");
  const del = useDeleteItem(props.mode === "edit" ? props.item.id : "");

  // ─── save draft (create mode) ──────────────────────────────────────────────

  const canSaveDraft = basics.name.trim().length > 0 && basics.category_id.length > 0;

  async function handleSaveDraft() {
    const slug = slugify(basics.name);
    const created = await create.mutateAsync({
      slug,
      name: basics.name,
      description: basics.description,
      category_id: basics.category_id,
      room_target_id: basics.room_target_id ?? undefined,
      dims: basics.dims,
      weight_kg: basics.weight_kg ?? undefined,
      style_ids: basics.style_ids,
      material_ids: basics.material_ids,
      color_ids: [],
      default_variant_sku: startingSku || undefined,
      default_variant_price: startingPrice,
    });
    router.replace(`/store/catalog/${created.id}/edit`);
  }

  // ─── save (edit mode) ─────────────────────────────────────────────────────

  function derivedColorIds(): string[] {
    if (props.mode !== "edit") return [];
    const ids: string[] = [];
    for (const v of props.item.variants ?? []) {
      if (v.color_id && !ids.includes(v.color_id)) ids.push(v.color_id);
    }
    return ids;
  }

  function derivedMaterialIds(): string[] {
    if (props.mode !== "edit") return basics.material_ids;
    const ids = [...basics.material_ids];
    for (const v of props.item.variants ?? []) {
      if (v.material_id && !ids.includes(v.material_id)) ids.push(v.material_id);
    }
    return ids;
  }

  async function handleSave() {
    if (props.mode !== "edit") return;
    const patchBody: Parameters<typeof patch.mutateAsync>[0] = {
      name: basics.name,
      description: basics.description,
      category_id: basics.category_id,
      dims: basics.dims,
      style_ids: basics.style_ids,
      material_ids: derivedMaterialIds(),
      color_ids: derivedColorIds(),
    };
    if (basics.room_target_id !== null) {
      patchBody.room_target_id = basics.room_target_id;
    }
    if (basics.weight_kg !== null) {
      patchBody.weight_kg = basics.weight_kg;
    }
    await patch.mutateAsync(patchBody);
  }

  // ─── publish ──────────────────────────────────────────────────────────────

  const clientMissing = props.mode === "edit" ? getClientMissing(props.item) : [];
  const canPublish = clientMissing.length === 0;

  async function handlePublish() {
    if (props.mode !== "edit") return;
    setPublishMissing([]);
    try {
      await publish.mutateAsync();
    } catch (err: unknown) {
      // API returns 422 with {detail: {missing: [...]}}
      const anyErr = err as { response?: { data?: { detail?: { missing?: string[] } } } };
      const missing = anyErr?.response?.data?.detail?.missing;
      if (Array.isArray(missing)) {
        setPublishMissing(missing);
      } else {
        setPublishMissing(["unknown"]);
      }
    }
  }

  // ─── actions ──────────────────────────────────────────────────────────────

  function handlePreview() {
    if (props.mode !== "edit") return;
    window.open(`/catalog/${encodeURIComponent(props.item.slug)}?preview=1`, "_blank");
  }

  async function handleDelete() {
    if (props.mode !== "edit") return;
    await del.mutateAsync();
    router.replace("/store/catalog");
  }

  // ─── render ───────────────────────────────────────────────────────────────

  const isEdit = props.mode === "edit";
  const title = isEdit
    ? t("store.itemform.header.edit")
    : t("store.itemform.header.add");

  return (
    <div style={{ maxWidth: 720, paddingBottom: 80 }}>
      {/* Page title */}
      <h1
        className="serif"
        style={{ fontSize: 32, fontWeight: 400, margin: "0 0 40px 0", lineHeight: 1.1 }}
      >
        {title}
      </h1>

      {/* Basics section — always shown */}
      <BasicsSection
        value={basics}
        onChange={(patch) => setBasics((prev) => ({ ...prev, ...patch }))}
      />

      {/* Create mode: starting price block + hint */}
      {!isEdit && (
        <>
          <StartingPriceBlock
            sku={startingSku}
            setSku={setStartingSku}
            price={startingPrice}
            setPrice={setStartingPrice}
            t={t}
          />

          <p
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.10em",
              color: "var(--color-clay)",
              marginBottom: 32,
              fontStyle: "italic",
            }}
          >
            {t("store.itemform.draft_hint")}
          </p>
        </>
      )}

      {/* Edit mode: pricing + photos section */}
      {isEdit && (
        <PricingSection item={props.item} onChanged={() => {}} />
      )}

      {/* Promotion link (edit mode only) */}
      {isEdit && (
        <PromotionRow item={props.item} />
      )}

      {/* Action row */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-start",
          borderTop: "1px solid var(--color-hair)",
          paddingTop: 24,
          marginTop: 24,
        }}
      >
        {/* Primary action */}
        {!isEdit ? (
          <button
            data-testid="save-draft-btn"
            onClick={handleSaveDraft}
            disabled={!canSaveDraft || create.isPending}
            style={{ ...btnPrimary, opacity: canSaveDraft ? 1 : 0.45 }}
          >
            {t("store.itemform.btn.save_draft")}
          </button>
        ) : (
          <>
            <button
              data-testid="save-btn"
              onClick={handleSave}
              disabled={patch.isPending}
              style={btnPrimary}
            >
              {t("store.itemform.btn.save")}
            </button>

            {/* Preview */}
            <button onClick={handlePreview} style={btnGhost}>
              {t("store.itemform.btn.preview")}
            </button>

            {/* Publish / Unpublish */}
            {props.item.status !== "active" ? (
              <button
                data-testid="publish-btn"
                onClick={handlePublish}
                disabled={!canPublish || publish.isPending}
                style={{ ...btnPrimary, opacity: canPublish ? 1 : 0.45 }}
              >
                {t("store.itemform.btn.publish")}
              </button>
            ) : (
              <button
                onClick={() => unpublish.mutate()}
                disabled={unpublish.isPending}
                style={btnGhost}
              >
                {t("store.itemform.btn.unpublish")}
              </button>
            )}

            {/* Archive / Restore */}
            {props.item.status !== "archived" ? (
              <button
                onClick={() => archive.mutate()}
                disabled={archive.isPending}
                style={btnGhost}
              >
                {t("store.itemform.btn.archive")}
              </button>
            ) : (
              <button
                onClick={() => restore.mutate()}
                disabled={restore.isPending}
                style={btnGhost}
              >
                {t("store.itemform.btn.restore")}
              </button>
            )}

            {/* Delete (draft only) */}
            {props.item.status === "draft" && (
              <button
                data-testid="delete-btn"
                onClick={handleDelete}
                disabled={del.isPending}
                style={btnDanger}
              >
                {t("store.itemform.btn.delete")}
              </button>
            )}
          </>
        )}
      </div>

      {/* Publish checklist — from client-side check */}
      {isEdit && props.item.status !== "active" && clientMissing.length > 0 && (
        <PublishChecklist missing={clientMissing} t={t} />
      )}

      {/* Publish checklist — from API 422 error */}
      {publishMissing.length > 0 && (
        <PublishChecklist missing={publishMissing} t={t} />
      )}
    </div>
  );
}

// ─── promotion section ────────────────────────────────────────────────────────

function PromotionRow({ item }: { item: StoreItem }) {
  // Simple: show a link to add/view promotions
  return (
    <div
      style={{
        borderTop: "1px dashed var(--color-hair)",
        paddingTop: 16,
        marginBottom: 24,
      }}
    >
      <Link
        href={`/store/promotions/new?item_id=${item.id}`}
        style={{ fontSize: 12, color: "var(--color-clay)", textDecoration: "none" }}
      >
        + Акция для этого товара →
      </Link>
    </div>
  );
}

// ─── FieldCol helper ──────────────────────────────────────────────────────────

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
