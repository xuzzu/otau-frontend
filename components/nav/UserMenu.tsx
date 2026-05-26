"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { useLogout, useMe, useMyCart, useMyLikes } from "@/lib/hooks";

export function UserMenu({ inverse = false }: { inverse?: boolean }) {
  const { t } = useT();
  const me = useMe();
  const cart = useMyCart();
  const likes = useMyLikes();
  const likeCount =
    likes.data?.filter((l) => l.target_kind === "item").length ?? 0;
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const fg = inverse ? "#FBF8F2" : "#1A1612";
  const isActive = me.data?.status === "active";
  const itemCount = cart.data?.items?.length ?? 0;

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Link
        href="/likes"
        style={{
          color: fg,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          position: "relative",
        }}
        aria-label={t("nav.liked")}
        title={t("nav.liked")}
      >
        <HeartNav inverse={inverse} />
        {likeCount > 0 && (
          <span
            className="mono"
            style={{
              fontSize: 10,
              background: "var(--color-clay)",
              color: "var(--color-paper)",
              padding: "1px 6px",
              borderRadius: 999,
              minWidth: 16,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {likeCount}
          </span>
        )}
      </Link>

      <Link
        href="/cart"
        style={{
          color: fg,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 6,
          position: "relative",
        }}
        aria-label={t("nav.cart")}
        title={t("nav.cart")}
      >
        <Bag inverse={inverse} />
        {itemCount > 0 && (
          <span
            className="mono"
            style={{
              fontSize: 10,
              background: "var(--color-clay)",
              color: "var(--color-paper)",
              padding: "1px 6px",
              borderRadius: 999,
              minWidth: 16,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {itemCount}
          </span>
        )}
      </Link>

      {isActive ? (
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setOpen((v) => !v)}
            style={{
              color: fg,
              background: "transparent",
              border: 0,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
              padding: 0,
            }}
          >
            {me.data?.email ?? me.data?.phone ?? t("nav.account")}
          </button>
          {open && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                background: "var(--color-paper)",
                border: "1px solid var(--color-hair)",
                boxShadow: "var(--shadow-card, 0 12px 28px -16px rgba(0,0,0,.18))",
                minWidth: 200,
                display: "flex",
                flexDirection: "column",
                zIndex: 10,
              }}
            >
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                style={{
                  padding: "10px 14px",
                  textDecoration: "none",
                  color: "var(--color-ink)",
                  fontSize: 13,
                }}
              >
                {t("nav.account")}
              </Link>
              <button
                onClick={async () => {
                  setOpen(false);
                  await logout.mutateAsync();
                  router.replace("/");
                }}
                style={{
                  padding: "10px 14px",
                  textAlign: "left",
                  background: "transparent",
                  border: 0,
                  borderTop: "1px solid var(--color-hair)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  color: "var(--color-ink)",
                }}
              >
                {t("nav.logout")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href={`/login?next=${encodeURIComponent(pathname || "/")}`}
          style={{ color: fg, textDecoration: "none", fontSize: 13 }}
        >
          {t("nav.signin")}
        </Link>
      )}
    </div>
  );
}

function HeartNav({ inverse }: { inverse?: boolean }) {
  const c = inverse ? "#FBF8F2" : "#1A1612";
  return (
    <svg width="16" height="14" viewBox="0 0 18 16" fill="none" aria-hidden>
      <path
        d="M9 14 C 3 10, 1 7, 1 4.5 a 3.5 3.5 0 0 1 7 0 a 3.5 3.5 0 0 1 7 0 C 15 7, 13 10, 9 14 Z"
        stroke={c}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

function Bag({ inverse }: { inverse?: boolean }) {
  const c = inverse ? "#FBF8F2" : "#1A1612";
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden>
      <path d="M1 5 H13 L12 15 H2 Z" stroke={c} strokeWidth="1" fill="none" />
      <path
        d="M4.5 5 V3.5 a2.5 2.5 0 0 1 5 0 V5"
        stroke={c}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
