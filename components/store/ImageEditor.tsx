"use client";
import { useState } from "react";
import { useAddImage, useDeleteImage, usePatchImage } from "@/lib/store-api/hooks";

export function ImageEditor({ item_id, images, mainUrl }: {
  item_id: string;
  images: { id: string; url: string; is_main: boolean }[];
  mainUrl: string | null;
}) {
  const [url, setUrl] = useState("");
  const add = useAddImage(item_id);
  const patch = usePatchImage(item_id);
  const del = useDeleteImage(item_id);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {images.map((img) => (
          <div key={img.id} style={{ position: "relative" }}>
            <img src={img.url} alt="" style={{ width: 96, height: 96, objectFit: "cover", border: img.url === mainUrl ? "2px solid var(--color-ink)" : "1px solid var(--color-hair)" }} />
            <div style={{ position: "absolute", bottom: 2, left: 2, right: 2, display: "flex", gap: 4 }}>
              {img.url !== mainUrl && (
                <button onClick={() => patch.mutate({ img_id: img.id, body: { is_main: true } })} style={{ fontSize: 10, padding: "1px 4px" }}>★</button>
              )}
              <button onClick={() => del.mutate(img.id)} style={{ fontSize: 10, padding: "1px 4px" }}>✕</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <input
          placeholder="https://image-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: "4px 8px", border: "1px solid var(--color-hair)" }}
        />
        <button
          onClick={() => { if (url) { add.mutate({ url, is_main: images.length === 0 }); setUrl(""); } }}
          style={{ padding: "4px 10px", background: "var(--color-ink)", color: "var(--color-paper)" }}
        >Add</button>
      </div>
    </div>
  );
}
