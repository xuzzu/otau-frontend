"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDesign } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { T } from "@/lib/format";
import { useGeneration } from "@/lib/hooks";
import type { Generation } from "@/lib/api/types";

type Stage = 0 | 1 | 2 | 3 | 4;

const RENDER_DELAY_MS = 500;

// 5 stages map to: read plan / collect items / arrange / render / finalize.
function maxStage(g: Generation | null | undefined): Stage {
  if (!g) return 0;
  if (g.status === "done") return 4;
  let s: Stage = 0;
  for (const r of g.rooms) {
    if (r.status === "done") s = Math.max(s, 4) as Stage;
    else if (r.status === "rendering") s = Math.max(s, 3) as Stage;
    else if (r.status === "retrieving") s = Math.max(s, 2) as Stage;
    else if (r.status === "concepting") s = Math.max(s, 1) as Stage;
  }
  return s;
}

function selectedCount(g: Generation | null | undefined): number {
  if (!g) return 0;
  return g.rooms.reduce((sum, r) => sum + (r.selected_item_ids?.length ?? 0), 0);
}

function sellerCount(g: Generation | null | undefined): number {
  if (!g) return 0;
  return Math.min(5, Math.max(1, g.rooms.length));
}

export function RevealLoader() {
  const router = useRouter();
  const { t } = useT();
  const { styles, budget, spaceId, generationId } = useDesign();
  const genQ = useGeneration(generationId);
  const gen = genQ.data ?? null;
  const [stage, setStage] = useState<Stage>(0);
  const [error, setError] = useState<string | null>(null);
  const transitioned = useRef(false);

  useEffect(() => {
    // Fallback path: no generationId in store. Animate 5 stages over ~2.8s
    // and then navigate to /design/studio so users aren't stuck.
    if (!generationId) {
      const total = 2800;
      const stageStep = total / 5;
      let s = 0;
      const stageT = setInterval(() => {
        s++;
        if (s < 5) setStage(s as Stage);
      }, stageStep);
      const doneT = setTimeout(() => router.push("/design/studio"), total + 300);
      return () => {
        clearInterval(stageT);
        clearTimeout(doneT);
      };
    }
  }, [generationId, router]);

  // React to generation status changes from the polling hook
  useEffect(() => {
    if (!gen) return;
    setStage(maxStage(gen));
    if (gen.status === "done" && !transitioned.current) {
      transitioned.current = true;
      setTimeout(() => router.push("/design/studio"), RENDER_DELAY_MS);
    } else if (gen.status === "failed") {
      const firstErr =
        gen.rooms.find((r) => r.error)?.error ??
        gen.error_summary ??
        "Generation failed";
      setError(firstErr);
    }
  }, [gen, router]);

  const titleText = styles[0]
    ? styles[1]
      ? t("reveal.title.two", {
          style: t(`style.${styles[0]}`),
          style2: t(`style.${styles[1]}`),
        })
      : t("reveal.title.one", { style: t(`style.${styles[0]}`) })
    : t("reveal.fallback");

  const spaceText =
    spaceId === "upload"
      ? t("reveal.space.upload")
      : spaceId
      ? spaceId.toUpperCase()
      : t("reveal.space.auto");

  const pieces = selectedCount(gen);
  const sellers = sellerCount(gen);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-ink)",
        color: "var(--color-paper)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 56,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 720 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="serif"
          style={{
            fontSize: 96,
            color: "var(--color-clay)",
            marginBottom: 36,
            lineHeight: 1,
          }}
        >
          ◇
        </motion.div>

        <div className="label" style={{ color: "rgba(251,248,242,.6)" }}>
          {t("reveal.designing")}
        </div>
        <h1
          className="serif"
          style={{
            fontSize: 56,
            lineHeight: 1.05,
            margin: "12px 0 28px",
            fontWeight: 400,
            letterSpacing: "-0.02em",
          }}
        >
          {titleText}
        </h1>

        <motion.div
          key={stage}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mono"
          style={{
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "rgba(251,248,242,.7)",
          }}
        >
          {t(`reveal.stage.${stage}`)}
        </motion.div>

        <div
          style={{
            marginTop: 40,
            display: "flex",
            justifyContent: "center",
            gap: 36,
          }}
        >
          <Stat n={pieces} l={t("reveal.stat.pieces")} />
          <Stat n={sellers} l={t("reveal.stat.sellers")} />
          <StatRaw v={T(budget)} l={t("reveal.stat.budget")} />
          <StatRaw v={spaceText} l={t("reveal.stat.space")} />
        </div>

        {error && (
          <div
            className="mono"
            style={{
              marginTop: 28,
              padding: "12px 18px",
              border: "1px solid rgba(201,105,74,.5)",
              color: "rgba(255,210,200,.95)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "inline-block",
            }}
          >
            {error.slice(0, 200)}
            <button
              onClick={() => router.push("/design")}
              style={{
                marginLeft: 14,
                background: "transparent",
                border: "1px solid rgba(251,248,242,.4)",
                color: "var(--color-paper)",
                padding: "4px 12px",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <div>
      <div className="serif num" style={{ fontSize: 32, lineHeight: 1 }}>
        {n}
      </div>
      <div
        className="mono"
        style={{
          marginTop: 6,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(251,248,242,.5)",
        }}
      >
        {l}
      </div>
    </div>
  );
}

function StatRaw({ v, l }: { v: string; l: string }) {
  return (
    <div>
      <div className="serif num" style={{ fontSize: 22, lineHeight: 1.1 }}>
        {v}
      </div>
      <div
        className="mono"
        style={{
          marginTop: 6,
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(251,248,242,.5)",
        }}
      >
        {l}
      </div>
    </div>
  );
}
