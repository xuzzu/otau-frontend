"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { resolveCatalogAsset } from "@/lib/api/env";
import type {
  GenerationRoom,
  ItemSummary,
} from "@/lib/api/types";
import { SceneViewport } from "./SceneViewport";

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
  const [lightingIdx, setLightingIdx] = useState(0);
  const [conceptOpen, setConceptOpen] = useState(false);
  const addMyRoom = useMyRoom((s) => s.add);

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

  useEffect(() => {
    setHiddenIds(new Set());
  }, [active]);

  const visibleItems = useMemo(
    () => items.filter((it) => !hiddenIds.has(it.id)),
    [items, hiddenIds]
  );

  const partnersQ = usePartners();
  const partnerById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of partnersQ.data ?? []) m.set(p.id, p.name);
    return m;
  }, [partnersQ.data]);

  const conceptText = useMemo(() => {
    const desc = activeGenRoom?.concept?.["concept_description"];
    return typeof desc === "string" ? desc : "";
  }, [activeGenRoom]);

  const LIGHTING_OPTIONS = ["Cozy", "Minimal", "Evening"] as const;

  const spaceLabel = scope === "apartment"
    ? (spaceId ?? "Apartment").toUpperCase()
    : t("studio.default_space");

  const total = visibleItems.reduce(
    (sum, p) => sum + (p.default_price ?? 0),
    0,
  );
  const isApartment = scope === "apartment";

  const handleRemove = (id: string) =>
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  const handleRestoreAll = () => setHiddenIds(new Set());
  const handleAddAllToMyRoom = () => {
    visibleItems.forEach((it) => addMyRoom(it.id));
  };

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
          <span className="serif it" style={{ fontSize: 18 }}>
            {spaceLabel}
          </span>
          <span className="chip" style={{ marginLeft: 8 }}>
            <span className="dot" />
            {t("studio.draft")}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn ghost small">{t("studio.share")}</button>
          <button className="btn ghost small">{t("studio.export")}</button>
          <button className="btn small">{t("studio.send")}</button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr 380px",
          flex: 1,
          minHeight: 0,
        }}
      >
        <aside
          style={{
            borderRight: "1px solid var(--color-hair)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            background: "var(--color-paper)",
          }}
        >
          {isApartment && <CompactSchematic active={active} t={t} />}

          {isApartment && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="label">{t("studio.rooms_label")}</div>
              {PLAN_ROOMS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setSelectedRoom(r.key)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
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
                  <span style={{ fontSize: 14 }}>{t(r.i18n)}</span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.10em",
                    }}
                  >
                    {r.area} м²
                  </span>
                </button>
              ))}
            </div>
          )}

          <hr className="hr-hair" />

          <div>
            <div className="label">{t("studio.total_label")}</div>
            <div
              className="serif num"
              style={{ fontSize: 28, lineHeight: 1, marginTop: 8 }}
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
                marginTop: 12,
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
            <div>
              <div className="label" style={{ marginBottom: 8 }}>
                Styles
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {styles.map((s) => (
                  <span key={s} className="chip solid" style={{ fontSize: 10 }}>
                    {t(`style.${s}`)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

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
              {activeGenRoom?.status ? activeGenRoom.status.toUpperCase() : "DEMO"}
            </div>
          </div>

          <SceneViewport
            genRoom={activeGenRoom}
            rows={[]}
            activeId={null}
            onActivate={() => {}}
            onHoverEnter={() => {}}
            onHoverLeave={() => {}}
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
              onClick={() =>
                setLightingIdx((i) => (i + 1) % LIGHTING_OPTIONS.length)
              }
              title="Cycle lighting"
            >
              ☀︎ {LIGHTING_OPTIONS[lightingIdx]}
            </button>
            <button
              className="btn ghost small"
              onClick={() => setConceptOpen((v) => !v)}
              title="View or edit concept"
            >
              ✎ Concept
            </button>
            <button
              className="btn ghost small"
              onClick={() => alert("Regeneration will rerun the pipeline with the current edits — not wired yet.")}
              title="Regenerate this room"
            >
              ↻ Regenerate
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
              {visibleItems.length} pieces · {hiddenIds.size} removed
            </span>
          </div>

          {conceptOpen && conceptText && (
            <div
              style={{
                border: "1px solid var(--color-hair)",
                background: "var(--color-paper)",
                padding: 18,
              }}
            >
              <div className="label" style={{ marginBottom: 6 }}>
                Concept
              </div>
              <div className="serif it" style={{ fontSize: 16, lineHeight: 1.5 }}>
                {conceptText}
              </div>
            </div>
          )}
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
              padding: "22px 22px 12px",
              borderBottom: "1px solid var(--color-hair)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div>
              <div className="label">{t("studio.in_render")}</div>
              <div className="serif it" style={{ fontSize: 22, marginTop: 4 }}>
                {t(activeBox.i18n)} · {visibleItems.length}
              </div>
            </div>
            <button
              className="btn ghost small"
              onClick={() => alert("Add item picker — not wired yet.")}
              title="Add a piece to this room"
              style={{ padding: "6px 10px" }}
            >
              + Add
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto" }}>
            {loadingItems ? (
              <div className="label" style={{ padding: 24 }}>
                Loading…
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="label" style={{ padding: 24 }}>
                {hiddenIds.size > 0 ? (
                  <>
                    All items removed.{" "}
                    <button
                      onClick={handleRestoreAll}
                      className="btn ghost small"
                      style={{ marginLeft: 6 }}
                    >
                      Restore
                    </button>
                  </>
                ) : (
                  "No items in this room yet."
                )}
              </div>
            ) : (
              visibleItems.map((p, i) => (
                <StudioProductItem
                  key={p.id}
                  n={i + 1}
                  item={p}
                  partnerName={partnerById.get(p.partner_id) ?? ""}
                  onRemove={() => handleRemove(p.id)}
                  onReplace={() =>
                    alert("Replace — pick another candidate for this piece. Not wired yet.")
                  }
                />
              ))
            )}
          </div>
          <div
            style={{
              borderTop: "1px solid var(--color-hair)",
              padding: "14px 18px",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            {hiddenIds.size > 0 && (
              <button
                onClick={handleRestoreAll}
                className="btn ghost small"
                title="Bring removed items back"
              >
                Restore {hiddenIds.size}
              </button>
            )}
            <div style={{ flex: 1 }} />
            <button
              className="btn small"
              onClick={handleAddAllToMyRoom}
              disabled={visibleItems.length === 0}
              title="Add all visible items to My Room"
            >
              Add all to my room
            </button>
          </div>
        </aside>
      </div>
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
        aria-label="Apartment floor plan"
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
  onRemove,
  onReplace,
}: {
  n: number;
  item: ItemSummary;
  partnerName: string;
  onRemove?: () => void;
  onReplace?: () => void;
}) {
  return (
    <div
      className="studio-product-item"
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 20px",
        borderBottom: "1px solid var(--color-hair)",
        background: "transparent",
        borderLeft: "2px solid transparent",
        transition: "background .2s, border-left-color .2s",
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
            onClick={onReplace}
            className="mono"
            title="Replace with another candidate"
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
            ⇄ Replace
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="mono"
            title="Remove from this room"
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
            ✕ Remove
          </button>
        )}
      </div>
    </div>
  );
}
