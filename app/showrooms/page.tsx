"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TopNav } from "@/components/nav/TopNav";
import { Photo } from "@/components/ui/Photo";
import { useItems, usePartners, useShops } from "@/lib/hooks";
import { resolveCatalogAsset } from "@/lib/api/env";
import { useT, useLocale } from "@/lib/i18n";
import { pickText } from "@/lib/i18n/text";
import type { Partner, Shop } from "@/lib/api/types";

const ease = [0.22, 1, 0.36, 1] as const;

type PartnerCard = {
  partner: Partner;
  shop: Shop | null;
  itemCount: number;
};

export default function ShowroomsPage() {
  const { t } = useT();
  const locale = useLocale();
  const partnersQ = usePartners();
  const shopsQ = useShops();
  const itemsQ = useItems({ limit: 100 });

  const cards: PartnerCard[] = useMemo(() => {
    const partners = partnersQ.data ?? [];
    const shops = shopsQ.data ?? [];
    const items = itemsQ.data ?? [];
    const shopByPartner = new Map<string, Shop>();
    for (const s of shops) shopByPartner.set(s.partner_id, s);
    const countsByPartner = new Map<string, number>();
    for (const item of items) {
      countsByPartner.set(
        item.partner_id,
        (countsByPartner.get(item.partner_id) ?? 0) + 1,
      );
    }
    return partners.map((p) => ({
      partner: p,
      shop: shopByPartner.get(p.id) ?? null,
      itemCount: countsByPartner.get(p.id) ?? 0,
    }));
  }, [partnersQ.data, shopsQ.data, itemsQ.data]);

  const totalPieces = itemsQ.data?.length ?? 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
      <TopNav />

      <div
        style={{
          padding: "44px 56px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 32,
          flexWrap: "wrap",
        }}
      >
        <div style={{ maxWidth: 720 }}>
          <div className="label">{t("showrooms.crumb")}</div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(48px, 5.6vw, 76px)",
              margin: "10px 0 0",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              fontWeight: 400,
            }}
          >
            {t("showrooms.h1.main")}{" "}
            <span className="it">{t("showrooms.h1.italic")}</span>
          </h1>
          <p
            style={{
              marginTop: 18,
              fontSize: 17,
              lineHeight: 1.55,
              color: "#5B5043",
              maxWidth: 560,
            }}
          >
            {t("showrooms.lede")}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="label">{t("showrooms.stats.label")}</div>
          <div
            className="serif num"
            style={{ fontSize: 56, lineHeight: 1, marginTop: 6 }}
          >
            {cards.length}
          </div>
          <div className="label" style={{ marginTop: 6 }}>
            {t("showrooms.stats.sub", { n: totalPieces })}
          </div>
        </div>
      </div>

      <hr
        className="hr-hair"
        style={{ margin: "0 56px 32px", background: "var(--color-hair)" }}
      />

      <div
        style={{
          padding: "0 56px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        {cards.map(({ partner, shop, itemCount }, i) => {
          const reverse = i % 2 === 1;
          return (
            <motion.article
              key={partner.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 32,
                alignItems: "stretch",
                direction: reverse ? "rtl" : "ltr",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: 12,
                  direction: "ltr",
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5, ease }}
                  style={{ position: "relative", minHeight: 420, overflow: "hidden" }}
                >
                  <Photo
                    src={resolveCatalogAsset(partner.hero_photo_url) ?? undefined}
                    label={partner.name}
                    style={{ position: "absolute", inset: 0 }}
                  />
                </motion.div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                    <Photo
                      src={resolveCatalogAsset(partner.detail_photo_url) ?? undefined}
                      style={{ position: "absolute", inset: 0 }}
                    />
                  </div>
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "var(--color-paper)",
                      border: "1px solid var(--color-hair)",
                    }}
                  >
                    <div className="label">{t("showrooms.founded")}</div>
                    <div
                      className="serif num"
                      style={{ fontSize: 24, marginTop: 2, lineHeight: 1 }}
                    >
                      {partner.founded_year ?? "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  direction: "ltr",
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 8px",
                }}
              >
                <div className="label">
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {String(cards.length).padStart(2, "0")}
                  {shop?.city ? ` · ${shop.city}` : ""}
                </div>
                <h2
                  className="serif"
                  style={{
                    fontSize: "clamp(40px, 4.2vw, 56px)",
                    margin: "10px 0 6px",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.02,
                    fontWeight: 400,
                  }}
                >
                  {partner.name}
                </h2>
                <div
                  className="serif it"
                  style={{
                    fontSize: 22,
                    color: "var(--color-clay)",
                    marginBottom: 18,
                  }}
                >
                  {pickText(partner.tagline, locale)}
                </div>

                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.55,
                    color: "#5B5043",
                    margin: 0,
                  }}
                >
                  {pickText(partner.story, locale)}
                </p>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 22,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 0,
                    borderTop: "1px solid var(--color-hair)",
                  }}
                >
                  <Mini
                    l={t("showrooms.meta.pieces")}
                    v={String(itemCount)}
                    sub={t("showrooms.meta.in_catalog")}
                  />
                  <Mini
                    l={t("showrooms.meta.address")}
                    v={shop?.city ?? "—"}
                    sub={shop?.address ?? ""}
                    border
                  />
                </div>

                <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
                  <Link
                    href={`/catalog?seller=${encodeURIComponent(partner.slug)}`}
                    className="btn"
                    style={{
                      textDecoration: "none",
                      padding: "14px 22px",
                      fontSize: 14,
                    }}
                  >
                    {t("showrooms.cta.see", { n: itemCount })}
                    <span className="arrow">→</span>
                  </Link>
                  <button className="btn ghost" style={{ padding: "14px 18px", fontSize: 14 }}>
                    {t("showrooms.cta.visit")}
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </main>
  );
}

function Mini({
  l,
  v,
  sub,
  border,
}: {
  l: string;
  v: string;
  sub?: string;
  border?: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        borderLeft: border ? "1px solid var(--color-hair)" : "none",
      }}
    >
      <div className="label">{l}</div>
      <div className="serif num" style={{ fontSize: 22, lineHeight: 1, marginTop: 4 }}>
        {v}
      </div>
      {sub && (
        <div
          className="mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--color-taupe)",
            marginTop: 6,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
