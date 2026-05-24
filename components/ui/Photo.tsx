"use client";

import { useState, CSSProperties } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  label?: string;
  style?: CSSProperties;
  className?: string;
  rounded?: boolean;
};

export function Photo({ src, alt, label, style, className, rounded }: Props) {
  const [err, setErr] = useState(false);
  return (
    <div
      className={`photo ${className ?? ""}`}
      style={{ borderRadius: rounded ? 12 : 0, ...style }}
    >
      {!err && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          onError={() => setErr(true)}
          loading="lazy"
        />
      ) : (
        <div className="stripes" style={{ position: "absolute", inset: 0 }}>
          <div className="ph-fallback">{label || alt || "image"}</div>
        </div>
      )}
    </div>
  );
}
