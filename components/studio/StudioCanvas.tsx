"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Photo } from "@/components/ui/Photo";
import { useDesign, useMyRoom, type RoomKey } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { T } from "@/lib/format";
import {
  useGeneration,
  useGenerationRoomItems,
  useItems,
  usePartners,
} from "@/lib/hooks";
import { qk } from "@/lib/hooks/queryKeys";
import { resolveCatalogAsset } from "@/lib/api/env";
import { replaceItem } from "@/lib/api/generation";
import type {
  GenerationRoom,
  ItemSummary,
} from "@/lib/api/types";
import { SceneViewport } from "./SceneViewport";
import ReplaceItemPopover from "./ReplaceItemPopover";
import { joinHotspotsToItems } from "@/lib/studio/joinHotspots";

type RoomBox = {
  key: RoomKey;
  i18n: string;
  area: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

const PLAN_W = 480;
const PLAN_H = 320;
const PLAN_ROOMS: RoomBox[] = [
  { key: "Living", i18n: "room.living", area: 24, x: 0, y: 0, w: 300, h: 200 },
  { key: "Bedroom", i18n: "room.bedroom", area: 14, x: 300, y: 0, w: 180, h: 200 },
  { key: "Kitchen", i18n: "room.kitchen", area: 10, x: 0, y: 200, w: 220, h: 120 },
  { key: "Workspace", i18n: "room.workspace", area: 10, x: 220, y: 200, w: 260, h: 120 },
];

const ROOM_FALLBACK: RoomKey = "Living";

function capitalize(s: string | null | undefined): RoomKey | null {
  if (!s) return null;
  const cap = (s.charAt(0).toUpperCase() + s.slice(1)) as RoomKey;
  return PLAN_ROOMS.some((r) => r.key === cap) ? cap : null;
}

export function StudioCanvas() {
  const { t } = useT();
  const {
    spaceId,
    scope,
    styles,
    budget,
    selectedRoom,
    setSelectedRoom,
    generationId,
  } = useDesign();

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [isEvening, setIsEvening] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [replacePopoverState, setReplacePopoverState] = useState<{
    itemId: string;
    anchor: DOMRect;
  } | null>(null);
  const [replaceError, setReplaceError] = useState<string | null>(null);
  const rowRefsRef = useRef(new Map<string, HTMLDivElement>());
  const addMyRoom = useMyRoom((s) => s.add);
  const queryClient = useQueryClient();

  const active: RoomKey =
    scope === "room"
      ? capitalize(spaceId) ?? ROOM_FALLBACK
      : selectedRoom ?? ROOM_FALLBACK;

  useEffect(() => {
    if (scope === "apartment" && !selectedRoom) setSelectedRoom(ROOM_FALLBACK);
  }, [scope, selectedRoom, setSelectedRoom]);

  const genQ = useGeneration(generationId);
  const gen = genQ.data ?? null;

  // Right-column items: prefer generation-curated picks, fall back to room-filtered catalog.
  const genRoomItemsQ = useGenerationRoomItems(generationId, active);
  const fallbackItemsQ = useItems({ limit: 24 });
  const items: ItemSummary[] =
    (genRoomItemsQ.data && genRoomItemsQ.data.length > 0
      ? genRoomItemsQ.data
      : generationId
      ? genRoomItemsQ.data ?? []
      : fallbackItemsQ.data ?? []) as ItemSummary[];

  const loadingItems = genRoomItemsQ.isLoading || fallbackItemsQ.isLoading;

  const activeBox = useMemo(
    () => PLAN_ROOMS.find((r) => r.key === active) ?? PLAN_ROOMS[0],
    [active]
  );

  const activeGenRoom: GenerationRoom | null = useMemo(() => {
    if (!gen) return null;
    return gen.rooms.find((r) => r.room_type === active) ?? null;
  }, [gen, active]);

  const replaceMutation = useMutation({
    mutationFn: ({ oldId, newId }: { oldId: string; newId: string }) => {
      if (!generationId || !activeGenRoom) {
        return Promise.reject(new Error("No active room"));
      }
      return replaceItem(generationId, activeGenRoom.id, oldId, newId);
    },
    onSuccess: () => {
      if (generationId) {
        queryClient.invalidateQueries({ queryKey: qk.generation(generationId) });
      }
      setReplaceError(null);
    },
    onError: (err) => {
      setReplaceError(err instanceof Error ? err.message : String(err));
    },
  });

  useEffect(() => {
    setHiddenIds(new Set());
  }, [active]);

  useEffect(() => {
    setActiveId(null);
    setHoverId(null);
    setActiveImageIndex(0);
  }, [active]);

  const visibleItems = useMemo(
    () => items.filter((it) => !hiddenIds.has(it.id)),
    [items, hiddenIds]
  );

  // Hotspots are per-image — each scene has its own bounding boxes.
  const hotspots =
    activeImageIndex === 1
      ? activeGenRoom?.hotspots_2 ?? []
      : activeGenRoom?.hotspots ?? [];
  const rows = useMemo(
    () => joinHotspotsToItems(visibleItems, hotspots, hiddenIds),
    [visibleItems, hotspots, hiddenIds],
  );

  const partnersQ = usePartners();
  const partnerById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of partnersQ.data ?? []) m.set(p.id, p.name);
    return m;
  }, [partnersQ.data]);

  const total = visibleItems.reduce(
    (sum, p) => sum + (p.default_price ?? 0),
    0,
  );
  const isApartment = scope === "apartment";

  const handleRemove = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (activeId === id) setActiveId(null);
    if (hoverId === id) setHoverId(null);
  };
  const handleRestoreAll = () => setHiddenIds(new Set());
  const handleAddAllToMyRoom = () => {
    visibleItems.forEach((it) => addMyRoom(it.id));
  };

  const handleActivate = (itemId: string) => {
    setActiveId(itemId);
    const el = rowRefsRef.current.get(itemId);
    if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
  };

  const handleHoverEnter = (itemId: string) => setHoverId(itemId);
  const handleHoverLeave = (_itemId: string) => setHoverId(null);

  const highlightedId = hoverId ?? activeId;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-cream)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "1px solid var(--color-hair)",
          background: "var(--color-paper)",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <Link
            href="/"
            className="serif"
            style={{ fontSize: 22, color: "inherit", textDecoration: "none" }}
          >
            Otaū
          </Link>
          <span style={{ color: "var(--color-taupe)" }}>/</span>
          <span className="label">{t("studio.myroom")}</span>
          <span className="chip" style={{ marginLeft: 8 }}>
            <span className="dot" />
            {t("studio.draft")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn ghost small">{t("studio.share")}</button>
          <button className="btn small">{t("studio.send")}</button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isApartment ? "240px 1fr 400px" : "1fr 420px",
          flex: 1,
          minHeight: 0,
        }}
      >
        {isApartment && (
          <aside
            style={{
              borderRight: "1px solid var(--color-hair)",
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "var(--color-paper)",
            }}
          >
            <CompactSchematic active={active} t={t} />

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="label" style={{ marginBottom: 4 }}>
                {t("studio.rooms_label")}
              </div>
              {PLAN_ROOMS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setSelectedRoom(r.key)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 10px",
                    background: active === r.key ? "var(--color-ink)" : "transparent",
                    color: active === r.key ? "var(--color-paper)" : "var(--color-ink)",
                    border: `1px solid ${
                      active === r.key ? "var(--color-ink)" : "var(--color-hair)"
                    }`,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "background .2s, color .2s, border-color .2s",
                  }}
                >
                  <span style={{ fontSize: 13 }}>{t(r.i18n)}</span>
                  <span
                    className="mono"
                    style={{ fontSize: 10, letterSpacing: "0.10em" }}
                  >
                    {r.area} м²
                  </span>
                </button>
              ))}
            </div>
          </aside>
        )}

        <section
          style={{
            position: "relative",
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            minWidth: 0,
            background: "var(--color-cream)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div className="label">{t("studio.plan_label")}</div>
              <div
                className="serif it"
                style={{ fontSize: 28, marginTop: 4, lineHeight: 1.05 }}
              >
                {t(activeBox.i18n)} · {activeBox.area} м²
              </div>
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-taupe)",
              }}
            >
              {activeGenRoom?.status ? activeGenRoom.status.toUpperCase() : t("studio.status.demo")}
            </div>
          </div>

          <SceneViewport
            genRoom={activeGenRoom}
            rows={rows}
            activeId={highlightedId}
            onActivate={handleActivate}
            onHoverEnter={handleHoverEnter}
            onHoverLeave={handleHoverLeave}
            activeImageIndex={activeImageIndex}
            onSelectImageIndex={setActiveImageIndex}
            isReplacing={activeGenRoom?.status === "replacing"}
          />

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              borderTop: "1px solid var(--color-hair)",
              paddingTop: 14,
            }}
          >
            <button
              className="btn ghost small"
              onClick={() => setIsEvening((v) => !v)}
              title={t("studio.tooltip.cycle_lighting")}
            >
              {isEvening ? "☾" : "☀︎"}{" "}
              {t(isEvening ? "studio.lighting.evening" : "studio.lighting.day")}
            </button>
            <button
              className="btn ghost small"
              onClick={() => alert(t("studio.alert.regenerate_pending"))}
              title={t("studio.tooltip.regenerate")}
            >
              {t("studio.btn.regenerate")}
            </button>
            <div style={{ flex: 1 }} />
            <span
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-taupe)",
              }}
            >
              {t("studio.status.pieces_removed", {
                pieces: visibleItems.length,
                removed: hiddenIds.size,
              })}
            </span>
          </div>
        </section>

        <aside
          style={{
            borderLeft: "1px solid var(--color-hair)",
            background: "var(--color-paper)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "22px 22px 18px",
              borderBottom: "1px solid var(--color-hair)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div>
              <div className="label">{t("studio.total_label")}</div>
              <div
                className="serif num"
                style={{ fontSize: 32, lineHeight: 1, marginTop: 6 }}
              >
                {T(total)}
              </div>
              <div className="label" style={{ marginTop: 6 }}>
                {t("studio.items_sellers", {
                  items: visibleItems.length,
                  sellers: new Set(
                    visibleItems
                      .map((p) => partnerById.get(p.partner_id))
                      .filter(Boolean),
                  ).size,
                })}
              </div>
              <div
                style={{
                  marginTop: 10,
                  height: 4,
                  background: "var(--color-hair)",
                  position: "relative",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, budget > 0 ? (total / budget) * 100 : 0)}%`,
                  }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background: total > budget ? "#C9694A" : "var(--color-clay)",
                  }}
                />
              </div>
              <div className="label" style={{ marginTop: 6 }}>
                {t("studio.budget_label")} {T(budget)}
              </div>
            </div>

            {styles.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {styles.map((s) => (
                  <span key={s} className="chip solid" style={{ fontSize: 10 }}>
                    {t(`style.${s}`)}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              padding: "14px 22px",
              borderBottom: "1px solid var(--color-hair)",
            }}
          >
            <div className="label">{t("studio.in_render")}</div>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {loadingItems ? (
              <div className="label" style={{ padding: 24 }}>
                {t("common.loading")}
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="label" style={{ padding: 24 }}>
                {hiddenIds.size > 0 ? (
                  <>
                    {t("studio.empty.all_removed")}{" "}
                    <button
                      onClick={handleRestoreAll}
                      className="btn ghost small"
                      style={{ marginLeft: 6 }}
                    >
                      {t("studio.btn.restore")}
                    </button>
                  </>
                ) : activeGenRoom?.status === "done" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ color: "#c9694a" }}>
                      {t("studio.empty.no_match_title")}
                    </span>
                    <span className="mono" style={{ fontSize: 10 }}>
                      {t("studio.empty.no_match_sub")}
                    </span>
                  </div>
                ) : activeGenRoom?.status === "failed" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ color: "#c9694a" }}>{t("studio.empty.room_failed")}</span>
                    {activeGenRoom.error && (
                      <span className="mono" style={{ fontSize: 10 }}>
                        {activeGenRoom.error.slice(0, 200)}
                      </span>
                    )}
                  </div>
                ) : (
                  t("studio.empty.pipeline_running")
                )}
              </div>
            ) : (
              rows.map((r) => (
                <StudioProductItem
                  key={r.item.id}
                  n={r.n}
                  item={r.item}
                  partnerName={partnerById.get(r.item.partner_id) ?? ""}
                  active={highlightedId === r.item.id}
                  onActivate={() => setActiveId(r.item.id)}
                  onHoverEnter={() => setHoverId(r.item.id)}
                  onHoverLeave={() => setHoverId(null)}
                  rowRef={(el) => {
                    if (el) rowRefsRef.current.set(r.item.id, el);
                    else rowRefsRef.current.delete(r.item.id);
                  }}
                  onRemove={() => handleRemove(r.item.id)}
                  onReplace={(rect: DOMRect) =>
                    setReplacePopoverState({ itemId: r.item.id, anchor: rect })
                  }
                />
              ))
            )}
          </div>
          <div
            style={{
              borderTop: "1px solid var(--color-hair)",
              padding: "16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {hiddenIds.size > 0 && (
              <button
                onClick={handleRestoreAll}
                className="btn ghost small"
                title={t("studio.tooltip.restore")}
                style={{ alignSelf: "flex-start" }}
              >
                {t("studio.btn.restore_n", { n: hiddenIds.size })}
              </button>
            )}
            <button
              className="btn clay"
              onClick={handleAddAllToMyRoom}
              disabled={visibleItems.length === 0}
              title={t("studio.tooltip.add_all")}
              style={{
                width: "100%",
                justifyContent: "center",
                fontSize: 15,
                padding: "16px 22px",
              }}
            >
              <span className="arrow" aria-hidden>
                +
              </span>
              {t("studio.btn.add_all_room")}
            </button>
          </div>
        </aside>
      </div>

      {replacePopoverState && activeGenRoom && generationId && (
        <ReplaceItemPopover
          genId={generationId}
          roomId={activeGenRoom.id}
          originalItemId={replacePopoverState.itemId}
          anchorRect={replacePopoverState.anchor}
          onClose={() => setReplacePopoverState(null)}
          onSelected={(newId) => {
            replaceMutation.mutate({
              oldId: replacePopoverState.itemId,
              newId,
            });
            setReplacePopoverState(null);
          }}
        />
      )}

      {replaceError && (
        <div
          role="alert"
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "white",
            border: "1px solid var(--color-hair)",
            padding: "8px 16px",
            fontSize: 12,
            zIndex: 30,
          }}
        >
          {t("studio.replace.error")}
          <button
            onClick={() => setReplaceError(null)}
            style={{
              marginLeft: 12,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
}

function CompactSchematic({
  active,
  t,
}: {
  active: RoomKey;
  t: (k: string) => string;
}) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 8 }}>
        {t("studio.plan_label")}
      </div>
      <div
        style={{
          background: "var(--color-cream)",
          border: "1px solid var(--color-hair)",
          padding: 8,
        }}
        aria-label={t("studio.plan.aria")}
      >
        <svg
          viewBox={`0 0 ${PLAN_W} ${PLAN_H}`}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          <rect
            x="0"
            y="0"
            width={PLAN_W}
            height={PLAN_H}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={2}
          />
          {PLAN_ROOMS.map((r) => {
            const selected = active === r.key;
            return (
              <g key={r.key} style={{ cursor: "default" }}>
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={selected ? "var(--color-ink)" : "var(--color-paper)"}
                  stroke="var(--color-ink)"
                  strokeWidth={1}
                  style={{ transition: "fill .25s" }}
                />
                <text
                  x={r.x + r.w / 2}
                  y={r.y + r.h / 2 + 6}
                  fill={selected ? "var(--color-paper)" : "var(--color-ink)"}
                  fontFamily="var(--font-mono)"
                  fontSize={16}
                  letterSpacing="0.14em"
                  textAnchor="middle"
                  style={{ pointerEvents: "none", textTransform: "uppercase" }}
                >
                  {r.key.slice(0, 3).toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function StudioProductItem({
  n,
  item,
  partnerName,
  active,
  rowRef,
  onActivate,
  onHoverEnter,
  onHoverLeave,
  onRemove,
  onReplace,
}: {
  n: number;
  item: ItemSummary;
  partnerName: string;
  active?: boolean;
  rowRef?: (el: HTMLDivElement | null) => void;
  onActivate?: () => void;
  onHoverEnter?: () => void;
  onHoverLeave?: () => void;
  onRemove?: () => void;
  onReplace?: (rect: DOMRect) => void;
}) {
  const { t } = useT();
  return (
    <div
      ref={rowRef}
      onClick={onActivate}
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
      className="studio-product-item"
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 20px",
        borderBottom: "1px solid var(--color-hair)",
        background: active ? "rgba(181,83,46,.05)" : "transparent",
        borderLeft: `2px solid ${active ? "var(--color-clay)" : "transparent"}`,
        transition: "background .2s, border-left-color .2s",
        cursor: "pointer",
      }}
    >
      <Link
        href={`/catalog/${item.slug}`}
        style={{
          display: "flex",
          gap: 14,
          flex: 1,
          minWidth: 0,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div style={{ width: 64, height: 64, flexShrink: 0 }}>
          <Photo
            src={resolveCatalogAsset(item.main_image_url) ?? undefined}
            label={item.name}
            style={{ width: 64, height: 64 }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              className="mono"
              style={{ fontSize: 10, color: "var(--color-taupe)" }}
            >
              {String(n).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.25 }}>{item.name}</span>
          </div>
          <div className="label" style={{ marginTop: 4 }}>
            {partnerName}
          </div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span className="num" style={{ fontSize: 13 }}>
              {item.default_price != null ? T(item.default_price) : ""}
            </span>
          </div>
        </div>
      </Link>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          alignSelf: "center",
        }}
      >
        {onReplace && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReplace(e.currentTarget.getBoundingClientRect());
            }}
            className="mono"
            title={t("studio.tooltip.replace")}
            style={{
              background: "transparent",
              border: "1px solid var(--color-hair)",
              padding: "4px 8px",
              fontSize: 9,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              cursor: "pointer",
              color: "var(--color-ink)",
            }}
          >
            {t("studio.btn.replace")}
          </button>
        )}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="mono"
            title={t("studio.tooltip.remove")}
            style={{
              background: "transparent",
              border: "1px solid var(--color-hair)",
              padding: "4px 8px",
              fontSize: 9,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              cursor: "pointer",
              color: "var(--color-ink)",
            }}
          >
            {t("studio.btn.remove")}
          </button>
        )}
      </div>
    </div>
  );
}
