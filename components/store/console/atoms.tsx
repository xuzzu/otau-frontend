import type { CSSProperties, ReactNode } from "react";

export function Photo({ src, alt = "", style }: { src?: string; alt?: string; style?: CSSProperties }) {
  return (
    <div className="photo" style={style}>
      {src ? <img src={src} alt={alt} /> : <div className="ph-fallback">no image</div>}
    </div>
  );
}

export function SellerSearch({ placeholder, width = 280 }: { placeholder?: string; width?: number }) {
  return (
    <input
      placeholder={placeholder}
      style={{
        width,
        padding: "10px 14px",
        background: "var(--color-paper)",
        border: "1px solid var(--color-hair)",
        fontSize: 12,
        fontFamily: "inherit",
        color: "var(--color-ink)",
      }}
    />
  );
}

export function IconBtn({ children, badge }: { children: ReactNode; badge?: number }) {
  return (
    <button
      style={{
        position: "relative",
        width: 38,
        height: 38,
        background: "var(--color-paper)",
        border: "1px solid var(--color-hair)",
        cursor: "pointer",
        fontSize: 15,
        color: "var(--color-ink)",
      }}
    >
      {children}
      {badge != null && (
        <span
          className="mono"
          style={{
            position: "absolute",
            top: -7,
            right: -7,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            background: "var(--color-clay)",
            color: "var(--color-paper)",
            fontSize: 9,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
