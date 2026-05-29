"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { resolveCatalogAsset } from "@/lib/api/env";
import { getAlternates, getRoomScenes } from "@/lib/api/generation";
import type {
  AlternatesResponse,
  ReplaceItemSummary,
  RoomScenesResponse,
} from "@/lib/api/types";
import { qk } from "@/lib/hooks/queryKeys";
import { T } from "@/lib/format";
import { useT } from "@/lib/i18n";

type Props = {
  genId: string;
  roomId: string;
  /** The item currently occupying the slot being edited. */
  originalItemId: string;
  /** Full current selection — used to tell which swaps are already rendered. */
  selectedItemIds: string[];
  /** Bounding rect of the Replace button this popover is anchored to. */
  anchorRect: DOMRect;
  onClose: () => void;
  onSelected: (newItemId: string) => void;
};

const POPOVER_WIDTH = 360;
const POPOVER_MAX_HEIGHT = 520;
const VIEWPORT_PAD = 8;
const MAX_ALTS = 8;

type Option = ReplaceItemSummary & { instant: boolean };

export default function ReplaceItemPopover({
  genId,
  roomId,
  originalItemId,
  selectedItemIds,
  anchorRect,
  onClose,
  onSelected,
}: Props) {
  const { t } = useT();
  const ref = useRef<HTMLDivElement | null>(null);

  const { data: altData, isLoading } = useQuery<AlternatesResponse>({
    queryKey: ["alternates", genId, roomId],
    queryFn: () => getAlternates(genId, roomId),
    staleTime: 60_000,
  });
  const { data: scenesData } = useQuery<RoomScenesResponse>({
    queryKey: qk.roomScenes(genId, roomId),
    queryFn: () => getRoomScenes(genId, roomId),
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

  // Split candidates into "already rendered in this slot" (instant cache-hit
  // revert) and "fresh alternates" (a swap triggers a new render). An item X
  // is instant iff swapping the current slot to X yields a combination that
  // already has a rendered scene — i.e. (selection without the slot) ∪ {X}
  // matches some scene's item set.
  const { used, alternates } = useMemo(() => {
    const baseOthers = selectedItemIds.filter((id) => id !== originalItemId);
    const baseSet = new Set(baseOthers);

    const instantIds = new Set<string>();
    for (const sc of scenesData?.scenes ?? []) {
      const ids = sc.selected_item_ids;
      if (ids.length !== baseOthers.length + 1) continue;
      if (!baseOthers.every((b) => ids.includes(b))) continue;
      const extra = ids.filter((x) => !baseSet.has(x));
      if (extra.length === 1 && extra[0] !== originalItemId) {
        instantIds.add(extra[0]);
      }
    }

    const sceneItems = scenesData?.items ?? {};
    const altList = altData?.by_item?.[originalItemId] ?? [];
    const altById = new Map(altList.map((a) => [a.id, a] as const));

    const seen = new Set<string>();
    const used: Option[] = [];
    for (const x of instantIds) {
      const meta = sceneItems[x] ?? altById.get(x);
      if (!meta) continue; // need metadata to render a card
      used.push({ ...meta, instant: true });
      seen.add(x);
    }

    const alternates: Option[] = [];
    for (const a of altList) {
      if (seen.has(a.id) || alternates.length >= MAX_ALTS) continue;
      alternates.push({ ...a, instant: false });
      seen.add(a.id);
    }

    return { used, alternates };
  }, [scenesData, altData, selectedItemIds, originalItemId]);

  const isEmpty = !isLoading && used.length === 0 && alternates.length === 0;

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
        boxShadow: "0 12px 32px -10px rgba(0,0,0,.28)",
        padding: 16,
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
          marginBottom: 12,
        }}
      >
        {t("studio.replace.title")}
      </div>

      {isLoading && <SkeletonGrid />}

      {isEmpty && (
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

      {used.length > 0 && (
        <Section
          label={t("studio.replace.section_used")}
          options={used}
          badge={t("studio.replace.badge_instant")}
          badgeTone="instant"
          onPick={onSelected}
        />
      )}

      {alternates.length > 0 && (
        <Section
          label={t("studio.replace.section_alts")}
          options={alternates}
          badge={t("studio.replace.badge_render")}
          badgeTone="render"
          onPick={onSelected}
          style={{ marginTop: used.length > 0 ? 16 : 0 }}
        />
      )}
    </div>
  );
}

function Section({
  label,
  options,
  badge,
  badgeTone,
  onPick,
  style,
}: {
  label: string;
  options: Option[];
  badge: string;
  badgeTone: "instant" | "render";
  onPick: (id: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      <div
        className="mono"
        style={{
          fontSize: 9,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "var(--color-taupe)",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map((it) => (
          <AlternateCard
            key={it.id}
            item={it}
            badge={badge}
            badgeTone={badgeTone}
            onPick={() => onPick(it.id)}
          />
        ))}
      </div>
    </div>
  );
}

function AlternateCard({
  item,
  badge,
  badgeTone,
  onPick,
}: {
  item: Option;
  badge: string;
  badgeTone: "instant" | "render";
  onPick: () => void;
}) {
  const imgSrc = resolveCatalogAsset(item.main_image_url);
  const instant = badgeTone === "instant";
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
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt={item.name ?? item.id}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "var(--color-hair)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "var(--color-hair)" }} />
        )}
        <span
          className="mono"
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            fontSize: 8,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "2px 5px",
            color: instant ? "#1f6f4a" : "var(--color-taupe)",
            background: instant ? "rgba(220,245,232,.92)" : "rgba(255,255,255,.9)",
            border: `1px solid ${instant ? "#9fd6bb" : "var(--color-hair)"}`,
          }}
        >
          {badge}
        </span>
      </div>
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
        <div className="num" style={{ fontSize: 11, color: "var(--color-taupe)" }}>
          {T(item.default_price)}
        </div>
      )}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
          <div style={{ width: "100%", aspectRatio: "1 / 1", background: "var(--color-hair)" }} />
          <div style={{ height: 8, background: "var(--color-hair)" }} />
          <div style={{ height: 8, width: "60%", background: "var(--color-hair)" }} />
        </div>
      ))}
    </div>
  );
}
