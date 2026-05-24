"use client";

import Link from "next/link";
import { useT, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { UserMenu } from "./UserMenu";

export function TopNav({ inverse = false }: { inverse?: boolean }) {
  const { t, lang, setLang } = useT();
  const fg = inverse ? "#FBF8F2" : "#1A1612";
  const sub = inverse ? "rgba(251,248,242,.7)" : "#9A8A72";
  const line = inverse ? "rgba(251,248,242,.18)" : "#E8DFD0";

  const items: { href: string; key: string }[] = [
    { href: "/design", key: "nav.design" },
    { href: "/catalog", key: "nav.catalog" },
    { href: "/showrooms", key: "nav.showrooms" },
    { href: "/journal", key: "nav.journal" },
  ];

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 56px",
        borderBottom: `1px solid ${line}`,
        color: fg,
        position: "relative",
        zIndex: 5,
      }}
    >
      <Link
        href="/"
        style={{ display: "flex", alignItems: "baseline", gap: 14, textDecoration: "none", color: fg }}
      >
        <span className="serif" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>
          Otaū
        </span>
        <span
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: sub,
          }}
        >
          {t("nav.brand_sub")}
        </span>
      </Link>

      <nav style={{ display: "flex", gap: 36, alignItems: "center", fontSize: 14 }}>
        {items.map((x) => (
          <Link
            key={x.key}
            href={x.href}
            style={{ color: fg, textDecoration: "none", letterSpacing: "0.01em" }}
          >
            {t(x.key)}
          </Link>
        ))}
      </nav>

      <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 13 }}>
        <span
          className="mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: sub,
            textTransform: "uppercase",
          }}
        >
          {t("nav.location")}
        </span>
        <span style={{ color: sub }}>·</span>
        <button
          onClick={() => setLang(lang === "kz" ? "ru" : "kz")}
          style={{
            color: fg,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          <span style={{ opacity: lang === "kz" ? 1 : 0.4 }}>KZ</span>
          <span style={{ opacity: 0.5, margin: "0 4px" }}>/</span>
          <span style={{ opacity: lang === "ru" ? 1 : 0.4 }}>RU</span>
        </button>
        <span style={{ color: sub }}>·</span>
        <UserMenu inverse={inverse} />
      </div>
    </header>
  );
}

// Re-export type for convenience
export type { Lang };
// satisfy unused-import in some configurations
void cn;
