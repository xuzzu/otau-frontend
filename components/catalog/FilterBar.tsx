"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { usePartners, useTaxonomy } from "@/lib/hooks";
import { useLocale, useT } from "@/lib/i18n";
import { pickText } from "@/lib/i18n/text";

const SORT_KEYS = ["curated", "price-asc", "price-desc", "new"] as const;

type Opt = { value: string; label: string };
type CatNode = { value: string; label: string; id: string; sort: number; children: CatNode[] };

const byOrder = (a: { sort: number; label: string }, b: { sort: number; label: string }) =>
  a.sort - b.sort || a.label.localeCompare(b.label);

function collectSlugs(node: CatNode, acc: string[]) {
  acc.push(node.value);
  for (const c of node.children) collectSlugs(c, acc);
}

// Close-on-outside-click + Escape for popover menus.
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function useIsNarrow(maxWidth = 860) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [maxWidth]);
  return narrow;
}

export function FilterBar({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useT();
  const locale = useLocale();

  const partnersQ = usePartners();
  const partners = partnersQ.data ?? [];
  const { indexed } = useTaxonomy();

  const q = sp.get("q") ?? "";
  const categories = sp.get("category")?.split(",").filter(Boolean) ?? [];
  const styles = sp.get("style")?.split(",").filter(Boolean) ?? [];
  const sellers = sp.get("seller")?.split(",").filter(Boolean) ?? [];
  const room = sp.get("room") ?? "";
  const sort = sp.get("sort") ?? "curated";

  // ── derived option sets ──────────────────────────────────────────────────
  const categoryTree = useMemo<CatNode[]>(() => {
    if (!indexed) return [];
    const all = Object.values(indexed.categories);
    const byParent = new Map<string | null, typeof all>();
    for (const c of all) {
      const key = c.parent_id ?? null;
      const arr = byParent.get(key);
      if (arr) arr.push(c);
      else byParent.set(key, [c]);
    }
    const build = (parent: string | null): CatNode[] =>
      (byParent.get(parent) ?? [])
        .map((c) => ({
          value: c.slug,
          label: pickText(c.name, locale) || c.slug,
          id: c.id,
          sort: c.sort_order ?? 0,
          children: build(c.id),
        }))
        .sort(byOrder);
    return build(null);
  }, [indexed, locale]);

  const categoryLabelBySlug = useMemo(() => {
    const out: Record<string, string> = {};
    if (indexed) {
      for (const c of Object.values(indexed.categories)) {
        out[c.slug] = pickText(c.name, locale) || c.slug;
      }
    }
    return out;
  }, [indexed, locale]);

  const styleOptions = useMemo<Opt[]>(() => {
    if (!indexed) return [];
    return Object.values(indexed.styles)
      .map((s) => ({ value: s.slug, label: pickText(s.name, locale) || s.slug }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [indexed, locale]);

  const roomOptions = useMemo<Opt[]>(() => {
    if (!indexed) return [];
    return Object.values(indexed.roomTypes)
      .map((r) => ({
        value: r.slug,
        label: pickText(r.name, locale) || r.slug,
        sort: r.sort_order ?? 0,
      }))
      .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label))
      .map(({ value, label }) => ({ value, label }));
  }, [indexed, locale]);

  const roomLabelBySlug = useMemo(() => {
    const out: Record<string, string> = {};
    for (const r of roomOptions) out[r.value] = r.label;
    return out;
  }, [roomOptions]);

  const partnerNameBySlug = useMemo(() => {
    const out: Record<string, string> = {};
    for (const p of partners) out[p.slug] = p.name;
    return out;
  }, [partners]);

  // ── url mutation ───────────────────────────────────────────────────────────
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      router.replace(`/catalog?${next.toString()}`, { scroll: false });
    },
    [sp, router],
  );

  const toggleInList = useCallback(
    (key: string, current: string[], value: string) => {
      const set = new Set(current);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      setParam(key, set.size ? Array.from(set).join(",") : null);
    },
    [setParam],
  );

  const clearAll = useCallback(() => {
    const next = new URLSearchParams(sp.toString());
    for (const k of ["category", "style", "seller", "room", "q"]) next.delete(k);
    router.replace(`/catalog?${next.toString()}`, { scroll: false });
  }, [sp, router]);

  // ── active filter chips ────────────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const out: { id: string; label: string; onRemove: () => void; dimmed: boolean }[] = [];
    categories.forEach((c) =>
      out.push({
        id: `cat-${c}`,
        label: `${t("catalog.filter.category")} · ${categoryLabelBySlug[c] ?? c}`,
        onRemove: () => toggleInList("category", categories, c),
        dimmed: false,
      }),
    );
    if (room) {
      out.push({
        id: `room-${room}`,
        label: `${t("catalog.filter.room")} · ${roomLabelBySlug[room] ?? room}`,
        onRemove: () => setParam("room", null),
        dimmed: false,
      });
    }
    styles.forEach((s, i) => {
      const opt = styleOptions.find((o) => o.value === s);
      out.push({
        id: `style-${s}`,
        label: `${t("catalog.filter.style")} · ${opt?.label ?? s}`,
        onRemove: () => toggleInList("style", styles, s),
        dimmed: i > 0,
      });
    });
    sellers.forEach((s, i) =>
      out.push({
        id: `seller-${s}`,
        label: `${t("catalog.filter.seller")} · ${partnerNameBySlug[s] ?? s}`,
        onRemove: () => toggleInList("seller", sellers, s),
        dimmed: i > 0,
      }),
    );
    return out;
  }, [
    categories,
    room,
    styles,
    sellers,
    styleOptions,
    roomLabelBySlug,
    partnerNameBySlug,
    categoryLabelBySlug,
    toggleInList,
    setParam,
    t,
  ]);

  return (
    <div>
      {/* slim header — the editorial tagline headline is intentionally gone */}
      <div
        style={{
          padding: "30px 56px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div className="label" style={{ fontSize: 12 }}>
          {t("catalog.crumb")}
        </div>
        <motion.span
          key={resultCount}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          className="label"
          style={{ fontSize: 12 }}
        >
          {t("catalog.results", { n: resultCount, m: partners.length })}
        </motion.span>
      </div>

      <div
        style={{
          margin: "0 56px",
          padding: "20px 0",
          borderTop: "1px solid var(--color-hair)",
          borderBottom: "1px solid var(--color-hair)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "11px 18px",
              border: "1px solid var(--color-hair)",
              background: "var(--color-paper)",
              borderRadius: 999,
              flex: "1 1 380px",
              minWidth: 260,
            }}
          >
            <Search size={17} strokeWidth={1.2} color="var(--color-taupe)" />
            <input
              value={q}
              onChange={(e) => setParam("q", e.target.value || null)}
              placeholder={t("catalog.search.placeholder")}
              style={{
                border: 0,
                background: "transparent",
                outline: "none",
                fontFamily: "inherit",
                fontSize: 15,
                color: "var(--color-ink)",
                flex: 1,
                minWidth: 0,
              }}
            />
            {q && (
              <button
                onClick={() => setParam("q", null)}
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--color-taupe)",
                  display: "flex",
                }}
                aria-label={t("catalog.clear_search")}
              >
                <X size={16} strokeWidth={1.2} />
              </button>
            )}
          </label>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginLeft: "auto",
              flexWrap: "wrap",
            }}
          >
            <CategoryMenu
              label={t("catalog.filter.category")}
              departmentsLabel={t("catalog.filter.departments")}
              allLabelFor={(g) => t("catalog.filter.all_in_group", { group: g })}
              tree={categoryTree}
              selected={categories}
              onToggle={(v) => toggleInList("category", categories, v)}
            />
            <RoomMenu
              label={t("catalog.filter.room")}
              options={roomOptions}
              value={room}
              onChange={(v) => setParam("room", v)}
            />
            <ChipMenu
              label={t("catalog.filter.style")}
              options={styleOptions}
              selected={styles}
              onToggle={(v) => toggleInList("style", styles, v)}
            />
            <ChipMenu
              label={t("catalog.filter.seller")}
              options={partners.map((p) => ({ value: p.slug, label: p.name }))}
              selected={sellers}
              onToggle={(v) => toggleInList("seller", sellers, v)}
            />

            <span
              aria-hidden
              style={{ width: 1, height: 22, background: "var(--color-hair)", margin: "0 2px" }}
            />

            <SortMenu
              label={t("catalog.sort")}
              value={sort}
              options={SORT_KEYS.map((k) => ({ value: k, label: t(`catalog.sort.${k}`) }))}
              onChange={(v) => setParam("sort", v)}
            />
          </div>
        </div>

        <AnimatePresence initial={false}>
          {activeChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <AnimatePresence>
                {activeChips.map((c) => (
                  <motion.button
                    layout
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: c.dimmed ? 0.55 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    onClick={c.onRemove}
                    className="chip solid"
                    style={{ cursor: "pointer", fontSize: 11 }}
                    title={c.dimmed ? t("catalog.filter.only_first") : undefined}
                  >
                    {c.label} <span style={{ marginLeft: 4 }}>×</span>
                  </motion.button>
                ))}
              </AnimatePresence>
              <button
                onClick={clearAll}
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-clay)",
                  padding: "4px 6px",
                }}
              >
                {t("catalog.filter.clear_all")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── shared bits ──────────────────────────────────────────────────────────────

const panelMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] as const },
};

const CheckBox = ({ active }: { active: boolean }) => (
  <span
    style={{
      width: 15,
      height: 15,
      flexShrink: 0,
      border: "1px solid var(--color-ink)",
      background: active ? "var(--color-ink)" : "transparent",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--color-paper)",
      fontSize: 10,
    }}
  >
    {active ? "✓" : ""}
  </span>
);

const Count = ({ n }: { n: number }) => (
  <span
    style={{
      minWidth: 18,
      height: 18,
      padding: "0 5px",
      borderRadius: 999,
      background: "var(--color-clay)",
      color: "var(--color-paper)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
    }}
  >
    {n}
  </span>
);

const optionRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  padding: "9px 12px",
  border: 0,
  fontFamily: "inherit",
  fontSize: 13,
  color: "var(--color-ink)",
  cursor: "pointer",
  textAlign: "left",
  background: "transparent",
};

const allRowStyle: React.CSSProperties = {
  ...optionRowStyle,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "var(--color-taupe)",
};

const paneLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--color-taupe)",
  padding: "6px 12px 8px",
};

const panelStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  background: "var(--color-paper)",
  border: "1px solid var(--color-hair)",
  boxShadow: "var(--shadow-card)",
  zIndex: 20,
};

function FacetTrigger({
  label,
  count,
  open,
  onClick,
  haspopup = "true",
}: {
  label: string;
  count: number;
  open: boolean;
  onClick: () => void;
  haspopup?: "true" | "listbox";
}) {
  return (
    <button
      type="button"
      className="chip lg"
      data-active={count > 0}
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup={haspopup}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {label}
      {count > 0 ? <Count n={count} /> : <span>+</span>}
    </button>
  );
}

function NavRow({
  label,
  active,
  count,
  onNavigate,
}: {
  label: string;
  active: boolean;
  count: number;
  onNavigate: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onNavigate}
      onFocus={onNavigate}
      onClick={onNavigate}
      style={{
        ...optionRowStyle,
        background: active ? "var(--color-cream)" : "transparent",
        color: active ? "var(--color-clay)" : "var(--color-ink)",
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-taupe)" }}>
        {count > 0 && <span style={{ color: "var(--color-clay)", fontSize: 12 }}>{count}</span>}
        <ChevronRight size={14} strokeWidth={1.4} />
      </span>
    </button>
  );
}

function SelectRow({
  label,
  active,
  onClick,
  mono = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...(mono ? allRowStyle : optionRowStyle),
        ...(!mono && active ? { background: "var(--color-cream)" } : null),
      }}
    >
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      <CheckBox active={active} />
    </button>
  );
}

// ── Category: three-pane Miller flyout (Department › Category › Subcategory) ──

function CategoryMenu({
  label,
  departmentsLabel,
  allLabelFor,
  tree,
  selected,
  onToggle,
}: {
  label: string;
  departmentsLabel: string;
  allLabelFor: (name: string) => string;
  tree: CatNode[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [deptSlug, setDeptSlug] = useState<string | null>(null);
  const [catSlug, setCatSlug] = useState<string | null>(null);
  const [path, setPath] = useState<CatNode[]>([]); // narrow drill-down
  const narrow = useIsNarrow();
  const rootRef = useDismiss(open, () => setOpen(false));

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const countUnder = useCallback(
    (node: CatNode) => {
      const acc: string[] = [];
      collectSlugs(node, acc);
      return acc.reduce((n, s) => (selectedSet.has(s) ? n + 1 : n), 0);
    },
    [selectedSet],
  );

  const dept = tree.find((d) => d.value === deptSlug) ?? tree[0] ?? null;
  const cat = dept?.children.find((c) => c.value === catSlug) ?? dept?.children[0] ?? null;

  const leaf = (node: CatNode) => (
    <SelectRow
      key={node.value}
      label={node.label}
      active={selectedSet.has(node.value)}
      onClick={() => onToggle(node.value)}
    />
  );
  const allRow = (node: CatNode) => (
    <SelectRow
      mono
      label={allLabelFor(node.label)}
      active={selectedSet.has(node.value)}
      onClick={() => onToggle(node.value)}
    />
  );

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <FacetTrigger label={label} count={selected.length} open={open} onClick={() => setOpen((v) => !v)} />
      <AnimatePresence>
        {open && (
          <motion.div {...panelMotion} style={panelStyle}>
            {narrow ? (
              // single-column drill-down with breadcrumb back
              <div style={{ width: 290, padding: 8, maxHeight: 440, overflowY: "auto" }}>
                {path.length > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setPath((p) => p.slice(0, -1))}
                      style={{ ...optionRowStyle, color: "var(--color-taupe)", gap: 8 }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <ChevronLeft size={15} strokeWidth={1.4} />
                        {path[path.length - 1].label}
                      </span>
                    </button>
                    <div style={{ height: 1, background: "var(--color-hair)", margin: "4px 12px 6px" }} />
                    {allRow(path[path.length - 1])}
                  </>
                ) : (
                  <div style={paneLabelStyle}>{departmentsLabel}</div>
                )}
                {(path.length ? path[path.length - 1].children : tree).map((node) =>
                  node.children.length > 0 ? (
                    <NavRow
                      key={node.value}
                      label={node.label}
                      active={false}
                      count={countUnder(node)}
                      onNavigate={() => setPath((p) => [...p, node])}
                    />
                  ) : (
                    leaf(node)
                  ),
                )}
              </div>
            ) : (
              <div style={{ display: "flex" }}>
                {/* pane 1 — departments */}
                <div style={{ width: 196, padding: 8, borderRight: "1px solid var(--color-hair)", maxHeight: 392, overflowY: "auto" }}>
                  <div style={paneLabelStyle}>{departmentsLabel}</div>
                  {tree.map((d) => (
                    <NavRow
                      key={d.value}
                      label={d.label}
                      active={dept?.value === d.value}
                      count={countUnder(d)}
                      onNavigate={() => {
                        setDeptSlug(d.value);
                        setCatSlug(null);
                      }}
                    />
                  ))}
                </div>

                {/* pane 2 — categories of active department */}
                <div style={{ width: 208, padding: 8, borderRight: "1px solid var(--color-hair)", maxHeight: 392, overflowY: "auto" }}>
                  {dept && (
                    <>
                      <div style={paneLabelStyle}>{dept.label}</div>
                      {allRow(dept)}
                      <div style={{ height: 1, background: "var(--color-hair)", margin: "4px 12px 6px" }} />
                      {dept.children.map((c) =>
                        c.children.length > 0 ? (
                          <NavRow
                            key={c.value}
                            label={c.label}
                            active={cat?.value === c.value}
                            count={countUnder(c)}
                            onNavigate={() => setCatSlug(c.value)}
                          />
                        ) : (
                          leaf(c)
                        ),
                      )}
                    </>
                  )}
                </div>

                {/* pane 3 — subcategories of active category */}
                <div style={{ width: 224, padding: 8, maxHeight: 392, overflowY: "auto" }}>
                  {cat && (
                    <>
                      <div style={paneLabelStyle}>{cat.label}</div>
                      {allRow(cat)}
                      <div style={{ height: 1, background: "var(--color-hair)", margin: "4px 12px 6px" }} />
                      {cat.children.map((s) => leaf(s))}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Style / Seller: flat multi-select dropdown ───────────────────────────────

function ChipMenu({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Opt[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismiss(open, () => setOpen(false));

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <FacetTrigger
        label={label}
        count={selected.length}
        open={open}
        onClick={() => setOpen((v) => !v)}
        haspopup="listbox"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            role="listbox"
            style={{ ...panelStyle, padding: 8, minWidth: 240, maxHeight: 380, overflowY: "auto" }}
          >
            {options.map((o) => {
              const active = selected.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onToggle(o.value)}
                  style={{ ...optionRowStyle, background: active ? "var(--color-cream)" : "transparent" }}
                >
                  {o.label}
                  <CheckBox active={active} />
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Room: single-select dropdown ──────────────────────────────────────────────

function RoomMenu({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Opt[];
  value: string;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismiss(open, () => setOpen(false));

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <FacetTrigger
        label={label}
        count={value ? 1 : 0}
        open={open}
        onClick={() => setOpen((v) => !v)}
        haspopup="listbox"
      />
      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            role="listbox"
            style={{ ...panelStyle, padding: 8, minWidth: 240, maxHeight: 392, overflowY: "auto" }}
          >
            {options.map((o) => {
              const active = value === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(active ? null : o.value);
                    setOpen(false);
                  }}
                  style={{
                    ...optionRowStyle,
                    background: active ? "var(--color-cream)" : "transparent",
                    color: active ? "var(--color-clay)" : "var(--color-ink)",
                  }}
                >
                  {o.label}
                  <span style={{ width: 15, textAlign: "center" }}>{active ? "✓" : ""}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sort: single-select dropdown styled like the filter chips ─────────────────

function SortMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Opt[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismiss(open, () => setOpen(false));

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="chip lg"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {label}
        <ChevronDown
          size={14}
          strokeWidth={1.4}
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s" }}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            role="listbox"
            style={{ ...panelStyle, padding: 8, minWidth: 240 }}
          >
            {options.map((o) => {
              const active = value === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  style={{
                    ...optionRowStyle,
                    background: active ? "var(--color-cream)" : "transparent",
                    color: active ? "var(--color-clay)" : "var(--color-ink)",
                  }}
                >
                  {o.label}
                  <span style={{ width: 15, textAlign: "center" }}>{active ? "✓" : ""}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
