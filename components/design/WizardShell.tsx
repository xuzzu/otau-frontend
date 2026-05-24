"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useT } from "@/lib/i18n";

const TOTAL = 4;

export function WizardShell({
  step,
  kicker,
  title,
  subtitle,
  canContinue,
  onContinue,
  children,
  rightPanel,
}: {
  step: number;
  kicker: string;
  title: string;
  subtitle: string;
  canContinue: boolean;
  onContinue: () => void;
  children: ReactNode;
  rightPanel?: ReactNode;
}) {
  const router = useRouter();
  const { t } = useT();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-paper)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top progress + nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "28px 56px 0",
        }}
      >
        <Link
          href="/"
          aria-label={t("wizard.back_home")}
          style={{
            width: 40,
            height: 40,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid var(--color-hair)",
            borderRadius: 999,
            color: "var(--color-ink)",
            textDecoration: "none",
            background: "var(--color-paper)",
          }}
        >
          ←
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="mono" style={{ fontSize: 11, letterSpacing: "0.16em" }}>
            {String(step).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: 22,
                  height: 2,
                  background:
                    i < step ? "var(--color-ink)" : "var(--color-hair)",
                  transition: "background .25s",
                }}
              />
            ))}
          </div>
        </div>

        <Link
          href="/design/studio"
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--color-taupe)",
            textDecoration: "none",
            borderBottom: "1px solid var(--color-hair)",
            paddingBottom: 2,
          }}
        >
          {t("wizard.skip")}
        </Link>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: rightPanel ? "minmax(0, 1fr) minmax(0, 1.1fr)" : "1fr",
          gap: 48,
          padding: "72px 56px 24px",
          alignItems: "start",
        }}
        className="wizard-fade-in"
      >
        <div style={{ maxWidth: 540 }}>
          <div className="label" style={{ color: "var(--color-clay)" }}>
            {kicker}
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(48px, 5.6vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              margin: "12px 0 18px",
              fontWeight: 400,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.55,
              color: "#5B5043",
              opacity: 0.85,
              maxWidth: 460,
            }}
          >
            {subtitle}
          </p>
        </div>

        <div>{children}</div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 56px 32px",
          borderTop: "1px solid var(--color-hair)",
        }}
      >
        <button
          onClick={() => router.push(`/design?step=${Math.max(1, step - 1)}`)}
          className="btn ghost small"
          style={{ visibility: step > 1 ? "visible" : "hidden" }}
        >
          {t("wizard.back")}
        </button>

        <button
          onClick={onContinue}
          disabled={!canContinue}
          className="btn clay"
          style={{
            padding: "16px 26px",
            opacity: canContinue ? 1 : 0.35,
            cursor: canContinue ? "pointer" : "not-allowed",
          }}
        >
          {step < TOTAL ? t("wizard.continue") : t("wizard.design_my_room")}
          <span className="arrow">→</span>
        </button>
      </div>
    </main>
  );
}
