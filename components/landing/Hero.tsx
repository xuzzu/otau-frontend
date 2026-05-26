"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TopNav } from "@/components/nav/TopNav";
import { Photo } from "@/components/ui/Photo";
import { HeroHeadline } from "./HeroHeadline";
import { CountUp } from "./CountUp";
import { ZhkPanel } from "./ZhkPanel";
import { useT } from "@/lib/i18n";

const HERO_SRC =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=2200&q=80";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { t, lang } = useT();

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#1A1612",
        overflow: "hidden",
      }}
    >
      {/* Full-bleed photo */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Photo
          src={HERO_SRC}
          label={t("hero.photo_alt")}
          style={{ position: "absolute", inset: 0 }}
        />
      </motion.div>

      {/* Warm gradient veil */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(26,22,18,.55) 0%, rgba(26,22,18,.20) 30%, rgba(26,22,18,.10) 55%, rgba(26,22,18,.85) 100%)",
        }}
      />

      {/* Subtle grain */}
      <div className="grain" style={{ position: "absolute", inset: 0 }} />

      {/* Top nav (inverse) */}
      <TopNav inverse />

      {/* Floating side label */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ delay: 0.7, duration: 1.2, ease }}
        className="mono"
        style={{
          position: "absolute",
          left: 28,
          top: 180,
          color: "#FBF8F2",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
          pointerEvents: "none",
        }}
      >
        {t("hero.sidebar")}
      </motion.div>

      {/* Editorial copy */}
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 180,
          color: "#FBF8F2",
          maxWidth: 920,
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.85, y: 0 }}
          transition={{ delay: 0.1, duration: 0.7, ease }}
          className="label"
          style={{ color: "rgba(251,248,242,.75)", marginBottom: 24 }}
        >
          {t("hero.kicker")}
        </motion.div>

        <HeroHeadline
          key={lang}
          lines={[
            [{ text: t("hero.h1.1") }],
            [{ text: t("hero.h1.2"), italic: true }],
          ]}
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.82, y: 0 }}
          transition={{ delay: 1.2, duration: 0.9, ease }}
          style={{
            marginTop: 36,
            maxWidth: 540,
            fontSize: 17,
            lineHeight: 1.55,
            color: "rgba(251,248,242,.82)",
          }}
        >
          {t("hero.lede")}
        </motion.p>
      </div>

      {/* Dual CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.7, ease }}
        style={{
          position: "absolute",
          left: 56,
          bottom: 100,
          display: "flex",
          gap: 16,
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <Link href="/design" className="btn clay" style={{ padding: "18px 28px", fontSize: 15, textDecoration: "none" }}>
          {t("hero.cta.design")}
          <span className="arrow">→</span>
        </Link>
        <Link
          href="/catalog"
          className="btn ghost"
          style={{
            padding: "18px 28px",
            fontSize: 15,
            borderColor: "rgba(251,248,242,.4)",
            color: "#FBF8F2",
            textDecoration: "none",
          }}
        >
          {t("hero.cta.browse")}
        </Link>
      </motion.div>

      {/* Right column — Quick start panel */}
      <ZhkPanel />

      {/* Bottom right — trust indicators */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8, ease }}
        style={{
          position: "absolute",
          right: 56,
          bottom: 64,
          display: "flex",
          gap: 40,
          alignItems: "flex-end",
          color: "#FBF8F2",
          zIndex: 2,
        }}
      >
        <Stat n={9412} l={t("stat.pieces_in_stock")} />
        <Stat n={84} l={t("stat.verified_sellers")} />
        <Stat n={47} l={t("stat.zhk_premapped")} />
      </motion.div>

    </section>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <div className="serif num" style={{ fontSize: 36, lineHeight: 1 }}>
        <CountUp to={n} />
      </div>
      <div
        className="mono"
        style={{
          marginTop: 6,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(251,248,242,.6)",
        }}
      >
        {l}
      </div>
    </div>
  );
}
