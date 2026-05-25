"use client";

import { motion } from "framer-motion";

export function Hotspot({
  n,
  x,
  y,
  label,
  active,
  onActivate,
  onHoverEnter,
  onHoverLeave,
}: {
  n: number;
  x: number;
  y: number;
  label: string;
  active: boolean;
  onActivate: () => void;
  onHoverEnter?: () => void;
  onHoverLeave?: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: "translate(-50%,-50%)",
        zIndex: 3,
      }}
    >
      <button
        type="button"
        aria-label={label}
        onClick={onActivate}
        onMouseEnter={onHoverEnter}
        onMouseLeave={onHoverLeave}
        style={{
          position: "relative",
          width: active ? 32 : 24,
          height: active ? 32 : 24,
          borderRadius: 999,
          border: `1.5px solid ${active ? "#FBF8F2" : "rgba(251,248,242,.9)"}`,
          background: active ? "#B5532E" : "rgba(26,22,18,.45)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FBF8F2",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          cursor: "pointer",
          padding: 0,
          transition: "all .25s cubic-bezier(.22,1,.36,1)",
          boxShadow: active ? "0 0 0 6px rgba(181,83,46,.25)" : "none",
        }}
      >
        {n}
        <motion.span
          animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.55)",
            pointerEvents: "none",
          }}
        />
      </button>
      {active && (
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mono"
          style={{
            position: "absolute",
            left: 44,
            top: 4,
            whiteSpace: "nowrap",
            padding: "6px 10px",
            background: "#FBF8F2",
            color: "#1A1612",
            fontSize: 10,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            boxShadow: "0 8px 20px -8px rgba(0,0,0,.4)",
            pointerEvents: "none",
          }}
        >
          {label}
        </motion.div>
      )}
    </div>
  );
}
