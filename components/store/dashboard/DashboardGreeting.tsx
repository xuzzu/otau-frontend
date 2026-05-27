"use client";
import Link from "next/link";

function greetingFor(hour: number): string {
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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
  const now = new Date();
  const greeting = greetingFor(now.getHours());
  const ruMonths = ["января","февраля","марта","апреля","мая","июня",
                    "июля","августа","сентября","октября","ноября","декабря"];
  const ruDays = ["ВС","ПН","ВТ","СР","ЧТ","ПТ","СБ"];
  const subline =
    `${ruDays[now.getDay()]} · ${now.getDate()} ${ruMonths[now.getMonth()]}` +
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
          onClick={() => alert("Find anything — coming soon")}
          className="mono"
          style={{
            height: 38, padding: "0 16px", borderRadius: 999,
            border: "1px solid var(--color-hair-2)", background: "transparent",
            color: "var(--color-taupe-2)", fontSize: 11, letterSpacing: "0.14em",
            textTransform: "uppercase", cursor: "pointer",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}
        >
          ⌕ Find anything <kbd style={{ fontFamily: "inherit", padding: "1px 5px", background: "var(--color-hair)", borderRadius: 3, fontSize: 10 }}>⌘K</kbd>
        </button>
        <Link href="/store/catalog/new" className="btn" style={{ height: 38, padding: "0 16px" }}>
          + Add item <span className="arrow">→</span>
        </Link>
      </div>
    </div>
  );
}
