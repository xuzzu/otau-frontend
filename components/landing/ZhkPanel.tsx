"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useT } from "@/lib/i18n";

const ease = [0.22, 1, 0.36, 1] as const;

type Zhk = { id: string; name: string; city: "Almaty" | "Astana"; plans: number };

const POOL: Zhk[] = [
  { id: "esentai", name: "ЖК Esentai Park", city: "Almaty", plans: 18 },
  { id: "expo", name: "ЖК Expo Boulevard", city: "Astana", plans: 24 },
  { id: "sezim", name: "ЖК Sezim Qala", city: "Almaty", plans: 11 },
  { id: "highvill", name: "ЖК Highvill Astana", city: "Astana", plans: 32 },
  { id: "bayan", name: "ЖК Bayan Sulu", city: "Astana", plans: 12 },
  { id: "tau", name: "ЖК Tau Residence", city: "Almaty", plans: 9 },
  { id: "aviator", name: "ЖК Aviator", city: "Almaty", plans: 14 },
  { id: "green", name: "ЖК Green Block", city: "Astana", plans: 7 },
  { id: "shanyrak", name: "ЖК Shaňyraq", city: "Astana", plans: 16 },
  { id: "altyn", name: "ЖК Altyn Sai", city: "Almaty", plans: 5 },
];

const WINDOW_SIZE = 4;
const TICK_MS = 3400;

export function ZhkPanel() {
  const { t } = useT();
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setOffset((o) => (o + 1) % POOL.length),
      TICK_MS
    );
    return () => clearInterval(id);
  }, [paused]);

  const visible = Array.from(
    { length: WINDOW_SIZE },
    (_, i) => POOL[(offset + i) % POOL.length]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "absolute",
        right: 56,
        top: 180,
        width: 340,
        background:
          "linear-gradient(155deg, rgba(26,22,18,0.46) 0%, rgba(26,22,18,0.32) 100%)",
        backdropFilter: "blur(24px) saturate(1.5)",
        WebkitBackdropFilter: "blur(24px) saturate(1.5)",
        border: "1px solid rgba(251,248,242,0.18)",
        boxShadow:
          "0 32px 70px -22px rgba(0,0,0,0.55), inset 0 1px 0 rgba(251,248,242,0.26), inset 0 -1px 0 rgba(0,0,0,0.18)",
        padding: 22,
        color: "#FBF8F2",
        zIndex: 2,
      }}
    >
      <div
        className="label"
        style={{ color: "rgba(251,248,242,0.7)" }}
      >
        {t("hero.quick.label")}
      </div>
      <div
        className="serif it"
        style={{
          fontSize: 28,
          marginTop: 8,
          lineHeight: 1.08,
          color: "#FBF8F2",
          fontWeight: 400,
        }}
      >
        {t("hero.quick.title")}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgba(251,248,242,0.7)",
          marginTop: 8,
          lineHeight: 1.5,
        }}
      >
        {t("hero.quick.lede")}
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(251,248,242,0.12)",
          margin: "18px 0 14px",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minHeight: WINDOW_SIZE * 52,
          position: "relative",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.55, ease }}
            >
              <Link
                href={`/design?step=2&zhk=${c.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 12px",
                  border: "1px solid rgba(251,248,242,0.14)",
                  background: "rgba(251,248,242,0.05)",
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "background .2s, border-color .2s",
                }}
                className="zhk-card"
              >
                <div>
                  <div style={{ fontSize: 13.5, letterSpacing: "-0.005em" }}>
                    {c.name}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "rgba(251,248,242,0.55)",
                      marginTop: 2,
                    }}
                  >
                    {t(`city.${c.city}`)} · {t("hero.plans", { n: c.plans })}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 17,
                    color: "rgba(251,248,242,0.7)",
                  }}
                >
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          className="label"
          style={{ color: "rgba(251,248,242,0.55)" }}
        >
          {t("hero.quick.or")}
        </span>
        <Link
          href="/design?step=2"
          style={{
            fontSize: 12.5,
            color: "var(--white)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {t("hero.quick.upload")}
        </Link>
      </div>
    </motion.div>
  );
}
