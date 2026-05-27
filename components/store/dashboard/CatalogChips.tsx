"use client";
import { useT } from "@/lib/i18n";
import type { CatalogCounts, ItemBucket } from "@/lib/store-api/types";

const ORDER: { key: ItemBucket; labelKey: string; attention?: boolean }[] = [
  { key: "all", labelKey: "store.dashboard.bucket.all" },
  { key: "active", labelKey: "store.dashboard.bucket.active" },
  { key: "drafts", labelKey: "store.dashboard.bucket.drafts" },
  { key: "attention", labelKey: "store.dashboard.bucket.attention", attention: true },
  { key: "promoted", labelKey: "store.dashboard.bucket.promoted" },
  { key: "archived", labelKey: "store.dashboard.bucket.archived" },
];

export function CatalogChips({
  current, counts, onChange,
}: {
  current: ItemBucket;
  counts: CatalogCounts | undefined;
  onChange: (b: ItemBucket) => void;
}) {
  const { t } = useT();

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {ORDER.map(({ key, labelKey, attention }) => {
        const active = current === key;
        const n = counts?.[key as keyof CatalogCounts] ?? 0;
        const label = t(labelKey);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className="mono"
            data-active={active}
            data-attention={!!attention}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 16px", borderRadius: 999,
              border: `1px solid ${
                active && attention ? "var(--color-clay)" :
                active ? "var(--color-ink)" :
                attention ? "rgba(181,83,46,.4)" : "var(--color-hair)"
              }`,
              background: active ? (attention ? "var(--color-clay)" : "var(--color-ink)") : "var(--color-paper)",
              color: active ? "var(--color-paper)" : (attention ? "var(--color-clay)" : "var(--color-ink)"),
              fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            {label}
            <span style={{
              paddingLeft: 6, borderLeft: `1px solid ${active ? "rgba(251,248,242,.2)" : "var(--color-hair-2)"}`,
              color: active ? "rgba(251,248,242,.65)" : "var(--color-taupe)",
              fontFeatureSettings: "'tnum'",
            }}>
              {n}
            </span>
          </button>
        );
      })}
    </div>
  );
}
