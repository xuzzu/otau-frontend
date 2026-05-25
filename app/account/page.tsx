"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { useLogout, useMe } from "@/lib/hooks";
import { useT } from "@/lib/i18n";

export default function AccountPage() {
  const router = useRouter();
  const { t } = useT();
  const me = useMe();
  const logout = useLogout();

  const isActive = me.data?.status === "active";

  useEffect(() => {
    if (me.isFetched && !isActive) {
      router.replace("/login?next=/account");
    }
  }, [me.isFetched, isActive, router]);

  if (!isActive) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
        <TopNav />
        <div className="label" style={{ padding: 56 }}>
          …
        </div>
      </main>
    );
  }

  const memberSince = me.data?.created_at
    ? new Date(me.data.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
      <TopNav />
      <section style={{ padding: "56px 56px", maxWidth: 720 }}>
        <h1
          className="serif"
          style={{
            fontSize: 56,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {t("account.title")}
        </h1>
        <div
          style={{
            display: "flex",
            gap: 22,
            marginTop: 18,
            paddingBottom: 12,
            borderBottom: "1px solid var(--color-hair)",
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-ink)",
              borderBottom: "1px solid var(--color-ink)",
              paddingBottom: 6,
            }}
          >
            {t("account.tab.account")}
          </span>
          <Link
            href="/likes"
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-taupe)",
              textDecoration: "none",
              paddingBottom: 6,
            }}
          >
            {t("account.tab.liked")}
          </Link>
          <Link
            href="/cart"
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-taupe)",
              textDecoration: "none",
              paddingBottom: 6,
            }}
          >
            {t("account.tab.cart")}
          </Link>
        </div>
        <div
          style={{
            marginTop: 32,
            border: "1px solid var(--color-hair)",
            background: "var(--color-paper)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <div className="label">Email</div>
            <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>
              {me.data?.email ?? "—"}
            </div>
          </div>
          <div>
            <div className="label">{t("login.tab.phone")}</div>
            <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>
              {me.data?.phone ?? "—"}
            </div>
          </div>
          <div>
            <div className="label">{t("account.member_since", { date: memberSince })}</div>
          </div>
        </div>
        <button
          onClick={async () => {
            await logout.mutateAsync();
            router.replace("/");
          }}
          className="btn ghost"
          style={{ marginTop: 24 }}
        >
          {t("account.logout")}
        </button>
      </section>
    </main>
  );
}
