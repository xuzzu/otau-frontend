"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { WizardShell } from "./WizardShell";
import { useDesign } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { type Style } from "@/lib/products";
import { T } from "@/lib/format";
import { useRouter } from "next/navigation";
import { createGeneration } from "@/lib/api/generation";
import { listApartmentPlansBySlug } from "@/lib/api/catalog";

const ZHK = [
  { id: "esentai", name: "ЖК Esentai Park", city: "Almaty", plans: 18 },
  { id: "expo", name: "ЖК Expo Boulevard", city: "Astana", plans: 24 },
  { id: "sezim", name: "ЖК Sezim Qala", city: "Almaty", plans: 11 },
  { id: "highvill", name: "ЖК Highvill Astana", city: "Astana", plans: 32 },
];

const ROOMS = [
  { id: "living", area: 24 },
  { id: "bedroom", area: 14 },
  { id: "kitchen", area: 10 },
  { id: "workspace", area: 10 },
];

const ALL_STYLES: Style[] = [
  "scandinavian",
  "modern",
  "loft",
  "classic",
  "minimal",
  "japandi",
];

// ───────── Step 1: Scope ─────────

export function Step1Scope() {
  const { t } = useT();
  const { scope, setScope } = useDesign();
  const router = useRouter();

  const options = [
    {
      key: "apartment" as const,
      title: t("step1.apt.title"),
      lede: t("step1.apt.lede"),
      hint: t("step1.apt.hint"),
    },
    {
      key: "room" as const,
      title: t("step1.room.title"),
      lede: t("step1.room.lede"),
      hint: t("step1.room.hint"),
    },
  ];

  return (
    <WizardShell
      step={1}
      kicker={t("step1.kicker")}
      title={t("step1.title")}
      subtitle={t("step1.subtitle")}
      canContinue={!!scope}
      onContinue={() => router.push("/design?step=2")}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {options.map((o) => {
          const active = scope === o.key;
          return (
            <motion.button
              key={o.key}
              onClick={() => setScope(o.key)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              style={{
                textAlign: "left",
                padding: 28,
                border: `1px solid ${active ? "var(--color-ink)" : "var(--color-hair)"}`,
                background: active ? "var(--color-ink)" : "var(--color-paper)",
                color: active ? "var(--color-paper)" : "var(--color-ink)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "background .25s, color .25s, border-color .25s",
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0.6,
                  }}
                >
                  ◇ {active ? t("step1.selected") : t("step1.option")}
                </div>
                <h3
                  className="serif"
                  style={{
                    fontSize: 38,
                    margin: "12px 0 14px",
                    fontWeight: 400,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.05,
                  }}
                >
                  {o.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.55, opacity: 0.82 }}>
                  {o.lede}
                </p>
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  opacity: 0.55,
                  marginTop: 18,
                }}
              >
                {o.hint}
              </div>
            </motion.button>
          );
        })}
      </div>
    </WizardShell>
  );
}

// ───────── Step 2: Space ─────────

export function Step2Space() {
  const { t } = useT();
  const { scope, spaceId, setSpace, area, setArea } = useDesign();
  const router = useRouter();
  const isRoom = scope === "room";

  return (
    <WizardShell
      step={2}
      kicker={isRoom ? t("step2.kicker.room") : t("step2.kicker.apt")}
      title={isRoom ? t("step2.title.room") : t("step2.title.apt")}
      subtitle={isRoom ? t("step2.subtitle.room") : t("step2.subtitle.apt")}
      canContinue={!!spaceId}
      onContinue={() => router.push("/design?step=3")}
    >
      {isRoom ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {ROOMS.map((r) => {
              const active = spaceId === r.id;
              return (
                <motion.button
                  key={r.id}
                  onClick={() => {
                    setSpace(r.id);
                    if (!area) setArea(r.area);
                  }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    padding: 20,
                    border: `1px solid ${active ? "var(--color-ink)" : "var(--color-hair)"}`,
                    background: active ? "var(--color-ink)" : "var(--color-paper)",
                    color: active ? "var(--color-paper)" : "var(--color-ink)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textAlign: "left",
                    transition: "background .2s, color .2s, border-color .2s",
                  }}
                >
                  <div className="serif" style={{ fontSize: 24 }}>
                    {t(`room.${r.id}`)}
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      marginTop: 6,
                      opacity: 0.7,
                    }}
                  >
                    {t("step2.avg", { n: r.area })}
                  </div>
                </motion.button>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: 18,
              border: "1px solid var(--color-hair)",
              background: "var(--color-cream)",
            }}
          >
            <span className="label" style={{ flex: 1 }}>
              {t("step2.area")}
            </span>
            <input
              type="number"
              value={area ?? ""}
              onChange={(e) => setArea(Number(e.target.value))}
              min={4}
              max={80}
              style={{
                width: 80,
                border: 0,
                background: "transparent",
                fontFamily: "var(--font-serif)",
                fontSize: 28,
                textAlign: "right",
                color: "var(--color-ink)",
                outline: "none",
              }}
            />
            <span className="mono" style={{ fontSize: 12 }}>м²</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ZHK.map((z) => {
            const active = spaceId === z.id;
            return (
              <motion.button
                key={z.id}
                onClick={() => setSpace(z.id)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.99 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 18px",
                  border: `1px solid ${active ? "var(--color-ink)" : "var(--color-hair)"}`,
                  background: active ? "var(--color-ink)" : "var(--color-paper)",
                  color: active ? "var(--color-paper)" : "var(--color-ink)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                  transition: "background .25s, color .25s",
                }}
              >
                <div>
                  <div style={{ fontSize: 17 }}>{z.name}</div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      marginTop: 4,
                      opacity: 0.65,
                    }}
                  >
                    {t("step2.plans", { city: t(`city.${z.city}`), n: z.plans })}
                  </div>
                </div>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 22 }}>→</span>
              </motion.button>
            );
          })}
          <button
            onClick={() => setSpace("upload")}
            style={{
              marginTop: 6,
              padding: "16px 18px",
              border: "1px dashed var(--color-clay)",
              background:
                spaceId === "upload" ? "var(--color-cream)" : "transparent",
              color: "var(--color-clay)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {t("step2.upload")}
          </button>
        </div>
      )}
    </WizardShell>
  );
}

// ───────── Step 3: Style ─────────

export function Step3Style() {
  const { t } = useT();
  const { styles, toggleStyle } = useDesign();
  const router = useRouter();

  return (
    <WizardShell
      step={3}
      kicker={t("step3.kicker")}
      title={t("step3.title")}
      subtitle={t("step3.subtitle")}
      canContinue={styles.length > 0}
      onContinue={() => router.push("/design?step=4")}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {ALL_STYLES.map((k) => {
          const active = styles.includes(k);
          return (
            <motion.button
              key={k}
              onClick={() => toggleStyle(k)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: "22px 20px",
                border: `1px solid ${active ? "var(--color-ink)" : "var(--color-hair)"}`,
                background: active ? "var(--color-ink)" : "var(--color-paper)",
                color: active ? "var(--color-paper)" : "var(--color-ink)",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
                transition: "background .25s, color .25s",
              }}
            >
              <div
                className="serif"
                style={{
                  fontSize: 26,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                }}
              >
                {t(`style.${k}`)}
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  marginTop: 8,
                  opacity: 0.6,
                }}
              >
                {t(`style.${k}.hint`)}
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="label" style={{ marginTop: 12 }}>
        {t("step3.counter", { n: styles.length })}
      </div>
    </WizardShell>
  );
}

// ───────── Step 4: Budget ─────────

export function Step4Budget() {
  const { t } = useT();
  const {
    budget,
    setBudget,
    scope,
    spaceId,
    styles,
    setGenerationId,
  } = useDesign();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const min = 500_000;
  const max = 10_000_000;
  const pct = ((budget - min) / (max - min)) * 100;

  const handleGenerate = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let apartmentPlanId: string | null = null;
      if (scope === "apartment" && spaceId && spaceId !== "upload") {
        try {
          const plans = await listApartmentPlansBySlug(spaceId);
          apartmentPlanId = plans[0]?.id ?? null;
        } catch {
          apartmentPlanId = null;
        }
      }
      const roomType =
        scope === "room" && spaceId
          ? spaceId.charAt(0).toUpperCase() + spaceId.slice(1)
          : null;
      const gen = await createGeneration({
        scope: scope ?? "room",
        apartment_plan_id: apartmentPlanId,
        room_type: roomType,
        style_slugs: styles,
        budget,
      });
      setGenerationId(gen.id);
      router.push("/design/reveal");
    } catch (e) {
      console.error("createGeneration failed", e);
      // Fall through to the reveal screen anyway so the user isn't stuck;
      // the reveal/studio components handle the missing-generation case.
      setGenerationId(null);
      router.push("/design/reveal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <WizardShell
      step={4}
      kicker={t("step4.kicker")}
      title={t("step4.title")}
      subtitle={t("step4.subtitle")}
      canContinue={budget >= min && !busy}
      onContinue={handleGenerate}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            padding: "26px 28px",
            background: "var(--color-cream)",
            border: "1px solid var(--color-hair)",
          }}
        >
          <div className="label">{t("step4.target")}</div>
          <div
            className="serif num"
            style={{ fontSize: 64, lineHeight: 1, marginTop: 4 }}
          >
            {T(budget)}
          </div>
          <div className="label" style={{ marginTop: 8 }}>
            {t("step4.approx", { n: Math.round(budget / 250_000) })}
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <span className="mono num" style={{ fontSize: 12 }}>
              {T(min)}
            </span>
            <span className="mono num" style={{ fontSize: 12 }}>
              {T(max)}+
            </span>
          </div>
          <div style={{ position: "relative", height: 28 }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 13,
                height: 2,
                background: "var(--color-hair)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 13,
                height: 2,
                background: "var(--color-ink)",
                width: `${pct}%`,
                transition: "width .15s",
              }}
            />
            <input
              type="range"
              min={min}
              max={max}
              step={100_000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                appearance: "none",
                background: "transparent",
                cursor: "pointer",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 18,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {[1_000_000, 2_000_000, 3_000_000, 5_000_000, 8_000_000].map((n) => (
              <button
                key={n}
                onClick={() => setBudget(n)}
                className={budget === n ? "chip solid" : "chip"}
                style={{ cursor: "pointer" }}
              >
                {T(n)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </WizardShell>
  );
}
