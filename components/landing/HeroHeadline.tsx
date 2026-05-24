"use client";

import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

type Line = { text: string; italic?: boolean }[];

export function HeroHeadline({ lines }: { lines: Line[] }) {
  return (
    <h1
      className="serif"
      style={{
        fontSize: "clamp(64px, 8.2vw, 116px)",
        lineHeight: 0.95,
        letterSpacing: "-0.02em",
        margin: 0,
        fontWeight: 400,
      }}
    >
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block", overflow: "hidden" }}>
          {line.map((chunk, ci) => {
            const words = chunk.text.split(/(\s+)/);
            return words.map((w, wi) => {
              if (!w.trim()) {
                return (
                  <span key={`${li}-${ci}-${wi}`} style={{ display: "inline" }}>
                    {w}
                  </span>
                );
              }
              const idx =
                lines.slice(0, li).reduce(
                  (n, l) =>
                    n + l.reduce((m, c) => m + c.text.split(/\s+/).length, 0),
                  0
                ) + wi / 2;
              return (
                <motion.span
                  key={`${li}-${ci}-${wi}`}
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{
                    delay: 0.14 + idx * 0.06,
                    duration: 0.85,
                    ease,
                  }}
                  style={{
                    display: "inline-block",
                    fontStyle: chunk.italic ? "italic" : "normal",
                    willChange: "transform",
                  }}
                >
                  {w}
                </motion.span>
              );
            });
          })}
        </span>
      ))}
    </h1>
  );
}
