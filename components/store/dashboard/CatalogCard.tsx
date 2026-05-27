"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { Photo } from "@/components/ui/Photo";
import { MagicHintChip, MagicHintBody } from "@/components/store/shared/MagicHint";
import { T } from "@/lib/format";
import { resolveCatalogAsset } from "@/lib/api/env";
import type { StoreItemSummary } from "@/lib/store-api/types";

const LOW = 3;

export function CatalogCard({ item }: { item: StoreItemSummary }) {
  const { t } = useT();
  const href = item.magic_hint
    ? `/store/catalog/${item.id}/edit?assist=${item.magic_hint.kind}`
    : `/store/catalog/${item.id}/edit`;

  const stockTone =
    item.in_stock_current_shop === 0 ? "zero" :
    item.in_stock_current_shop <= LOW ? "low" : "ok";

  return (
    <Link
      href={href}
      style={{
        background: "var(--color-paper)", border: "1px solid var(--color-hair)",
        overflow: "hidden", textDecoration: "none", color: "inherit",
        display: "block", position: "relative", transition: "transform .2s, box-shadow .2s",
      }}
    >
      <div style={{ aspectRatio: "1.25 / 1", position: "relative" }}>
        <Photo src={resolveCatalogAsset(item.main_image_url) ?? undefined} alt="" />

        {item.status === "draft" && (
          <Badge variant="draft" position="tl">{t("store.dashboard.card.draft")}</Badge>
        )}
        {item.status === "active" && stockTone === "low" && (
          <Badge variant="urgent" position="tl">
            {t("store.dashboard.card.low", { n: item.in_stock_current_shop })}
          </Badge>
        )}
        {item.magic_hint && (
          <span style={{ position: "absolute", top: 10, right: 10 }}>
            <MagicHintChip shortLabel={item.magic_hint.short_label} />
          </span>
        )}
        {item.has_active_promotion && !item.magic_hint && (
          <Badge variant="promo" position="tr">{t("store.dashboard.card.sale")}</Badge>
        )}
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
          <div className="serif" style={{ fontSize: 18, lineHeight: 1.15 }}>{item.name}</div>
          <div className="serif num" style={{ fontSize: 17, whiteSpace: "nowrap" }}>
            {item.default_price != null ? T(item.default_price) : "—"}
          </div>
        </div>
        <div className="mono" style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 8, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--color-taupe)",
        }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{
              width: 5, height: 5, borderRadius: 999,
              background:
                stockTone === "low" ? "var(--color-clay)" :
                stockTone === "zero" ? "var(--color-ink)" :
                "var(--color-moss)",
            }} />
            {t("store.dashboard.card.in_stock", { n: item.in_stock_current_shop })}
          </span>
        </div>
        {item.magic_hint && (
          <MagicHintBody body={item.magic_hint.body} />
        )}
      </div>
    </Link>
  );
}

function Badge({ children, variant, position }: {
  children: React.ReactNode;
  variant: "urgent" | "draft" | "featured" | "promo";
  position: "tl" | "tr";
}) {
  const styles: React.CSSProperties = {
    position: "absolute", top: 10, padding: "5px 10px",
    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em",
    textTransform: "uppercase",
    ...(position === "tl" ? { left: 10 } : { right: 10 }),
  };
  if (variant === "urgent") return <span style={{ ...styles, background: "var(--color-clay)", color: "var(--color-paper)" }}>{children}</span>;
  if (variant === "draft") return <span style={{ ...styles, background: "rgba(154,138,114,.94)", color: "var(--color-paper)" }}>{children}</span>;
  if (variant === "featured") return <span style={{ ...styles, background: "var(--color-ink)", color: "var(--color-paper)" }}>{children}</span>;
  return <span style={{ ...styles, background: "var(--color-moss)", color: "var(--color-paper)" }}>{children}</span>;
}
