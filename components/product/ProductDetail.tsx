"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProductHero3D } from "./ProductHero3D";
import { Product3DViewerModal } from "./Product3DViewerModal";
import { SimilarItems } from "./SimilarItems";
import { Photo } from "@/components/ui/Photo";
import { TryInARTrigger } from "@/components/ar/TryInAR";
import { useT, useLocale } from "@/lib/i18n";
import { pickText } from "@/lib/i18n/text";
import { T } from "@/lib/format";
import {
  useAddToCart,
  useCategoryLabel,
  useMyCart,
  useMyLikes,
  usePartners,
  useRoomTypeLabel,
  useShops,
  useStyleLabel,
  useTaxonomy,
  useToggleLike,
} from "@/lib/hooks";
import { resolveCatalogAsset } from "@/lib/api/env";
import type { Item, ItemImage } from "@/lib/api/types";

const ease = [0.22, 1, 0.36, 1] as const;

function pickHero(images: ItemImage[]): ItemImage | null {
  return (
    images.find((c) => c.is_main) ??
    [...images].sort((a, b) => a.sort_order - b.sort_order)[0] ??
    null
  );
}

export function ProductDetail({ product }: { product: Item }) {
  const { t } = useT();
  const locale = useLocale();

  const hero = pickHero(product.images);
  const heroUrl = resolveCatalogAsset(hero?.url);
  const [activeImage, setActiveImage] = useState<string | null>(heroUrl);
  const [viewer3DOpen, setViewer3DOpen] = useState(false);
  const modelAssetUrl = resolveCatalogAsset(product.model_3d?.asset_url);

  const partnersQ = usePartners();
  const partner = partnersQ.data?.find((p) => p.id === product.partner_id);
  const seller = partner?.name ?? "";

  const categoryLabel = useCategoryLabel(product.category_id);
  const roomLabel = useRoomTypeLabel(product.room_target_id);
  const primaryStyleId = product.style_ids[0];
  const primaryStyleLabel = useStyleLabel(primaryStyleId);
  const { indexed } = useTaxonomy();

  const defaultVariant = useMemo(
    () =>
      product.variants.find((v) => v.is_default) ??
      product.variants[0] ??
      null,
    [product.variants],
  );
  const price = defaultVariant?.price ?? 0;
  const description = pickText(product.description, locale);

  return (
    <main style={{ background: "var(--color-paper)", minHeight: "100vh" }}>
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
          <Link href="/catalog" style={{ color: "inherit", textDecoration: "none" }}>
            {t("product.crumb_root")}
          </Link>{" "}
          / {categoryLabel} /{" "}
          <span style={{ color: "var(--color-ink)" }}>{product.name}</span>
        </div>
        <div className="label">
          SKU · {product.slug.toUpperCase()} · {seller}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(380px, 460px)",
          gap: 40,
          padding: "24px 56px",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minWidth: 0,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4 / 3",
              background: "var(--color-cream)",
            }}
          >
            {activeImage ? (
              <Photo
                src={activeImage}
                label={product.name}
                fit="contain"
                style={{ position: "absolute", inset: 0 }}
              />
            ) : (
              <ProductHero3D kind="sofa" color="#9A8A72" />
            )}
          </motion.div>

          {product.images.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "nowrap",
                overflowX: "auto",
              }}
            >
              {product.images.map((c) => {
                const url = resolveCatalogAsset(c.url);
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveImage(url)}
                    style={{
                      position: "relative",
                      flex: "0 0 96px",
                      aspectRatio: "4 / 3",
                      outline:
                        activeImage === url
                          ? "2px solid var(--color-clay)"
                          : "none",
                      outlineOffset: 2,
                      border: 0,
                      background: "transparent",
                      cursor: "pointer",
                      padding: 0,
                    }}
                    aria-label={c.role}
                  >
                    <Photo src={url ?? undefined} style={{ position: "absolute", inset: 0 }} />
                  </button>
                );
              })}
              {modelAssetUrl && (
                <button
                  onClick={() => setViewer3DOpen(true)}
                  style={{
                    position: "relative",
                    flex: "0 0 96px",
                    aspectRatio: "4 / 3",
                    border: "1px solid var(--color-hair)",
                    background:
                      "radial-gradient(ellipse at 50% 60%, #FBF8F2 0%, #F4EFE6 70%, #E8DFD0 100%)",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--color-ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={t("product.3d.open")}
                  title={t("product.3d.label")}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Cube3DIcon /> {t("product.3d.label")}
                  </span>
                </button>
              )}
            </div>
          )}

        </div>

        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div className="label">
            {seller}
            {primaryStyleLabel ? ` · ${primaryStyleLabel}` : ""}
            {roomLabel ? ` · ${roomLabel}` : ""}
          </div>
          <h1
            className="serif"
            style={{
              fontSize: 44,
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              margin: "10px 0 6px",
              fontWeight: 400,
            }}
          >
            {product.name}
          </h1>
          {description && (
            <div
              style={{
                fontSize: 14,
                color: "#5B5043",
                lineHeight: 1.55,
                marginTop: 8,
              }}
            >
              {description}
            </div>
          )}

          <hr className="hr-hair" style={{ margin: "24px 0 18px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 18 }}>
            <div>
              <div className="serif num" style={{ fontSize: 44, lineHeight: 1 }}>
                {T(price)}
              </div>
              <div className="label" style={{ marginTop: 6 }}>
                {t("product.installment", {
                  price: T(Math.round(price / 12)),
                })}
              </div>
            </div>
          </div>

          {product.style_ids.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <span className="label">{t("product.specs.style")}</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {product.style_ids.map((sid) => {
                  const label = indexed
                    ? pickText(indexed.styles[sid]?.name, locale)
                    : sid;
                  return (
                    <span key={sid} className="chip" style={{ fontSize: 11 }}>
                      {label || sid}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <LikeRow productId={product.id} t={t} />
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <AddToCartButton
              itemId={product.id}
              variantId={defaultVariant?.id ?? null}
              partnerId={product.partner_id}
              t={t}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <TryInARTrigger
              variant="inline"
              productName={product.name}
              productPhoto={heroUrl ?? ""}
            />
          </div>

          <div
            style={{
              marginTop: 22,
              padding: 18,
              background: "var(--color-cream)",
              border: "1px solid var(--color-hair)",
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <div
              className="stripes-warm"
              style={{
                width: 56,
                height: 56,
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: 24,
                  color: "var(--color-ink)",
                }}
              >
                {seller[0] ?? "·"}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 15 }}>{seller}</span>
                <span className="label">{t("product.seller.verified")}</span>
              </div>
              <div className="label" style={{ marginTop: 4 }}>
                {t("product.seller.location")}
              </div>
            </div>
            {product.partner_id && (
              <Link
                href={`/showrooms`}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 20,
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                →
              </Link>
            )}
          </div>
        </div>
      </div>

      <SimilarItems product={product} />

      {modelAssetUrl && (
        <Product3DViewerModal
          open={viewer3DOpen}
          onClose={() => setViewer3DOpen(false)}
          url={modelAssetUrl}
          label={product.name}
        />
      )}
    </main>
  );
}

function Cube3DIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    >
      <path d="M7 1 L13 4 V10 L7 13 L1 10 V4 Z" fill="none" />
      <path d="M1 4 L7 7 L13 4" fill="none" />
      <path d="M7 7 V13" fill="none" />
    </svg>
  );
}

function LikeRow({
  productId,
  t,
}: {
  productId: string;
  t: (k: string, params?: Record<string, string | number>) => string;
}) {
  const likes = useMyLikes();
  const toggle = useToggleLike();
  const isLiked = !!likes.data?.some(
    (l) => l.target_kind === "item" && l.target_id === productId,
  );
  return (
    <button
      type="button"
      onClick={() =>
        toggle.mutate({
          target_kind: "item",
          target_id: productId,
          currentlyLiked: isLiked,
        })
      }
      className="btn ghost"
      style={{
        marginTop: 22,
        padding: "12px 16px",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        alignSelf: "flex-start",
      }}
      aria-pressed={isLiked}
      aria-label={isLiked ? t("product.liked") : t("product.like")}
    >
      <Heart filled={isLiked} />
      <span>{isLiked ? t("product.liked") : t("product.like")}</span>
    </button>
  );
}

function Heart({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden>
      <path
        d="M9 14 C 3 10, 1 7, 1 4.5 a 3.5 3.5 0 0 1 7 0 a 3.5 3.5 0 0 1 7 0 C 15 7, 13 10, 9 14 Z"
        stroke="#1A1612"
        strokeWidth="1"
        fill={filled ? "#1A1612" : "none"}
      />
    </svg>
  );
}

function AddToCartButton({
  itemId,
  variantId,
  partnerId,
  t,
}: {
  itemId: string;
  variantId: string | null;
  partnerId: string;
  t: (k: string, params?: Record<string, string | number>) => string;
}) {
  const cart = useMyCart();
  const add = useAddToCart();
  const shopsQ = useShops();
  const shopId = shopsQ.data?.find((s) => s.partner_id === partnerId)?.id ?? null;
  const inCart = !!cart.data?.items.some((it) => it.item_id === itemId);

  if (!variantId || !shopId) {
    return (
      <button
        className="btn ghost"
        disabled
        style={{ flex: 1, justifyContent: "center", padding: "18px" }}
      >
        {t("product.unavailable")}
      </button>
    );
  }

  if (inCart) {
    return (
      <Link
        href="/cart"
        className="btn ghost"
        style={{
          flex: 1,
          justifyContent: "center",
          padding: "18px",
          textDecoration: "none",
        }}
      >
        {t("product.in_cart_view")}
        <span className="arrow">→</span>
      </Link>
    );
  }

  return (
    <button
      onClick={() =>
        add.mutate({
          variant_id: variantId,
          item_id: itemId,
          shop_id: shopId,
          quantity: 1,
        })
      }
      disabled={add.isPending}
      className="btn"
      style={{ flex: 1, justifyContent: "center", padding: "18px" }}
    >
      {t("product.add_to_cart")}
      <span className="arrow">→</span>
    </button>
  );
}
