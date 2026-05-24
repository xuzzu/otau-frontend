"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Photo } from "@/components/ui/Photo";
import { useT, useLangStore } from "@/lib/i18n";
import { ARTICLES, formatDate, type Article } from "@/lib/journal";

const ease = [0.22, 1, 0.36, 1] as const;

export function ArticleView({ article }: { article: Article }) {
  const { t } = useT();
  const lang = useLangStore((s) => s.lang);
  const others = ARTICLES.filter((a) => a.id !== article.id).slice(0, 3);

  const title = t(`journal.article.${article.id}.title`);
  const lede = t(`journal.article.${article.id}.lede`);
  // Body paragraphs come from the dictionary so they translate. If a given
  // article doesn't have a body translation, show the lede expanded by a
  // generic "more to come" note — better than a half-rendered page.
  const translated = (() => {
    const arr: string[] = [];
    for (let i = 0; i < 8; i++) {
      const k = `journal.article.${article.id}.body.${i}`;
      const v = t(k);
      if (v === k) break;
      arr.push(v);
    }
    return arr;
  })();
  const body =
    translated.length > 0 ? translated : [lede, t("journal.body_coming")];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-paper)",
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          padding: "20px 56px 0",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div className="label">
          <Link href="/journal" style={{ color: "inherit", textDecoration: "none" }}>
            {t("journal.crumb_root")}
          </Link>{" "}
          / {t(`journal.cat.${article.category}`)} /{" "}
          <span style={{ color: "var(--color-ink)" }}>{title}</span>
        </div>
        <div className="label">
          {formatDate(article.date, lang)} ·{" "}
          {t("journal.read", { n: article.readMin })}
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        style={{
          padding: "32px 56px 40px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div>
          <div className="label" style={{ color: "var(--color-clay)" }}>
            {t(`journal.cat.${article.category}`)} · vol. 01
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(48px, 5.6vw, 84px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              margin: "16px 0 16px",
              fontWeight: 400,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 19,
              lineHeight: 1.55,
              color: "#5B5043",
              maxWidth: 540,
            }}
          >
            {lede}
          </p>
          <div
            className="label"
            style={{ marginTop: 22 }}
          >
            {t("journal.by", { name: article.author })}
          </div>
        </div>
        <div style={{ position: "relative", minHeight: 480, overflow: "hidden" }}>
          <Photo src={article.photo} label={title} style={{ position: "absolute", inset: 0 }} />
        </div>
      </motion.div>

      {/* Body */}
      <article
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "16px 24px 80px",
        }}
      >
        {/* Decorative dropcap on first paragraph */}
        {body.map((p, i) => (
          <p
            key={i}
            style={{
              fontSize: 19,
              lineHeight: 1.65,
              color: "#3a3128",
              margin: "0 0 22px",
            }}
          >
            {i === 0 && (
              <span
                className="serif"
                style={{
                  float: "left",
                  fontSize: 84,
                  lineHeight: 0.85,
                  margin: "6px 12px 0 0",
                  color: "var(--color-clay)",
                  fontWeight: 400,
                }}
              >
                {p[0]}
              </span>
            )}
            {i === 0 ? p.slice(1) : p}
          </p>
        ))}

        {article.detailPhoto && (
          <figure style={{ margin: "36px 0", padding: 0 }}>
            <div style={{ position: "relative", height: 480 }}>
              <Photo
                src={article.detailPhoto}
                style={{ position: "absolute", inset: 0 }}
              />
            </div>
            <figcaption
              className="mono"
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-taupe)",
                marginTop: 10,
              }}
            >
              ◇ {t("journal.figure")}
            </figcaption>
          </figure>
        )}

        <hr className="hr-hair" style={{ margin: "40px 0 24px" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div className="label">{t("journal.by", { name: article.author })}</div>
          <div className="label">
            {formatDate(article.date, lang)} ·{" "}
            {t("journal.read", { n: article.readMin })}
          </div>
        </div>
      </article>

      {/* Related */}
      <section
        style={{
          borderTop: "1px solid var(--color-hair)",
          padding: "40px 56px 64px",
          background: "var(--color-cream)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <div className="label">{t("journal.more")}</div>
          <Link
            href="/journal"
            className="label"
            style={{
              textDecoration: "underline",
              textUnderlineOffset: 3,
              color: "var(--color-ink)",
            }}
          >
            {t("journal.see_all")} →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {others.map((a) => (
            <Link
              key={a.id}
              href={`/journal/${a.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ position: "relative", height: 220, overflow: "hidden" }}>
                <Photo src={a.photo} style={{ position: "absolute", inset: 0 }} />
              </div>
              <div className="label">
                {formatDate(a.date, lang)} · {t(`journal.cat.${a.category}`)}
              </div>
              <h4
                className="serif"
                style={{
                  fontSize: 22,
                  lineHeight: 1.1,
                  margin: 0,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                }}
              >
                {t(`journal.article.${a.id}.title`)}
              </h4>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
