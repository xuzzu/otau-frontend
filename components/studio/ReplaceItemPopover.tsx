"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { resolveCatalogAsset } from "@/lib/api/env";
import { getAlternates } from "@/lib/api/generation";
import type { AlternatesResponse, ReplaceItemSummary } from "@/lib/api/types";
import { T } from "@/lib/format";
import { useT } from "@/lib/i18n";

type Props = {
  genId: string;
  roomId: string;
  originalItemId: string;
  /** Bounding rect of the Replace button this popover is anchored to. */
  anchorRect: DOMRect;
  onClose: () => void;
  onSelected: (newItemId: string) => void;
};

const POPOVER_WIDTH = 280;
const POPOVER_MAX_HEIGHT = 360;
const VIEWPORT_PAD = 8;
const MAX_ALTS = 5;

export default function ReplaceItemPopover({
  genId,
  roomId,
  originalItemId,
  anchorRect,
  onClose,
  onSelected,
}: Props) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement | null>(null);

  const { data, isLoading } = useQuery<AlternatesResponse>({
    queryKey: ["alternates", genId, roomId],
    queryFn: () => getAlternates(genId, roomId),
    staleTime: 60_000,
  });

  // Esc + click-outside. The click-outside listener is attached on the next
  // tick so the same click that opened this popover doesn't immediately close
  // it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    const handle = window.setTimeout(
      () => window.addEventListener("click", onDocClick),
      0,
    );
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onDocClick);
      window.clearTimeout(handle);
    };
  }, [onClose]);

  // Position relative to the anchor button. Default: below; flip above when
  // there's not enough room. Clamp `left` to stay on-screen.
  const placeAbove =
    anchorRect.bottom + POPOVER_MAX_HEIGHT + VIEWPORT_PAD >
    window.innerHeight;
  const left = Math.max(
    VIEWPORT_PAD,
    Math.min(
      anchorRect.left,
      window.innerWidth - POPOVER_WIDTH - VIEWPORT_PAD,
    ),
  );
  const positionStyle: React.CSSProperties = placeAbove
    ? { bottom: window.innerHeight - anchorRect.top + VIEWPORT_PAD, left }
    : { top: anchorRect.bottom + VIEWPORT_PAD, left };

  const alts: ReplaceItemSummary[] =
    data?.by_item?.[originalItemId]?.slice(0, MAX_ALTS) ?? [];

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={t("studio.replace.title")}
      style={{
        position: "fixed",
        ...positionStyle,
        width: POPOVER_WIDTH,
        maxHeight: POPOVER_MAX_HEIGHT,
        background: "var(--color-paper)",
        border: "1px solid var(--color-hair)",
        boxShadow: "0 8px 24px -8px rgba(0,0,0,.2)",
        padding: 12,
        zIndex: 20,
        overflow: "auto",
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--color-taupe)",
          marginBottom: 10,
        }}
      >
        {t("studio.replace.title")}
      </div>

      {isLoading && <SkeletonGrid />}

      {!isLoading && alts.length === 0 && (
        <div
          style={{
            fontSize: 12,
            color: "var(--color-taupe)",
            padding: "8px 2px",
          }}
        >
          {t("studio.replace.empty")}
        </div>
      )}

      {!isLoading && alts.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
          }}
        >
          {alts.map((it) => (
            <AlternateCard
              key={it.id}
              item={it}
              onPick={() => onSelected(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AlternateCard({
  item,
  onPick,
}: {
  item: ReplaceItemSummary;
  onPick: () => void;
}) {
  const imgSrc = resolveCatalogAsset(item.main_image_url);
  return (
    <button
      type="button"
      onClick={onPick}
      style={{
        background: "transparent",
        border: "1px solid var(--color-hair)",
        padding: 8,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        color: "var(--color-ink)",
      }}
    >
      {imgSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={item.name ?? item.id}
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            background: "var(--color-hair)",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            background: "var(--color-hair)",
          }}
        />
      )}
      <div
        style={{
          fontSize: 11,
          lineHeight: 1.3,
          minHeight: "2.6em",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          overflow: "hidden",
        }}
      >
        {item.name ?? item.id}
      </div>
      {item.default_price != null && (
        <div
          className="num"
          style={{ fontSize: 11, color: "var(--color-taupe)" }}
        >
          {T(item.default_price)}
        </div>
      )}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
      }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            border: "1px solid var(--color-hair)",
            padding: 8,
            opacity: 0.6,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              background: "var(--color-hair)",
            }}
          />
          <div style={{ height: 8, background: "var(--color-hair)" }} />
          <div
            style={{ height: 8, width: "60%", background: "var(--color-hair)" }}
          />
        </div>
      ))}
    </div>
  );
}
