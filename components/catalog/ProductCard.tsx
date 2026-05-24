"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Photo } from "@/components/ui/Photo";
import { T } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { usePartners, useRoomTypeLabel } from "@/lib/hooks";
import { resolveCatalogAsset } from "@/lib/api/env";
import type { Product } from "@/lib/products";

export function ProductCard({
  product,
  size = "m",
}: {
  product: Product;
  size?: "s" | "m" | "l";
}) {
  const { t } = useT();
  const partnersQ = usePartners();
  const roomLabel = useRoomTypeLabel(product.room_target_id);
  const partner = partnersQ.data?.find((p) => p.id === product.partner_id);
  const seller = partner?.name ?? "";

  const h = size === "l" ? 380 : size === "s" ? 240 : 300;
  const imageUrl = resolveCatalogAsset(product.main_image_url);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      <Link
        href={`/catalog/${product.slug}`}
        style={{
          position: "relative",
          height: h,
          textDecoration: "none",
          color: "inherit",
          display: "block",
          overflow: "hidden",
        }}
        className="group"
      >
        <motion.div
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Photo
            src={imageUrl ?? undefined}
            label={product.name}
            style={{ position: "absolute", inset: 0 }}
          />
        </motion.div>

        {product.tag && product.tag !== "none" && (
          <div
            className="mono"
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "6px 10px",
              background: "rgba(251,248,242,.94)",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1A1612",
            }}
          >
            {product.tag}
          </div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="btn small ghost"
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            background: "rgba(251,248,242,.96)",
            borderColor: "transparent",
            color: "#1A1612",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 12 }}>{t("catalog.try_in_room")}</span>
        </motion.button>
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 15, letterSpacing: "-0.01em" }}>
            {product.name}
          </div>
          <div className="label" style={{ marginTop: 4 }}>
            {seller}
            {roomLabel ? ` · ${roomLabel}` : ""}
          </div>
        </div>
        <div className="num" style={{ fontSize: 15, whiteSpace: "nowrap" }}>
          {product.default_price != null ? T(product.default_price) : ""}
        </div>
      </div>
    </motion.div>
  );
}
