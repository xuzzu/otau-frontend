"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

export function StoreSideNav() {
  const path = usePathname();
  const { t } = useT();
  const items = [
    { href: "/store/dashboard", key: "store.dashboard" },
    { href: "/store/catalog", key: "store.catalog" },
    { href: "/store/promotions", key: "store.promotions" },
    { href: "/store/shop", key: "store.shop" },
  ];
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4, padding: "24px 24px 24px 56px", minWidth: 180, borderRight: "1px solid var(--color-hair)" }}>
      {items.map((x) => {
        const active = path?.startsWith(x.href);
        return (
          <Link key={x.href} href={x.href} style={{
            padding: "8px 12px", fontSize: 13, textDecoration: "none",
            color: active ? "var(--color-paper)" : "var(--color-ink)",
            background: active ? "var(--color-ink)" : "transparent",
            borderRadius: 3,
          }}>
            {t(x.key)}
          </Link>
        );
      })}
    </nav>
  );
}
