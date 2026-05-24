"use client";

import { useT } from "@/lib/i18n";

export function FloorPlan({
  width = 240,
  height = 180,
  highlight = "living",
}: {
  width?: number;
  height?: number;
  highlight?: "living" | "kitchen" | "bedroom" | "bath" | "hall";
}) {
  const { t } = useT();
  const wallC = "#1A1612";
  const fill = (room: string) =>
    highlight === room ? "#B5532E" : "transparent";
  const fillOp = (room: string) => (highlight === room ? 0.08 : 0);

  return (
    <svg
      viewBox="0 0 380 280"
      width={width}
      height={height}
      style={{ display: "block" }}
    >
      <rect x="20" y="20" width="340" height="240" fill="none" stroke={wallC} strokeWidth="2" />
      <rect x="20" y="20" width="200" height="160" fill={fill("living")} fillOpacity={fillOp("living")} />
      <rect x="220" y="20" width="140" height="100" fill={fill("kitchen")} fillOpacity={fillOp("kitchen")} />
      <rect x="220" y="120" width="140" height="140" fill={fill("bedroom")} fillOpacity={fillOp("bedroom")} />
      <rect x="20" y="180" width="90" height="80" fill={fill("bath")} fillOpacity={fillOp("bath")} />
      <rect x="110" y="180" width="110" height="80" fill={fill("hall")} fillOpacity={fillOp("hall")} />
      <line x1="220" y1="20" x2="220" y2="260" stroke={wallC} strokeWidth="1.5" />
      <line x1="220" y1="120" x2="360" y2="120" stroke={wallC} strokeWidth="1.5" />
      <line x1="20" y1="180" x2="220" y2="180" stroke={wallC} strokeWidth="1.5" />
      <line x1="110" y1="180" x2="110" y2="260" stroke={wallC} strokeWidth="1.5" />
      <path d="M 130 180 A 20 20 0 0 0 110 200" fill="none" stroke={wallC} strokeWidth="1" />
      <path d="M 240 180 A 22 22 0 0 0 220 158" fill="none" stroke={wallC} strokeWidth="1" />
      <path d="M 75 20 A 25 25 0 0 1 100 45" fill="none" stroke={wallC} strokeWidth="1" />
      <rect x="40" y="40" width="120" height="34" fill="none" stroke={wallC} strokeWidth="0.8" />
      <rect x="44" y="44" width="34" height="26" fill="none" stroke={wallC} strokeWidth="0.5" />
      <rect x="82" y="44" width="34" height="26" fill="none" stroke={wallC} strokeWidth="0.5" />
      <rect x="120" y="44" width="36" height="26" fill="none" stroke={wallC} strokeWidth="0.5" />
      <rect x="70" y="92" width="60" height="36" fill="none" stroke={wallC} strokeWidth="0.6" />
      <rect x="170" y="100" width="30" height="30" fill="none" stroke={wallC} strokeWidth="0.6" />
      <rect x="240" y="140" width="100" height="60" fill="none" stroke={wallC} strokeWidth="0.8" />
      <rect x="246" y="146" width="22" height="22" fill="none" stroke={wallC} strokeWidth="0.4" />
      <rect x="272" y="146" width="22" height="22" fill="none" stroke={wallC} strokeWidth="0.4" />
      <rect x="232" y="32" width="118" height="22" fill="none" stroke={wallC} strokeWidth="0.6" />
      <text x="120" y="110" textAnchor="middle" fontSize="9" fill="#9A8A72" fontFamily="JetBrains Mono">
        {t("fp.living_label")}
      </text>
      <text x="290" y="200" textAnchor="middle" fontSize="9" fill="#9A8A72" fontFamily="JetBrains Mono">
        {t("fp.bedroom_label")}
      </text>
      <text x="290" y="80" textAnchor="middle" fontSize="9" fill="#9A8A72" fontFamily="JetBrains Mono">
        {t("fp.kitchen_label")}
      </text>
    </svg>
  );
}
