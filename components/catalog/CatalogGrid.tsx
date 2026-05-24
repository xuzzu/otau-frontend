"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/products";
import { useT } from "@/lib/i18n";

export function CatalogGrid({ products }: { products: Product[] }) {
  const { t } = useT();
  if (products.length === 0) {
    return (
      <div style={{ padding: "80px 56px", textAlign: "center" }}>
        <div className="serif it" style={{ fontSize: 32, color: "var(--color-taupe)" }}>
          {t("catalog.empty.title")}
        </div>
        <div className="label" style={{ marginTop: 12 }}>
          {t("catalog.empty.lede")}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px 56px 48px",
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: 20,
      }}
    >
      <AnimatePresence mode="popLayout">
        {products.map((p, i) => {
          // Editorial rhythm: first row breathes wider, rest are uniform 4-col tiles.
          const colSpan = i === 0 ? 5 : i === 1 ? 4 : i === 2 ? 3 : 4;
          const size: "s" | "m" | "l" = i === 0 ? "l" : "m";
          return (
            <div key={p.id} style={{ gridColumn: `span ${colSpan}` }}>
              <ProductCard product={p} size={size} />
            </div>
          );
        })}
      </AnimatePresence>

      {/* Floating nudge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          right: 32,
          bottom: 32,
          background: "#1A1612",
          color: "#FBF8F2",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          maxWidth: 380,
          zIndex: 4,
          boxShadow: "0 30px 60px -30px rgba(0,0,0,.5)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "1px solid #FBF8F2",
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          ◇
        </div>
        <div style={{ flex: 1, fontSize: 13, lineHeight: 1.3 }}>
          <div className="serif it" style={{ fontSize: 16 }}>
            {t("catalog.cta.title")}
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.7,
              marginTop: 2,
            }}
          >
            {t("catalog.cta.sub")}
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-serif)", fontSize: 20 }}>→</span>
      </motion.div>
    </div>
  );
}
