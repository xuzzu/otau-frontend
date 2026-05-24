"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRPlaceholder } from "./QRPlaceholder";
import { Photo } from "@/components/ui/Photo";
import { useT } from "@/lib/i18n";

const ease = [0.22, 1, 0.36, 1] as const;

type Variant = "inline" | "chip" | "ghost";

export function TryInARTrigger({
  variant = "inline",
  productName,
  productPhoto,
}: {
  variant?: Variant;
  productName?: string;
  productPhoto?: string;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "chip" && (
        <button
          onClick={() => setOpen(true)}
          className="chip"
          style={{ cursor: "pointer" }}
        >
          {t("ar.chip")}
        </button>
      )}

      {variant === "ghost" && (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#1A1612",
            fontFamily: "inherit",
          }}
        >
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 16 }}>◇</span>{" "}
          {t("studio.toolbar.ar")}
        </button>
      )}

      {variant === "inline" && (
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            width: "100%",
            padding: "14px 16px",
            border: "1px solid var(--color-hair)",
            background: "var(--color-paper)",
            cursor: "pointer",
            fontFamily: "inherit",
            color: "var(--color-ink)",
            textAlign: "left",
            transition: "border-color .2s, background .2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--color-clay)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--color-hair)";
          }}
        >
          <PhoneGlyph />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="serif it"
              style={{ fontSize: 16, lineHeight: 1.1 }}
            >
              {t("ar.inline.title")}
            </div>
            <div
              className="mono"
              style={{
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-taupe)",
                marginTop: 4,
              }}
            >
              {t("ar.inline.sub")}
            </div>
          </div>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: 18 }}>↗</span>
        </button>
      )}

      <ARModal
        open={open}
        onClose={() => setOpen(false)}
        productName={productName}
        productPhoto={productPhoto}
      />
    </>
  );
}

function ARModal({
  open,
  onClose,
  productName,
  productPhoto,
}: {
  open: boolean;
  onClose: () => void;
  productName?: string;
  productPhoto?: string;
}) {
  const { t } = useT();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(26,22,18,.5)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 50,
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.32, ease }}
            style={{
              background: "var(--color-paper)",
              width: "min(880px, 100%)",
              maxHeight: "90vh",
              overflow: "auto",
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,.45)",
              position: "relative",
            }}
          >
            {/* LEFT — phone preview */}
            <div
              style={{
                background: "var(--color-ink)",
                color: "var(--color-paper)",
                padding: 28,
                position: "relative",
              }}
            >
              <div
                className="label"
                style={{ color: "rgba(251,248,242,.6)" }}
              >
                {t("ar.modal.kicker")}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 28,
                  lineHeight: 1.05,
                  margin: "8px 0 22px",
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                }}
              >
                {t("ar.modal.title")}
              </div>

              <PhonePreview productName={productName} productPhoto={productPhoto} />

              <div
                className="mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(251,248,242,.5)",
                  marginTop: 20,
                  textAlign: "center",
                }}
              >
                {t("ar.modal.note")}
              </div>
            </div>

            {/* RIGHT — QR + steps */}
            <div
              style={{
                padding: 32,
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              <div>
                <div className="label">◇ {t("ar.modal.scan_label")}</div>
                <div
                  style={{
                    marginTop: 12,
                    padding: 16,
                    border: "1px solid var(--color-hair)",
                    display: "inline-block",
                  }}
                >
                  <QRPlaceholder size={160} />
                </div>
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    color: "#5B5043",
                    lineHeight: 1.5,
                    maxWidth: 280,
                  }}
                >
                  {t("ar.modal.lede")}
                </div>
              </div>

              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  borderTop: "1px solid var(--color-hair)",
                  paddingTop: 18,
                }}
              >
                {["1", "2", "3"].map((n) => (
                  <li
                    key={n}
                    style={{
                      display: "flex",
                      gap: 12,
                      alignItems: "baseline",
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      className="mono num"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.14em",
                        color: "var(--color-clay)",
                        flexShrink: 0,
                      }}
                    >
                      0{n}
                    </span>
                    <span>{t(`ar.modal.step${n}`)}</span>
                  </li>
                ))}
              </ol>

              <button
                onClick={onClose}
                className="btn ghost small"
                style={{ alignSelf: "flex-start", marginTop: "auto" }}
              >
                {t("ar.modal.close")}
              </button>
            </div>

            {/* close (corner) */}
            <button
              onClick={onClose}
              aria-label={t("ar.modal.close")}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                border: "1px solid rgba(251,248,242,.3)",
                borderRadius: 999,
                background: "transparent",
                color: "var(--color-paper)",
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhonePreview({
  productName,
  productPhoto,
}: {
  productName?: string;
  productPhoto?: string;
}) {
  const { t } = useT();
  const room =
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=80";
  return (
    <div
      style={{
        position: "relative",
        width: 240,
        height: 340,
        margin: "0 auto",
        background: "#000",
        borderRadius: 28,
        overflow: "hidden",
        border: "6px solid #2a231c",
        boxShadow: "0 30px 60px -20px rgba(0,0,0,.6)",
      }}
    >
      <Photo src={room} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(26,22,18,.4) 0%, transparent 25%, rgba(26,22,18,.6) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          right: 12,
          display: "flex",
          justifyContent: "space-between",
          color: "#FBF8F2",
          fontSize: 9,
        }}
      >
        <span style={{ fontWeight: 600 }}>9:41</span>
        <span>5G ▮▮▮▮</span>
      </div>
      <div
        className="mono"
        style={{
          position: "absolute",
          top: 38,
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(26,22,18,.5)",
          color: "#FBF8F2",
          padding: "5px 10px",
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          backdropFilter: "blur(4px)",
        }}
      >
        ● {t("ar.preview.floor_locked")}
      </div>

      {/* Ghost furniture overlay */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          width: 170,
          height: 95,
        }}
      >
        {productPhoto && (
          <Photo
            src={productPhoto}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.85,
              mixBlendMode: "multiply",
            }}
          />
        )}
        {/* dashed floor footprint */}
        <div
          style={{
            position: "absolute",
            left: -6,
            right: -6,
            bottom: -10,
            height: 20,
            border: "1.5px dashed var(--color-clay)",
            borderRadius: "50% / 100%",
            borderTop: "none",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 12,
          right: 12,
          background: "rgba(251,248,242,.96)",
          padding: "8px 10px",
          color: "#1A1612",
          fontSize: 10,
          lineHeight: 1.3,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11 }}>{productName ?? "Klemo 3-seat"}</div>
          <div
            className="mono"
            style={{
              fontSize: 8,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-taupe)",
              marginTop: 2,
            }}
          >
            220 × 92 cm
          </div>
        </div>
        <span
          style={{
            background: "var(--color-clay)",
            color: "#FBF8F2",
            padding: "5px 8px",
            fontSize: 9,
            letterSpacing: "0.06em",
          }}
        >
          ↺
        </span>
      </div>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg
      width="22"
      height="30"
      viewBox="0 0 22 30"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <rect
        x="1"
        y="1"
        width="20"
        height="28"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect x="4" y="4" width="14" height="20" stroke="currentColor" strokeWidth="0.8" />
      <circle cx="11" cy="27" r="0.8" fill="currentColor" />
    </svg>
  );
}
