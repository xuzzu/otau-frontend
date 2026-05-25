"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { resolveGenerationAsset } from "@/lib/api/env";
import type { GenerationRoom } from "@/lib/api/types";
import type { HotspotRow } from "@/lib/studio/joinHotspots";
import { Hotspot } from "./Hotspot";

function stageLabel(status: string): string {
  switch (status) {
    case "queued":
      return "Queued";
    case "concepting":
      return "Composing the concept…";
    case "retrieving":
      return "Selecting pieces from the catalog…";
    case "rendering":
      return "Rendering the scene…";
    case "hotspotting":
      return "Mapping interactive points…";
    case "failed":
      return "Generation failed";
    default:
      return "Working…";
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
}: {
  genRoom: GenerationRoom | null;
  rows: HotspotRow[];
  activeId: string | null;
  onActivate: (itemId: string) => void;
  onHoverEnter: (itemId: string) => void;
  onHoverLeave: (itemId: string) => void;
}) {
  const status = genRoom?.status ?? null;
  const imageUrl = resolveGenerationAsset(genRoom?.image_url);

  const aspectRatio: string =
    genRoom?.image_width && genRoom?.image_height
      ? `${genRoom.image_width} / ${genRoom.image_height}`
      : "3 / 2";

  const sceneBox: CSSProperties = { ...SCENE_BOX_BASE, aspectRatio };

  if (imageUrl) {
    return (
      <div style={sceneBox} data-testid="scene-box">
        <img
          src={imageUrl}
          alt="Generated scene"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
        {rows.map((r) =>
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
      </div>
    );
  }

  if (!genRoom) {
    return (
      <div style={sceneBox} data-testid="scene-box">
        <div className="label">No scene yet.</div>
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
            Generation failed
          </div>
          <div className="mono" style={{ marginTop: 8, fontSize: 11 }}>
            {(genRoom.error ?? "Unknown error").slice(0, 200)}
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
        {stageLabel(status ?? "queued")}
      </div>
    </div>
  );
}
