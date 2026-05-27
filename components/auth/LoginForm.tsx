"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n";
import { useLogin, useRegister } from "@/lib/hooks";
import { ApiError } from "@/lib/api/http";

type Mode = "signin" | "register";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const { t } = useT();
  const [mode, setMode] = useState<Mode>("signin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;

  const submit = async () => {
    setError(null);
    try {
      if (mode === "signin") {
        await login.mutateAsync({ identifier, password });
      } else {
        await register.mutateAsync({ identifier, password });
      }
      onSuccess();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409) setError(t("login.error.conflict"));
        else if (e.status === 422) setError(t("login.error.validation"));
        else if (e.status === 400) setError(t("login.error.invalid"));
        else setError(t("login.error.generic"));
      } else {
        setError(t("login.error.generic"));
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 18,
        maxWidth: 420,
        width: "100%",
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
        {t(mode === "signin" ? "login.title.signin" : "login.title.register")}
      </h1>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-hair)" }}>
        {(["signin", "register"] as const).map((m) => {
          const active = mode === m;
          return (
            <button
              type="button"
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
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
              {t(m === "signin" ? "login.tab.signin" : "login.tab.register")}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        inputMode={identifier.includes("@") ? "email" : "tel"}
        autoComplete={identifier.includes("@") ? "email" : "tel"}
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder={t("login.identifier.placeholder")}
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

      <input
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("login.password.placeholder")}
        required
        minLength={mode === "register" ? 8 : 1}
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
        disabled={pending || !identifier || !password}
        className="btn"
        style={{ justifyContent: "center", padding: 16 }}
      >
        {pending ? "…" : t(mode === "signin" ? "login.submit.signin" : "login.submit.register")}
        <span className="arrow">→</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "register" : "signin");
          setError(null);
        }}
        style={{
          background: "transparent",
          border: 0,
          color: "var(--color-taupe)",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          textDecoration: "underline",
          marginTop: -4,
        }}
      >
        {t(mode === "signin" ? "login.switch.toregister" : "login.switch.tosignin")}
      </button>

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
