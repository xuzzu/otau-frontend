"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/store/dashboard", label: "Overview" },
  { href: "/store/catalog", label: "Catalog" },
  { href: "/store/promotions", label: "Promotions" },
  { href: "/store/shop", label: "Shop" },
] as const;

const SOON = ["Orders", "Inbox"] as const;

export function SellerSidebar() {
  const pathname = usePathname();
  return (
    <aside
      style={{
        width: 210,
        flexShrink: 0,
        borderRight: "1px solid var(--color-hair)",
        background: "var(--color-cream)",
        padding: "22px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        overflowY: "auto",
      }}
    >
      <div style={{ padding: "0 8px 18px" }}>
        <div className="serif" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>
          Otaū
        </div>
        <div
          className="mono"
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--color-taupe)",
            marginTop: 2,
          }}
        >
          Seller
        </div>
      </div>
      {NAV.map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            style={{
              padding: "9px 10px",
              fontSize: 13,
              textDecoration: "none",
              color: "var(--color-ink)",
              background: active ? "var(--color-paper)" : "transparent",
              border: "1px solid",
              borderColor: active ? "var(--color-hair)" : "transparent",
            }}
          >
            {n.label}
          </Link>
        );
      })}
      <div className="hr-hair" style={{ margin: "14px 8px" }} />
      {SOON.map((s) => (
        <span
          key={s}
          style={{
            padding: "9px 10px",
            fontSize: 13,
            color: "var(--color-taupe-2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {s}
          <span className="mono" style={{ fontSize: 8, letterSpacing: "0.12em" }}>
            SOON
          </span>
        </span>
      ))}
    </aside>
  );
}
