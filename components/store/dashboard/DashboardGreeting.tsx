"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";

const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;
const MONTH_KEYS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"] as const;

function issueNumber(shopCreatedAt: string | undefined): number {
  if (!shopCreatedAt) return 1;
  const d = new Date(shopCreatedAt);
  const ms = Date.now() - d.getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}

export function DashboardGreeting({
  firstName, shopName, city, shopCreatedAt,
}: {
  firstName: string;
  shopName: string;
  city: string;
  shopCreatedAt?: string;
}) {
  const { t } = useT();
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 5 ? t("store.greeting.night") :
    hour < 12 ? t("store.greeting.morning") :
    hour < 18 ? t("store.greeting.afternoon") :
    t("store.greeting.evening");

  const dayKey = DAY_KEYS[now.getDay()];
  const monthKey = MONTH_KEYS[now.getMonth()];
  const subline =
    `${t(`date.day.${dayKey}`)} · ${now.getDate()} ${t(`date.month.${monthKey}_gen`)}` +
    ` · ${shopName.toUpperCase()} · ${city.toUpperCase()} · №${issueNumber(shopCreatedAt)}`;

  return (
    <div
      style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        paddingBottom: 18, borderBottom: "1px solid var(--color-hair)",
        marginBottom: 28,
      }}
    >
      <div>
        <h1 className="serif" style={{ fontSize: 34, lineHeight: 1, margin: 0 }}>
          {greeting}, <em style={{ color: "var(--color-taupe-2)" }}>{firstName}.</em>
        </h1>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-taupe)", marginTop: 8 }}>
          {subline}
        </div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={() => alert(t("store.dashboard.section.greeting.find_soon"))}
          className="mono"
          style={{
            height: 38, padding: "0 16px", borderRadius: 999,
            border: "1px solid var(--color-hair-2)", background: "transparent",
            color: "var(--color-taupe-2)", fontSize: 11, letterSpacing: "0.14em",
            textTransform: "uppercase", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          {t("store.dashboard.section.greeting.find")} <kbd style={{ fontFamily: "inherit", padding: "1px 5px", background: "var(--color-hair)", borderRadius: 3, fontSize: 10 }}>⌘K</kbd>
        </button>
        <Link href="/store/catalog/new" className="btn" style={{ height: 38, padding: "0 16px" }}>
          {t("store.dashboard.section.greeting.add_item")} <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
