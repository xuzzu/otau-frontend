"use client";
import { useState } from "react";
import type { StoreScene } from "@/lib/store-api/types";

export function SceneShowcase({ scenes }: { scenes: StoreScene[] }) {
  const [active, setActive] = useState(0);

  if (scenes.length === 0) {
    return (
      <div
        className="serif it"
        style={{
          padding: 48, textAlign: "center", color: "var(--color-taupe-2)",
          fontSize: 18, background: "var(--color-paper)", border: "1px solid var(--color-hair)",
        }}
      >
        Your items haven&apos;t been imagined yet. Once buyers start exploring your catalog, scenes will appear here.
      </div>
    );
  }

  const cur = scenes[active] ?? scenes[0];
  const itemName = cur.featured_item?.name ?? "—";
  const audience = cur.audience_hint ? ` ${cur.audience_hint}` : "";

  return (
    <div>
      <div
        style={{
          position: "relative", height: 380, borderRadius: 4, overflow: "hidden",
          background: cur.image_url
            ? `center/cover no-repeat url(${cur.image_url})`
            : "linear-gradient(120deg, #2a231c 0%, #5a3e2a 30%, #b5532e 65%, #d8a05b 100%)",
          color: "var(--color-paper)",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(26,22,18,0) 30%, rgba(26,22,18,.55) 100%)",
            pointerEvents: "none",
          }}
        />
        <div style={{
          position: "absolute", inset: 0, padding: "36px 40px",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="mono" style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", opacity: 0.92 }}>
              Scene {active + 1} of {scenes.length}
              {audience && <em className="serif" style={{ marginLeft: 8, opacity: 0.7, textTransform: "none", letterSpacing: 0, fontSize: 16 }}>composed for{audience}</em>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <ArrowBtn aria-label="Previous scene" onClick={() => setActive((a) => (a - 1 + scenes.length) % scenes.length)}>←</ArrowBtn>
              <ArrowBtn aria-label="Next scene" onClick={() => setActive((a) => (a + 1) % scenes.length)}>→</ArrowBtn>
            </div>
          </div>
          <div className="serif" style={{ fontSize: 56, lineHeight: 1.02, maxWidth: "70%" }}>
            Your {itemName}, <em style={{ fontStyle: "italic", color: "var(--color-amber)" }}>at home</em>{audience && `${audience}.`}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div className="mono" style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.92 }}>
                Featuring <strong style={{ color: "var(--color-amber)", fontWeight: 500 }}>{itemName}</strong>
                {cur.featured_item && (
                  <> · <strong style={{ color: "var(--color-amber)", fontWeight: 500 }}>{cur.featured_item.likes_today} saves</strong> today</>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => alert("Feature in catalog — coming soon")}
              className="mono"
              style={{
                background: "rgba(216,160,91,.94)", color: "var(--color-ink)",
                padding: "12px 18px", borderRadius: 999, border: 0,
                fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              ＋ Feature in catalog
            </button>
          </div>
        </div>
      </div>

      {scenes.length > 1 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(scenes.length, 8)}, 1fr)`, gap: 8, marginTop: 12 }}>
          {scenes.slice(0, 8).map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Scene ${i + 1} of ${scenes.length}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              style={{
                aspectRatio: "16/10", border: 0, padding: 0,
                opacity: i === active ? 1 : 0.55,
                outline: i === active ? "1px solid var(--color-ink)" : "none",
                outlineOffset: 2,
                background: s.image_url
                  ? `center/cover no-repeat url(${s.image_url})`
                  : "linear-gradient(120deg, #2a231c 0%, #5a3e2a 50%, #b5532e 100%)",
                cursor: "pointer", transition: "opacity .2s, transform .2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArrowBtn({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      type="button"
      style={{
        width: 36, height: 36, borderRadius: 999,
        border: "1px solid rgba(251,248,242,.4)", background: "transparent",
        color: "var(--color-paper)", display: "grid", placeItems: "center",
        fontFamily: "var(--font-serif)", fontSize: 22, lineHeight: 1, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
