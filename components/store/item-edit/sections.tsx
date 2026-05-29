import { Photo } from "../console/atoms";
import { Section, Field, Input, Textarea, Select, Toggle, Tick, Pill, MiniStat } from "./atoms";
import { SECTIONS, PHOTOS, MATERIALS, COLOR_VARIANTS, DELIVERY_REGIONS } from "../_fixtures/item-edit";
import { useItemEdit } from "./context";
import { useLocale, pickText } from "@/lib/i18n";
import { TextField, NumberField, DeferredField } from "./fields";
import { CategorySelect, TaxSelect, TaxChips } from "./pickers";
import { useTaxonomy } from "@/lib/hooks/useTaxonomy";
import { VariantCard, AddVariantButton } from "./VariantCard";

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
export function PhotosSection() {
  return (
    <Section n="01" title="Photos" hint="7 of 12 · drag to reorder · first is hero">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 10 }}>
        {PHOTOS.map((src, i) => (
          <div key={i} style={{ position: "relative", aspectRatio: "1", outline: i === 0 ? "2px solid #B5532E" : "none", outlineOffset: 2 }}>
            <Photo src={src} style={{ position: "absolute", inset: 0 }} />
            {i === 0 && (
              <div className="mono" style={{ position: "absolute", top: 6, left: 6, padding: "3px 7px", background: "#B5532E", color: "#FBF8F2", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>Hero</div>
            )}
            <div className="mono" style={{ position: "absolute", bottom: 6, left: 6, padding: "2px 5px", background: "rgba(26,22,18,.7)", color: "#FBF8F2", fontSize: 9, letterSpacing: "0.08em" }}>0{i + 1}</div>
            <span style={{ position: "absolute", top: 6, right: 6, width: 18, height: 18, background: "#FBF8F2", border: "1px solid #E8DFD0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#1A1612" }}>⋯</span>
          </div>
        ))}
        <div style={{ aspectRatio: "1", border: "1.5px dashed #B8A98F", background: "#FBF8F2", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: "#5B5043", cursor: "pointer" }}>
          <span style={{ fontFamily: "Instrument Serif, serif", fontSize: 28, color: "#9A8A72" }}>+</span>
          <span className="mono" style={{ fontSize: 9, letterSpacing: "0.10em", textTransform: "uppercase", color: "#5B5043" }}>Drop or browse</span>
        </div>
      </div>

      <div style={{ marginTop: 14, padding: 14, background: "#FBF8F2", border: "1px solid #E8DFD0", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ width: 28, height: 28, borderRadius: 999, background: "#1A1612", color: "#FBF8F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>◇</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13 }}>
            <span className="serif it">Otaū can render the room scenes for you.</span>
            <span style={{ color: "#5B5043" }}> Upload a hero photo and we&apos;ll generate 3 lifestyle scenes for free.</span>
          </div>
        </div>
        <button className="btn ghost" style={{ padding: "8px 14px", fontSize: 11 }}>Generate scenes →</button>
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
export function PriceStockSection() {
  return (
    <Section n="03" title="Price &amp; stock">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        <Field label="Price · KZT"><Input value="685 000" prefix="₸" /></Field>
        <Field label="Compare at · KZT"><Input value="740 000" prefix="₸" placeholder /></Field>
        <Field label="Cost · internal"><Input value="412 000" prefix="₸" hint="Margin 39.8%" /></Field>
        <Field label="Tax class"><Select value="Furniture · 12% VAT" /></Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginTop: 12 }}>
        <Field label="In stock"><Input value="5" suffix="units" /></Field>
        <Field label="Build to order"><Toggle on label="On · 6 wk lead" /></Field>
        <Field label="Restock arriving"><Input value="14 Jun 2026" suffix="cal" /></Field>
        <Field label="Notify when low"><Input value="3" suffix="units" /></Field>
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
    </Section>
  );
}

// ——— 08 · Delivery ———
export function DeliverySection() {
  return (
    <Section n="08" title="Delivery">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
        <Field label="Ships from"><Select value="Astana · workshop" /></Field>
        <Field label="Handling time"><Select value="3–5 business days" /></Field>
        <Field label="Assembly"><Select value="White-glove included" /></Field>
      </div>
      <Field label="Regions & rates">
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
    </Section>
  );
}

// ——— Right rail ———
export function RightRail() {
  return (
    <aside style={{ width: 300, background: "#FBF8F2", borderLeft: "1px solid #E8DFD0", padding: "22px 22px", overflowY: "auto", flexShrink: 0 }}>
      <div className="label">Marketplace preview</div>

      <div style={{ marginTop: 12 }}>
        <div style={{ position: "relative", height: 180 }}>
          <Photo src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=70" style={{ position: "absolute", inset: 0 }} />
          <div className="mono" style={{ position: "absolute", top: 10, left: 10, padding: "4px 8px", background: "rgba(251,248,242,.92)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase" }}>Editor&apos;s pick</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10 }}>
          <div>
            <div style={{ fontSize: 13, lineHeight: 1.2 }}>Klemo modular sofa, 3‑seat</div>
            <div className="label" style={{ marginTop: 4, fontSize: 9 }}>Mebel Astana · 220 × 92 cm</div>
          </div>
          <div className="num" style={{ fontSize: 13 }}>₸685 000</div>
        </div>
      </div>

      <hr className="hr-hair" style={{ margin: "20px 0" }} />

      <div className="label">Visibility</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginTop: 10 }}>
        <Pill on>Live</Pill>
        <Pill>Draft</Pill>
        <Pill>Hidden</Pill>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: "#5B5043", lineHeight: 1.4 }}>
        Live since 12 Apr. Indexed in <span className="it">Sofas</span>, <span className="it">Modular</span>, and the May <span className="it">Soft scandinavian</span> scene.
      </div>

      <hr className="hr-hair" style={{ margin: "20px 0" }} />

      <div className="label">Checklist</div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        <Tick on>Photos · 7 / 12</Tick>
        <Tick on>Description · A‑readable</Tick>
        <Tick on>Dimensions complete</Tick>
        <Tick warn>AR · lighting missing</Tick>
        <Tick on>Delivery rates · 3 regions</Tick>
      </div>

      <hr className="hr-hair" style={{ margin: "20px 0" }} />

      <div className="label">Performance · 30d</div>
      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <MiniStat l="Views" v="4 281" />
        <MiniStat l="Adds" v="118" />
        <MiniStat l="Inquiries" v="32" />
        <MiniStat l="Sold" v="14" />
      </div>

      <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid #E8DFD0" }}>
        <div className="label" style={{ color: "#B5532E" }}>Danger zone</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
          <span style={{ fontSize: 12, color: "#5B5043", cursor: "pointer" }}>↗ Duplicate listing</span>
          <span style={{ fontSize: 12, color: "#5B5043", cursor: "pointer" }}>⌧ Archive (keep history)</span>
          <span style={{ fontSize: 12, color: "#B5532E", cursor: "pointer" }}>× Delete permanently</span>
        </div>
      </div>
    </aside>
  );
}
