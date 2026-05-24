"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TopNav } from "@/components/nav/TopNav";
import { Photo } from "@/components/ui/Photo";
import { ARTICLES, formatDate } from "@/lib/journal";
import { useT, useLangStore } from "@/lib/i18n";

const ease = [0.22, 1, 0.36, 1] as const;

export default function JournalPage() {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const featured = ARTICLES.find((a) => a.featured);
  const rest = ARTICLES.filter((a) => !a.featured);

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-cream)" }}>
      <TopNav />

      {/* Masthead band */}
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
          <div className="label">{t("journal.crumb")}</div>
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
            {t("journal.h1.main")}{" "}
            <span className="it">{t("journal.h1.italic")}</span>
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
            {t("journal.lede")}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="label">{t("journal.issue.label")}</div>
          <div
            className="serif num it"
            style={{ fontSize: 38, lineHeight: 1, marginTop: 6 }}
          >
            {t("journal.issue.vol")}
          </div>
          <div className="label" style={{ marginTop: 6 }}>
            {t("journal.issue.sub", { n: ARTICLES.length })}
          </div>
        </div>
      </div>

      <hr
        className="hr-hair"
        style={{ margin: "0 56px 32px", background: "var(--color-hair)" }}
      />

      {/* Featured article */}
      {featured && (
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          style={{ padding: "0 56px 40px" }}
        >
          <Link
            href={`/journal/${featured.slug}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 32,
              alignItems: "stretch",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.5, ease }}
              style={{ position: "relative", minHeight: 520, overflow: "hidden" }}
            >
              <Photo
                src={featured.photo}
                label={featured.titleEN}
                style={{ position: "absolute", inset: 0 }}
              />
              <div
                className="chip solid"
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  fontSize: 11,
                }}
              >
                ◇ {t("journal.featured")}
              </div>
            </motion.div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "8px 4px",
              }}
            >
              <div className="label">
                {formatDate(featured.date, lang)} ·{" "}
                {t(`journal.cat.${featured.category}`)}
              </div>
              <h2
                className="serif"
                style={{
                  fontSize: "clamp(40px, 4.8vw, 64px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  margin: "14px 0 16px",
                  fontWeight: 400,
                }}
              >
                {t(`journal.article.${featured.id}.title`)}
              </h2>
              <p
                style={{
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: "#5B5043",
                  maxWidth: 560,
                }}
              >
                {t(`journal.article.${featured.id}.lede`)}
              </p>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 22,
                  borderTop: "1px solid var(--color-hair)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="label">
                  {featured.author} · {t("journal.read", { n: featured.readMin })}
                </div>
                <span className="serif it" style={{ fontSize: 18 }}>
                  {t("journal.read_cta")} →
                </span>
              </div>
            </div>
          </Link>
        </motion.article>
      )}

      <hr
        className="hr-hair"
        style={{ margin: "0 56px 32px", background: "var(--color-hair)" }}
      />

      {/* Grid of cards */}
      <div
        style={{
          padding: "0 56px 64px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 28,
        }}
      >
        {rest.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease, delay: i * 0.04 }}
          >
            <Link
              href={`/journal/${a.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.5, ease }}
                style={{ position: "relative", height: 280, overflow: "hidden" }}
              >
                <Photo
                  src={a.photo}
                  label={a.titleEN}
                  style={{ position: "absolute", inset: 0 }}
                />
              </motion.div>
              <div>
                <div className="label">
                  {formatDate(a.date, lang)} · {t(`journal.cat.${a.category}`)}
                </div>
                <h3
                  className="serif"
                  style={{
                    fontSize: 26,
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                    margin: "10px 0 8px",
                    fontWeight: 400,
                  }}
                >
                  {t(`journal.article.${a.id}.title`)}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#5B5043",
                    margin: 0,
                  }}
                >
                  {t(`journal.article.${a.id}.lede`)}
                </p>
                <div
                  className="label"
                  style={{ marginTop: 12 }}
                >
                  {a.author} · {t("journal.read", { n: a.readMin })}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
