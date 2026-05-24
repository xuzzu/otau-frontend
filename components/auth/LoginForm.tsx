"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { useSessionsUpgrade, useSessionsVerify } from "@/lib/hooks";
import { ApiError } from "@/lib/api/http";
import type { CredentialKind } from "@/lib/api/types";

type Step =
  | { name: "identifier" }
  | { name: "code"; sent_to: string; dev_code: string | null };

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useT();
  const [kind, setKind] = useState<CredentialKind>("email_otp");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>({ name: "identifier" });
  const [error, setError] = useState<string | null>(null);

  const upgrade = useSessionsUpgrade();
  const verify = useSessionsVerify();

  const handleSendCode = async () => {
    setError(null);
    try {
      const res = await upgrade.mutateAsync({ kind, identifier });
      setStep({ name: "code", sent_to: res.sent_to, dev_code: res.dev_code });
      if (res.dev_code) setCode(res.dev_code);
    } catch (e) {
      setError(
        e instanceof ApiError
          ? `${e.status}: ${e.body.slice(0, 200)}`
          : t("login.error.generic"),
      );
    }
  };

  const handleVerify = async () => {
    setError(null);
    try {
      await verify.mutateAsync({ kind, identifier, code });
      onSuccess();
    } catch (e) {
      setError(
        e instanceof ApiError && e.status === 400
          ? t("login.error.invalid")
          : t("login.error.generic"),
      );
    }
  };

  const isCodeStep = step.name === "code";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isCodeStep) handleVerify();
        else handleSendCode();
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 420,
      }}
    >
      <h1
        className="serif"
        style={{
          fontSize: 36,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          fontWeight: 400,
          margin: 0,
        }}
      >
        {t("login.title")}
      </h1>

      {!isCodeStep && (
        <>
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-hair)" }}>
            {(["email_otp", "sms_otp"] as const).map((k) => {
              const active = kind === k;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => setKind(k)}
                  style={{
                    background: "transparent",
                    border: 0,
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontSize: 14,
                    color: active ? "var(--color-ink)" : "var(--color-taupe)",
                    borderBottom: active
                      ? "2px solid var(--color-ink)"
                      : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {t(k === "email_otp" ? "login.tab.email" : "login.tab.phone")}
                </button>
              );
            })}
          </div>

          <input
            type={kind === "email_otp" ? "email" : "tel"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={t(
              kind === "email_otp"
                ? "login.email.placeholder"
                : "login.phone.placeholder",
            )}
            required
            autoFocus
            style={{
              padding: "14px 16px",
              border: "1px solid var(--color-hair)",
              background: "var(--color-paper)",
              fontFamily: "inherit",
              fontSize: 15,
              color: "var(--color-ink)",
              outline: "none",
            }}
          />

          <button
            type="submit"
            disabled={upgrade.isPending || !identifier}
            className="btn"
            style={{ justifyContent: "center", padding: 16 }}
          >
            {upgrade.isPending ? "…" : t("login.send_code")}
            <span className="arrow">→</span>
          </button>
        </>
      )}

      {isCodeStep && (
        <>
          <div className="label">
            {t("login.code.title", { to: step.sent_to })}
          </div>
          {step.dev_code && (
            <div
              className="mono"
              style={{
                fontSize: 12,
                color: "var(--color-clay)",
                letterSpacing: "0.1em",
              }}
            >
              {t("login.dev_code", { code: step.dev_code })}
            </div>
          )}
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder={t("login.code.placeholder")}
            inputMode="numeric"
            pattern="\d{6}"
            required
            autoFocus
            style={{
              padding: "14px 16px",
              border: "1px solid var(--color-hair)",
              background: "var(--color-paper)",
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              letterSpacing: "0.4em",
              color: "var(--color-ink)",
              outline: "none",
              textAlign: "center",
            }}
          />
          <button
            type="submit"
            disabled={verify.isPending || code.length !== 6}
            className="btn"
            style={{ justifyContent: "center", padding: 16 }}
          >
            {verify.isPending ? "…" : t("login.verify")}
            <span className="arrow">→</span>
          </button>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={upgrade.isPending}
            style={{
              background: "transparent",
              border: 0,
              color: "var(--color-taupe)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              textDecoration: "underline",
            }}
          >
            {t("login.resend")}
          </button>
        </>
      )}

      {error && (
        <div
          className="mono"
          style={{
            padding: "10px 14px",
            border: "1px solid #c9694a",
            background: "rgba(201, 105, 74, 0.08)",
            color: "#c9694a",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}
    </form>
  );
}
