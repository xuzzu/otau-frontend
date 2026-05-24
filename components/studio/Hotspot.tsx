"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export function Hotspot({
  n,
  top,
  left,
  productId,
  label,
  active,
  onHover,
}: {
  n: string;
  top: string;
  left: string;
  productId: string;
  label: string;
  active?: boolean;
  onHover?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const isHi = active || hover;

  return (
    <Link
      href={`/catalog/${productId}`}
      onMouseEnter={() => {
        setHover(true);
        onHover?.();
      }}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "absolute",
        top,
        left,
        transform: "translate(-50%,-50%)",
        textDecoration: "none",
        zIndex: 3,
      }}
    >
      <div
        style={{
          position: "relative",
          width: isHi ? 32 : 24,
          height: isHi ? 32 : 24,
          borderRadius: 999,
          border: `1.5px solid ${isHi ? "#FBF8F2" : "rgba(251,248,242,.9)"}`,
          background: isHi ? "#B5532E" : "rgba(26,22,18,.45)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FBF8F2",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          transition: "all .25s cubic-bezier(.22,1,.36,1)",
          boxShadow: isHi ? "0 0 0 6px rgba(181,83,46,.25)" : "none",
        }}
      >
        {n}
        {/* pulse */}
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
      </div>
      {isHi && (
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
          }}
        >
          {label} ↗
        </motion.div>
      )}
    </Link>
  );
}
