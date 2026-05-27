"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { resolveGenerationAsset } from "@/lib/api/env";
import { useT } from "@/lib/i18n";
import type { GenerationRoom } from "@/lib/api/types";
import type { HotspotRow } from "@/lib/studio/joinHotspots";
import { Hotspot } from "./Hotspot";

const AUTO_SWITCH_MS = 7000;
const CROSSFADE_MS = 700;

type TFn = (k: string, params?: Record<string, string | number>) => string;

function stageLabel(status: string, t: TFn): string {
  switch (status) {
    case "queued":
      return t("scene.stage.queued");
    case "concepting":
      return t("scene.stage.concepting");
    case "retrieving":
      return t("scene.stage.retrieving");
    case "rendering":
      return t("scene.stage.rendering");
    case "hotspotting":
      return t("scene.stage.hotspotting");
    case "failed":
      return t("scene.stage.failed");
    default:
      return t("scene.stage.working");
  }
}

const SCENE_BOX_BASE: CSSProperties = {
  position: "relative",
  border: "1px solid var(--color-hair)",
  background: "var(--color-paper)",
  width: "100%",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export function SceneViewport({
  genRoom,
  rows,
  activeId,
  onActivate,
  onHoverEnter,
  onHoverLeave,
  activeImageIndex,
  onSelectImageIndex,
  isReplacing,
}: {
  genRoom: GenerationRoom | null;
  rows: HotspotRow[];
  activeId: string | null;
  onActivate: (itemId: string) => void;
  onHoverEnter: (itemId: string) => void;
  onHoverLeave: (itemId: string) => void;
  /** Optional — if provided alongside image_url_2, switches to dual-image mode. */
  activeImageIndex?: number;
  onSelectImageIndex?: (index: number) => void;
  /** When true, blur the scene image, hide hotspots, and show a "replacing" overlay. */
  isReplacing?: boolean;
}) {
  const { t } = useT();
  const status = genRoom?.status ?? null;
  const imageUrl = resolveGenerationAsset(genRoom?.image_url);
  const imageUrl2 = resolveGenerationAsset(genRoom?.image_url_2);

  const hasDual =
    !!imageUrl &&
    !!imageUrl2 &&
    activeImageIndex !== undefined &&
    onSelectImageIndex !== undefined;
  const safeActiveIndex = hasDual ? activeImageIndex ?? 0 : 0;

  // Aspect ratio tracks the active image's dims so the box doesn't reflow on
  // switch even if scene_1 and scene_2 came back with different sizes.
  const w = safeActiveIndex === 0 ? genRoom?.image_width : genRoom?.image_width_2;
  const h = safeActiveIndex === 0 ? genRoom?.image_height : genRoom?.image_height_2;
  const aspectRatio: string = w && h ? `${w} / ${h}` : "3 / 2";

  const sceneBox: CSSProperties = { ...SCENE_BOX_BASE, aspectRatio };

  // Pause auto-switch on hover so the user can study one viewpoint without
  // it changing under them.
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasDual || !onSelectImageIndex) return;
    if (isHovering) return;
    timerRef.current = setTimeout(() => {
      onSelectImageIndex(safeActiveIndex === 0 ? 1 : 0);
    }, AUTO_SWITCH_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [hasDual, isHovering, safeActiveIndex, onSelectImageIndex]);

  if (imageUrl) {
    return (
      <div className="scene-frame">
        <div
          style={sceneBox}
          data-testid="scene-box"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
        <img
          src={imageUrl}
          alt={t("scene.image_alt")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            opacity: safeActiveIndex === 0 ? 1 : 0,
            transition: `opacity ${CROSSFADE_MS}ms ease-in-out, filter 200ms ease-in-out`,
            filter: isReplacing ? "blur(8px)" : "none",
          }}
        />
        {imageUrl2 ? (
          <img
            src={imageUrl2}
            alt={t("scene.image_alt")}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              opacity: safeActiveIndex === 1 ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms ease-in-out, filter 200ms ease-in-out`,
              filter: isReplacing ? "blur(8px)" : "none",
            }}
          />
        ) : null}
        {!isReplacing &&
          rows.map((r) =>
            r.hotspot ? (
              <Hotspot
                key={r.item.id}
                n={r.n}
                x={r.hotspot.point.x}
                y={r.hotspot.point.y}
                label={r.item.name}
                active={activeId === r.item.id}
                onActivate={() => onActivate(r.item.id)}
                onHoverEnter={() => onHoverEnter(r.item.id)}
                onHoverLeave={() => onHoverLeave(r.item.id)}
              />
            ) : null,
          )}
        {hasDual && !isReplacing && onSelectImageIndex ? (
          <ImageIndexDots
            count={2}
            activeIndex={safeActiveIndex}
            onSelect={onSelectImageIndex}
            t={t}
          />
        ) : null}
        {isReplacing ? <ReplacingOverlay label={t("studio.status.replacing")} /> : null}
        </div>
      </div>
    );
  }

  if (!genRoom) {
    return (
      <div style={sceneBox} data-testid="scene-box">
        <div className="label">{t("scene.empty")}</div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        style={{ ...sceneBox, borderColor: "#c9694a", padding: 32 }}
        data-testid="scene-box"
      >
        <div style={{ textAlign: "center" }}>
          <div className="label" style={{ color: "#c9694a" }}>
            {t("scene.failed_title")}
          </div>
          <div className="mono" style={{ marginTop: 8, fontSize: 11 }}>
            {(genRoom.error ?? t("common.unknown_error")).slice(0, 200)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ ...sceneBox, flexDirection: "column", gap: 18 }}
      data-testid="scene-box"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="serif"
        style={{ fontSize: 48, color: "var(--color-clay)", lineHeight: 1 }}
      >
        ◇
      </motion.div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-taupe)",
        }}
      >
        {stageLabel(status ?? "queued", t)}
      </div>
    </div>
  );
}

function ReplacingOverlay({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      data-testid="scene-replacing-overlay"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background: "rgba(255, 255, 255, 0.4)",
        zIndex: 10,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="serif"
        aria-hidden="true"
        style={{ fontSize: 40, color: "var(--color-clay)", lineHeight: 1 }}
      >
        ◇
      </motion.div>
      <div
        className="mono"
        style={{
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-ink)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function ImageIndexDots({
  count,
  activeIndex,
  onSelect,
  t,
}: {
  count: number;
  activeIndex: number;
  onSelect: (i: number) => void;
  t: TFn;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        display: "flex",
        gap: 8,
        padding: "8px 12px",
        background: "rgba(0,0,0,0.32)",
        borderRadius: 999,
        backdropFilter: "blur(6px)",
      }}
      data-testid="scene-image-dots"
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={t("scene.angle_aria", { n: i + 1 })}
          aria-pressed={i === activeIndex}
          style={{
            width: 9,
            height: 9,
            padding: 0,
            borderRadius: 999,
            border: "none",
            background:
              i === activeIndex ? "var(--color-paper)" : "rgba(255,255,255,0.45)",
            cursor: "pointer",
            transition: "background 200ms ease",
          }}
        />
      ))}
    </div>
  );
}
