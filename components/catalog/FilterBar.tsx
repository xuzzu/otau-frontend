"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import {
  CATEGORY_LABELS,
  STYLE_LABELS,
  type Category,
  type Style,
} from "@/lib/products";
import { usePartners } from "@/lib/hooks";
import { useT } from "@/lib/i18n";

const SORT_KEYS = ["curated", "price-asc", "price-desc", "new"] as const;

export function FilterBar({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const { t } = useT();

  const partnersQ = usePartners();
  const partners = partnersQ.data ?? [];

  const q = sp.get("q") ?? "";
  const categories = (sp.get("category")?.split(",").filter(Boolean) ??
    []) as Category[];
  const styles = (sp.get("style")?.split(",").filter(Boolean) ?? []) as Style[];
  const sellers = sp.get("seller")?.split(",").filter(Boolean) ?? [];
  const sort = sp.get("sort") ?? "curated";

  const partnerNameBySlug = useMemo(() => {
    const out: Record<string, string> = {};
    for (const p of partners) out[p.slug] = p.name;
    return out;
  }, [partners]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(sp.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      router.replace(`/catalog?${next.toString()}`, { scroll: false });
    },
    [sp, router]
  );

  const toggleInList = useCallback(
    (key: string, current: string[], value: string) => {
      const set = new Set(current);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      setParam(key, set.size ? Array.from(set).join(",") : null);
    },
    [setParam]
  );

  const activeChips = useMemo(() => {
    const out: { id: string; label: string; onRemove: () => void }[] = [];
    categories.forEach((c) =>
      out.push({
        id: `cat-${c}`,
        label: `${t("catalog.filter.category")} · ${CATEGORY_LABELS[c] ?? c}`,
        onRemove: () => toggleInList("category", categories, c),
      })
    );
    styles.forEach((s) =>
      out.push({
        id: `style-${s}`,
        label: `${t("catalog.filter.style")} · ${STYLE_LABELS[s] ?? s}`,
        onRemove: () => toggleInList("style", styles, s),
      })
    );
    sellers.forEach((s) =>
      out.push({
        id: `seller-${s}`,
        label: `${t("catalog.filter.seller")} · ${partnerNameBySlug[s] ?? s}`,
        onRemove: () => toggleInList("seller", sellers, s),
      })
    );
    return out;
  }, [categories, styles, sellers, partnerNameBySlug, toggleInList, t]);

  return (
    <div>
      {/* Header band */}
      <div
        style={{
          padding: "28px 56px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="label">{t("catalog.crumb")}</div>
          <h2
            className="serif"
            style={{
              fontSize: 56,
              margin: "8px 0 0",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            {t("catalog.h1.main")}{" "}
            <span className="it">{t("catalog.h1.italic")}</span>
          </h2>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          <motion.span
            key={resultCount}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="label"
          >
            {t("catalog.results", { n: resultCount, m: partners.length })}
          </motion.span>
        </div>
      </div>

      {/* Sticky filter bar */}
      <div
        style={{
          margin: "0 56px",
          padding: "16px 0",
          borderTop: "1px solid var(--color-hair)",
          borderBottom: "1px solid var(--color-hair)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            border: "1px solid var(--color-hair)",
            background: "var(--color-paper)",
            borderRadius: 999,
            minWidth: 260,
            flex: "0 1 320px",
          }}
        >
          <Search size={14} strokeWidth={1.2} color="var(--color-taupe)" />
          <input
            value={q}
            onChange={(e) => setParam("q", e.target.value || null)}
            placeholder={t("catalog.search.placeholder")}
            style={{
              border: 0,
              background: "transparent",
              outline: "none",
              fontFamily: "inherit",
              fontSize: 13,
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
              <X size={14} strokeWidth={1.2} />
            </button>
          )}
        </label>

        {/* Category & Style add-chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flex: 1,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <ChipMenu
            label={t("catalog.filter.category")}
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            selected={categories}
            onToggle={(v) => toggleInList("category", categories, v)}
          />
          <ChipMenu
            label={t("catalog.filter.style")}
            options={Object.entries(STYLE_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            selected={styles}
            onToggle={(v) => toggleInList("style", styles, v)}
          />
          <ChipMenu
            label={t("catalog.filter.seller")}
            options={partners.map((p) => ({ value: p.slug, label: p.name }))}
            selected={sellers}
            onToggle={(v) => toggleInList("seller", sellers, v)}
          />

          <AnimatePresence>
            {activeChips.map((c) => (
              <motion.button
                layout
                key={c.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                onClick={c.onRemove}
                className="chip solid"
                style={{ cursor: "pointer", fontSize: 11 }}
              >
                {c.label} <span style={{ marginLeft: 4 }}>×</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Sort */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span className="label">{t("catalog.sort")}</span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
            style={{
              border: 0,
              background: "transparent",
              fontFamily: "inherit",
              fontSize: 13,
              cursor: "pointer",
              color: "var(--color-ink)",
            }}
          >
            {SORT_KEYS.map((k) => (
              <option key={k} value={k}>
                {t(`catalog.sort.${k}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function ChipMenu({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="chip"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {label} <span>+</span>
      </button>
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "var(--color-paper)",
            border: "1px solid var(--color-hair)",
            padding: 8,
            minWidth: 220,
            boxShadow: "var(--shadow-card)",
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            maxHeight: 360,
            overflowY: "auto",
          }}
        >
          {options.map((o) => {
            const active = selected.includes(o.value);
            return (
              <button
                key={o.value}
                onClick={() => onToggle(o.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  background: active ? "var(--color-cream)" : "transparent",
                  border: 0,
                  fontFamily: "inherit",
                  fontSize: 13,
                  color: "var(--color-ink)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {o.label}
                <span
                  style={{
                    width: 14,
                    height: 14,
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
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
