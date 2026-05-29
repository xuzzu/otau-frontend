import { Photo } from "../console/atoms";
import { Section, Field, Input, Select, Toggle, Tick, Pill, MiniStat } from "./atoms";
import { SECTIONS, DELIVERY_REGIONS } from "../_fixtures/item-edit";
import { useItemEdit } from "./context";
import { useLocale, pickText } from "@/lib/i18n";
import { TextField, NumberField, DeferredField } from "./fields";
import { CategorySelect, TaxSelect, TaxChips } from "./pickers";
import { useTaxonomy } from "@/lib/hooks/useTaxonomy";
import { VariantCard, AddVariantButton } from "./VariantCard";
import {
  useUploadImage, useDeleteImage, usePatchImage,
  usePatchVariant, useSetStock, useStoreInfo,
  usePublishItem, useUnpublishItem, useArchiveItem, useDeleteItem,
} from "@/lib/store-api/hooks";

// ——— Left section rail ———
export function SectionRail() {
  return (
    <aside style={{ width: 184, padding: "24px 18px", borderRight: "1px solid #E8DFD0", flexShrink: 0, background: "#F4EFE6", overflowY: "auto" }}>
      <div className="label">Sections</div>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 2 }}>
        {SECTIONS.map((it) => (
          <a key={it.n} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "7px 8px",
            fontSize: 12, cursor: "pointer", color: "#1A1612",
            background: it.active ? "#FBF8F2" : "transparent",
            border: "1px solid", borderColor: it.active ? "#E8DFD0" : "transparent",
          }}>
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72" }}>{it.n}</span>
            <span style={{ flex: 1 }}>{it.l}</span>
            {it.done && <span style={{ color: "#3F4A39", fontSize: 11 }}>✓</span>}
            {it.warn && <span style={{ color: "#B5532E", fontSize: 12 }}>●</span>}
          </a>
        ))}
      </div>

      <hr className="hr-hair" style={{ margin: "22px 0 16px" }} />
      <div className="label">History</div>
      <div style={{ fontSize: 11, color: "#5B5043", marginTop: 8, lineHeight: 1.5 }}>
        <div>v.14 · today, 14:08 <span className="it" style={{ color: "#9A8A72" }}>(you)</span></div>
        <div style={{ marginTop: 4 }}>v.13 · 26 May <span className="it" style={{ color: "#9A8A72" }}>price ₸685k</span></div>
        <div style={{ marginTop: 4 }}>v.12 · 12 May <span className="it" style={{ color: "#9A8A72" }}>+4 photos</span></div>
      </div>
    </aside>
  );
}

// ——— 01 · Photos ———
const MAX_ITEM_PHOTOS = 5;

export function PhotosSection() {
  const { item } = useItemEdit();
  const itemId = item?.id;
  const upload = useUploadImage(itemId ?? "");
  const delImg = useDeleteImage(itemId ?? "");
  const patchImg = usePatchImage(itemId ?? "");
  const photos = (item?.images ?? []).filter((im) => im.variant_id == null);

  if (!itemId) {
    return (
      <Section n="01" title="Photos">
        <p className="mono" style={{ fontSize: 11, color: "#9A8A72", letterSpacing: "0.06em" }}>
          Save the draft to add photos.
        </p>
      </Section>
    );
  }

  return (
    <Section n="01" title="Photos" hint={`${photos.length} of ${MAX_ITEM_PHOTOS} · first is hero`}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
        {photos.map((p) => (
          <div key={p.id} style={{ position: "relative", aspectRatio: "1", outline: p.is_main ? "2px solid #B5532E" : "none", outlineOffset: 2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            {p.is_main && (
              <div className="mono" style={{ position: "absolute", top: 6, left: 6, padding: "3px 7px", background: "#B5532E", color: "#FBF8F2", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>Hero</div>
            )}
            {!p.is_main && (
              <button
                type="button"
                onClick={() => patchImg.mutate({ img_id: p.id, body: { is_main: true } })}
                style={{ position: "absolute", bottom: 4, left: 4, padding: "2px 6px", fontSize: 9, background: "rgba(251,248,242,.88)", border: "1px solid #E8DFD0", cursor: "pointer" }}
              >
                Set hero
              </button>
            )}
            <button
              type="button"
              aria-label="Delete photo"
              onClick={() => delImg.mutate(p.id)}
              style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, background: "#FBF8F2", border: "1px solid #E8DFD0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#1A1612", cursor: "pointer" }}
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < MAX_ITEM_PHOTOS && (
          <label style={{ aspectRatio: "1", border: "1.5px dashed #B8A98F", background: "#FBF8F2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#5B5043", cursor: "pointer" }}>
            <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 28, color: "#9A8A72" }}>+</span>
            <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase", color: "#5B5043" }}>Drop or browse</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload.mutate({ file: f }); }}
            />
          </label>
        )}
      </div>

      {/* "Generate scenes" CTA — coming soon, kept disabled */}
      <div style={{ marginTop: 14, padding: 14, background: "#FBF8F2", border: "1px solid #E8DFD0", display: "flex", alignItems: "center", gap: 16, opacity: 0.5, pointerEvents: "none" }}>
        <span style={{ width: 28, height: 28, borderRadius: 999, background: "#1A1612", color: "#FBF8F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>◇</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13 }}>
            <span className="serif it">Otaū can render the room scenes for you.</span>
            <span style={{ color: "#5B5043" }}> Upload a hero photo and we&apos;ll generate 3 lifestyle scenes for free.</span>
          </div>
        </div>
        <button className="btn ghost" style={{ padding: "8px 14px", fontSize: 11 }} disabled>Generate scenes →</button>
      </div>
    </Section>
  );
}

// ——— Default variant SKU (read-only; editable SKU lives on the VariantCard) ———
function DefaultVariantSku() {
  const { item } = useItemEdit();
  const sku = item?.variants.find((v) => v.is_default)?.sku ?? item?.variants[0]?.sku ?? null;
  return (
    <Field label="SKU · internal">
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
        <span style={{ flex: 1, fontSize: 13, color: sku ? "#1A1612" : "#9A8A72", letterSpacing: "-0.005em" }}>
          {sku ?? "—"}
        </span>
        <span className="mono" style={{ fontSize: 9, letterSpacing: "0.08em", color: "#9A8A72", textTransform: "uppercase" }}>read-only</span>
      </div>
    </Field>
  );
}

// ——— 02 · Basics ———
export function BasicsSection() {
  const { form, setField } = useItemEdit();
  const locale = useLocale();
  return (
    <Section n="02" title="Basics" hint="Shown on the marketplace card">
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <TextField label="Title" value={form.name} onChange={(v) => setField("name", v)} />
        <DeferredField label="Subtitle · optional"><Input value="" placeholder /></DeferredField>
      </div>

      <TextField
        label="Description"
        sub="240+ chars helps AI scene generation"
        value={form.description[locale] ?? ""}
        onChange={(v) => setField("description", { ...form.description, [locale]: v })}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
        <TextField label="URL handle" prefix="otau.kz/i/" value={form.slug} onChange={(v) => setField("slug", v)} />
        {/* SKU edits live on the default VariantCard; shown read-only here to avoid double-write paths */}
        <DefaultVariantSku />
      </div>
    </Section>
  );
}

// ——— 03 · Price & stock ———
const inputBox: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8, padding: "11px 14px",
  background: "#FBF8F2", border: "1px solid #E8DFD0",
};

export function PriceStockSection() {
  const { item } = useItemEdit();
  const def = item?.variants.find((v) => v.is_default) ?? item?.variants[0];
  const patchV = usePatchVariant(item?.id ?? "");
  const setStock = useSetStock(item?.id ?? "");
  return (
    <Section n="03" title="Price &amp; stock">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <Field label="Price · KZT">
          <div style={inputBox}>
            <span style={{ fontSize: 13, color: "#9A8A72" }}>₸</span>
            <input
              aria-label="Price"
              inputMode="numeric"
              defaultValue={def?.price ?? 0}
              disabled={!def}
              onBlur={(e) => def && patchV.mutate({ vid: def.id, body: { price: Number(e.target.value) } })}
              style={{ flex: 1, fontSize: 13, color: "#1A1612", background: "transparent", border: "none", outline: "none" }}
            />
          </div>
        </Field>
        <DeferredField label="Compare at · KZT"><Input value="" prefix="₸" placeholder /></DeferredField>
        <DeferredField label="Cost · internal"><Input value="" prefix="₸" placeholder /></DeferredField>
        <DeferredField label="Tax class"><Select value="—" /></DeferredField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 12 }}>
        <Field label="In stock">
          <div style={inputBox}>
            <input
              aria-label="In stock"
              inputMode="numeric"
              defaultValue={def?.in_stock_current_shop ?? 0}
              disabled={!def}
              onBlur={(e) => def && setStock.mutate({ vid: def.id, in_stock: Number(e.target.value) })}
              style={{ flex: 1, fontSize: 13, color: "#1A1612", background: "transparent", border: "none", outline: "none" }}
            />
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>units</span>
          </div>
        </Field>
        <DeferredField label="Build to order"><Toggle label="—" /></DeferredField>
        <DeferredField label="Restock arriving"><Input value="" placeholder /></DeferredField>
        <DeferredField label="Notify when low"><Input value="" placeholder /></DeferredField>
      </div>
    </Section>
  );
}

// ——— 04 · Dimensions ———
export function DimensionsSection() {
  const { form, setField } = useItemEdit();
  const d = form.dims;
  const set = (k: "width_cm" | "depth_cm" | "height_cm") => (v: number | null) =>
    setField("dims", { ...d, [k]: v ?? undefined });
  return (
    <Section n="04" title="Dimensions &amp; weight" hint="Used for AR placement and delivery quotes">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr) 1.2fr", gap: 16 }}>
        <NumberField label="Width" suffix="cm" value={d.width_cm ?? null} onChange={set("width_cm")} />
        <NumberField label="Depth" suffix="cm" value={d.depth_cm ?? null} onChange={set("depth_cm")} />
        <NumberField label="Height" suffix="cm" value={d.height_cm ?? null} onChange={set("height_cm")} />
        <DeferredField label="Seat height"><Input value="" suffix="cm" placeholder /></DeferredField>
        <NumberField label="Weight" suffix="kg" value={form.weight_kg} onChange={(v) => setField("weight_kg", v)} />
        <DeferredField label="Volume packed"><Input value="" suffix="m³" placeholder /></DeferredField>
      </div>
    </Section>
  );
}

// ——— 05 · Materials & colors ———
export function MaterialsColorsSection() {
  const { form, setField, item } = useItemEdit();
  const locale = useLocale();
  const { indexed } = useTaxonomy();
  const matOpts = Object.values(indexed?.materials ?? {}).map((m) => ({
    value: m.id, label: pickText(m.name, locale),
  }));
  const toggle = (key: "material_ids" | "finish_material_ids") => (id: string) =>
    setField(key, form[key].includes(id) ? form[key].filter((x) => x !== id) : [...form[key], id]);
  return (
    <Section n="05" title="Materials &amp; colors">
      <TaxChips label="Materials · base" options={matOpts} selected={form.material_ids} onToggle={toggle("material_ids")} />
      <TaxChips label="Finish · optional" options={matOpts} selected={form.finish_material_ids} onToggle={toggle("finish_material_ids")} />
      <Field label={`Colors · ${item?.variants.length ?? 0} variant(s)`} sub="Each variant is a buyable color">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 220px)", gap: 16 }}>
          {(item?.variants ?? []).map((v) => <VariantCard key={v.id} variant={v} />)}
          <AddVariantButton />
        </div>
      </Field>
    </Section>
  );
}

// ——— 06 · Category ———
export function CategorySection() {
  const { form, setField } = useItemEdit();
  const locale = useLocale();
  const { indexed } = useTaxonomy();
  const cats = Object.values(indexed?.categories ?? {}).map((c) => ({
    id: c.id, parent_id: c.parent_id ?? null, label: pickText(c.name, locale),
  }));
  const styleOpts = Object.values(indexed?.styles ?? {}).map((s) => ({ value: s.id, label: pickText(s.name, locale) }));
  const roomOpts = Object.values(indexed?.roomTypes ?? {}).map((r) => ({ value: r.id, label: pickText(r.name, locale) }));
  return (
    <Section n="06" title="Category &amp; tags">
      <CategorySelect
        categories={cats}
        value={form.category_id}
        onChange={(id) => setField("category_id", id)}
        labels={{ dept: "Department", category: "Category", subcategory: "Subcategory" }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
        <TaxSelect
          label="Style"
          value={form.style_ids[0] ?? ""}
          options={styleOpts}
          onChange={(v) => setField("style_ids", v ? [v] : [])}
        />
        <TaxSelect
          label="Room"
          value={form.room_target_id ?? ""}
          options={roomOpts}
          onChange={(v) => setField("room_target_id", v || null)}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <DeferredField label="Tags · search &amp; AI matching"><Input value="" placeholder /></DeferredField>
      </div>
    </Section>
  );
}

// ——— 07 · Studio / AR ———
export function StudioARSection() {
  return (
    <Section n="07" title="Studio &amp; AR" hint="Required for ◇ Try in room">
      <div style={{ opacity: 0.5, pointerEvents: "none" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase", marginBottom: 14 }}>Coming soon</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ padding: 16, background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
            <div className="label">3D model · .glb</div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
              <div style={{ width: 72, height: 72, background: "#F4EFE6", border: "1px solid #E8DFD0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 60 60" width="44" height="44" fill="none" stroke="#1A1612" strokeWidth="1">
                  <path d="M30 6 L54 18 L54 42 L30 54 L6 42 L6 18 Z" />
                  <path d="M30 6 L30 54 M6 18 L54 42 M6 42 L54 18" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}>klemo-3seat-v3.glb</div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#9A8A72", marginTop: 4 }}>14.2 MB · 28k tris · uploaded 12 May</div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#B5532E", textTransform: "uppercase" }}>Replace</span>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#9A8A72", textTransform: "uppercase" }}>Preview ↗</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: 16, background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
            <div className="label">AR readiness</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              <Tick on>Hero photo on white</Tick>
              <Tick on>3D model uploaded</Tick>
              <Tick on>Dimensions verified</Tick>
              <Tick warn>Lighting probe missing</Tick>
              <Tick on>Anchor points set · floor</Tick>
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#D8A05B", marginTop: 12, textTransform: "uppercase" }}>
              ● 4 of 5 — fix lighting to enable AR
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ——— 08 · Delivery ———
export function DeliverySection() {
  return (
    <Section n="08" title="Delivery">
      <div style={{ opacity: 0.5, pointerEvents: "none" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase", marginBottom: 14 }}>Coming soon</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <Field label="Ships from"><Select value="Astana · workshop" /></Field>
          <Field label="Handling time"><Select value="3–5 business days" /></Field>
          <Field label="Assembly"><Select value="White-glove included" /></Field>
        </div>
        <Field label="Regions &amp; rates">
          <div style={{ background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
            {DELIVERY_REGIONS.map((r, i, a) => (
              <div key={r.r} style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: i < a.length - 1 ? "1px solid #E8DFD0" : "none", gap: 12 }}>
                <span style={{ width: 30, height: 16, borderRadius: 999, background: r.on ? "#3F4A39" : "#E8DFD0", position: "relative", flexShrink: 0 }}>
                  <span style={{ position: "absolute", top: 2, left: r.on ? 16 : 2, width: 12, height: 12, borderRadius: 999, background: "#FBF8F2" }} />
                </span>
                <span style={{ flex: 1, fontSize: 13 }}>{r.r}</span>
                <span className="mono" style={{ fontSize: 11, letterSpacing: "0.06em", color: "#5B5043" }}>{r.t}</span>
              </div>
            ))}
          </div>
        </Field>
      </div>
    </Section>
  );
}

// ——— Right rail ———
export function RightRail() {
  const { form, item, publish, publishMissing } = useItemEdit();
  const storeInfo = useStoreInfo();
  const shopName = storeInfo.data?.current_shop?.name ?? "";

  const def = item?.variants.find((v) => v.is_default) ?? item?.variants[0];
  const defPrice = def?.price;
  const heroImage = item?.main_image_url;

  // Checklist: derived from publish gate
  const hasDims = !!(form.dims.width_cm && form.dims.depth_cm && form.dims.height_cm);
  const heroPhoto = (item?.images ?? []).find((im) => im.is_main && im.variant_id == null);
  const allVariantsPriced = (item?.variants ?? []).every((v) => v.price > 0 && v.sku);
  const checks = [
    { label: "Title set", ok: form.name.trim().length > 0 },
    { label: "Category selected", ok: !!form.category_id },
    { label: "Dimensions (H / W / D)", ok: hasDims },
    { label: "Hero photo", ok: !!heroPhoto },
    { label: "Variant priced + SKU", ok: allVariantsPriced },
  ];

  const status = item?.status ?? "draft";
  const archiveItem = useArchiveItem(item?.id ?? "");
  const deleteItem = useDeleteItem(item?.id ?? "");
  const publishItem = usePublishItem(item?.id ?? "");
  const unpublishItem = useUnpublishItem(item?.id ?? "");

  return (
    <aside style={{ width: 300, background: "#FBF8F2", borderLeft: "1px solid #E8DFD0", padding: "22px 22px", overflowY: "auto", flexShrink: 0 }}>
      <div className="label">Marketplace preview</div>

      <div style={{ marginTop: 12 }}>
        <div style={{ position: "relative", height: 180, background: "#F4EFE6" }}>
          {heroImage
            ? <Photo src={heroImage} style={{ position: "absolute", inset: 0 }} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>No photo yet</span>
              </div>
          }
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 13, lineHeight: 1.2 }}>{form.name || <span style={{ color: "#9A8A72" }}>Untitled item</span>}</div>
            {shopName && <div className="label" style={{ marginTop: 4, fontSize: 9 }}>{shopName}</div>}
          </div>
          {defPrice !== undefined && (
            <div className="num" style={{ fontSize: 13 }}>₸{defPrice.toLocaleString("ru-KZ")}</div>
          )}
        </div>
      </div>

      <hr className="hr-hair" style={{ margin: "20px 0" }} />

      <div className="label">Visibility</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 }}>
        <button
          type="button"
          onClick={() => publishItem.mutate()}
          style={{ all: "unset", cursor: "pointer" }}
        >
          <Pill on={status === "active"}>Live</Pill>
        </button>
        <button
          type="button"
          onClick={() => unpublishItem.mutate()}
          style={{ all: "unset", cursor: "pointer" }}
        >
          <Pill on={status === "draft"}>Draft</Pill>
        </button>
        <button
          type="button"
          onClick={() => archiveItem.mutate()}
          style={{ all: "unset", cursor: "pointer" }}
        >
          <Pill on={status === "archived"}>Hidden</Pill>
        </button>
      </div>
      {item?.published_at && status === "active" && (
        <div style={{ marginTop: 10, fontSize: 11, color: "#5B5043", lineHeight: 1.4 }}>
          Live since {new Date(item.published_at).toLocaleDateString("ru-KZ", { day: "numeric", month: "short" })}.
        </div>
      )}

      {publishMissing.length > 0 && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: "#FDF2EC", border: "1px solid #E8C4A8", fontSize: 11, color: "#B5532E", lineHeight: 1.5 }}>
          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Missing before publish:</span>
          {publishMissing.map((m) => <div key={m}>· {m}</div>)}
        </div>
      )}

      <hr className="hr-hair" style={{ margin: "20px 0" }} />

      <div className="label">Checklist</div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {checks.map((c) => (
          <Tick key={c.label} on={c.ok}>{c.label}</Tick>
        ))}
      </div>

      <hr className="hr-hair" style={{ margin: "20px 0" }} />

      <div className="label">Performance · 30d</div>
      <div style={{ marginTop: 10, opacity: 0.5, pointerEvents: "none" }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase", marginBottom: 10 }}>Coming soon</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <MiniStat l="Views" v="—" />
          <MiniStat l="Adds" v="—" />
          <MiniStat l="Inquiries" v="—" />
          <MiniStat l="Sold" v="—" />
        </div>
      </div>

      <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #E8DFD0" }}>
        <div className="label" style={{ color: "#B5532E" }}>Danger zone</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "#9A8A72", opacity: 0.5 }}>↗ Duplicate listing</span>
          <button
            type="button"
            onClick={() => archiveItem.mutate()}
            style={{ all: "unset", fontSize: 12, color: "#5B5043", cursor: "pointer" }}
          >
            ⌧ Archive (keep history)
          </button>
          <button
            type="button"
            onClick={() => { if (window.confirm("Permanently delete this item?")) deleteItem.mutate(); }}
            disabled={status !== "draft"}
            style={{ all: "unset", fontSize: 12, color: status === "draft" ? "#B5532E" : "#9A8A72", cursor: status === "draft" ? "pointer" : "not-allowed" }}
          >
            × Delete permanently
          </button>
        </div>
      </div>
    </aside>
  );
}
