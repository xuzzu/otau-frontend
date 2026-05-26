"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { T } from "@/lib/format";
import { useT } from "@/lib/i18n";
import {
  useItems,
  useMyLikes,
  useRoomTypeLabel,
  useStyleLabel,
  useToggleLike,
} from "@/lib/hooks";
import { resolveCatalogAsset } from "@/lib/api/env";
import type { Item, ItemSummary } from "@/lib/api/types";

export function SimilarItems({ product }: { product: Item }) {
  const { t } = useT();
  const primaryStyleId = product.style_ids[0] ?? null;
  const roomId = product.room_target_id ?? null;
  const styleLabel = useStyleLabel(primaryStyleId);
  const roomLabel = useRoomTypeLabel(roomId);

  const styleQ = useItems(
    primaryStyleId ? { style_id: primaryStyleId, limit: 8 } : { limit: 0 },
  );
  const roomQ = useItems(
    roomId ? { room_target_id: roomId, limit: 8 } : { limit: 0 },
  );

  const styleRow = useMemo(() => {
    return (styleQ.data ?? [])
      .filter((r) => r.id !== product.id)
      .slice(0, 3);
  }, [styleQ.data, product.id]);

  const roomRow = useMemo(() => {
    const excluded = new Set<string>([product.id, ...styleRow.map((r) => r.id)]);
    return (roomQ.data ?? [])
      .filter((r) => !excluded.has(r.id))
      .slice(0, 4);
  }, [roomQ.data, styleRow, product.id]);

  if (styleRow.length === 0 && roomRow.length === 0) return null;

  return (
    <section style={{ padding: "8px 56px 48px" }}>
      {styleRow.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <SectionHeader
            kicker={t("similar.style")}
            label={styleLabel || ""}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginTop: 14,
            }}
          >
            {styleRow.map((p) => (
              <SimilarCard key={p.id} product={p} size="lg" />
            ))}
          </div>
        </div>
      )}
      {roomRow.length > 0 && (
        <div>
          <SectionHeader
            kicker={t("similar.room")}
            label={roomLabel || ""}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 16,
              marginTop: 14,
            }}
          >
            {roomRow.map((p) => (
              <SimilarCard key={p.id} product={p} size="sm" />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SectionHeader({ kicker, label }: { kicker: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        borderBottom: "1px solid var(--color-hair)",
        paddingBottom: 8,
      }}
    >
      <span
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-taupe)",
        }}
      >
        {kicker}
      </span>
      {label && (
        <span
          className="serif it"
          style={{ fontSize: 20, color: "var(--color-ink)" }}
        >
          — {label}
        </span>
      )}
    </div>
  );
}

function SimilarCard({
  product,
  size,
}: {
  product: ItemSummary;
  size: "lg" | "sm";
}) {
  const { t } = useT();
  const likes = useMyLikes();
  const toggle = useToggleLike();
  const isLiked = !!likes.data?.some(
    (l) => l.target_kind === "item" && l.target_id === product.id,
  );
  const imageUrl = resolveCatalogAsset(product.main_image_url);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Link
        href={`/catalog/${product.slug}`}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          display: "block",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Photo
          src={imageUrl ?? undefined}
          label={product.name}
          style={{ position: "absolute", inset: 0 }}
        />
      </Link>
      {size === "lg" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 14, lineHeight: 1.3 }}>{product.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="num" style={{ fontSize: 14, whiteSpace: "nowrap" }}>
              {product.default_price != null ? T(product.default_price) : ""}
            </span>
            <button
              type="button"
              aria-pressed={isLiked}
              aria-label={isLiked ? t("product.liked") : t("product.like")}
              onClick={() =>
                toggle.mutate({
                  target_kind: "item",
                  target_id: product.id,
                  currentlyLiked: isLiked,
                })
              }
              style={{
                border: 0,
                background: "transparent",
                cursor: "pointer",
                padding: 0,
                color: "var(--color-ink)",
              }}
            >
              <HeartIcon filled={isLiked} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 12, lineHeight: 1.3 }}>{product.name}</div>
      )}
    </div>
  );
}

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="14" height="13" viewBox="0 0 18 16" fill="none" aria-hidden>
      <path
        d="M9 14 C 3 10, 1 7, 1 4.5 a 3.5 3.5 0 0 1 7 0 a 3.5 3.5 0 0 1 7 0 C 15 7, 13 10, 9 14 Z"
        stroke="currentColor"
        strokeWidth="1"
        fill={filled ? "currentColor" : "none"}
      />
    </svg>
  );
}
