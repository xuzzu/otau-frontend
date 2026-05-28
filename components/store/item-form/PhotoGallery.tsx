"use client";

import { useRef, useState } from "react";
import { resolveCatalogAsset } from "@/lib/api/env";
import { useUploadImage, usePatchImage, useDeleteImage } from "@/lib/store-api/hooks";
import type { StoreItemImage } from "@/lib/store-api/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

export function PhotoGallery({
  itemId,
  variantId,
  images,
  max = 4,
  onChanged,
}: {
  itemId: string;
  variantId: string | null;
  images: StoreItemImage[];
  max?: number;
  onChanged: () => void;
}) {
  const upload = useUploadImage(itemId);
  const patchImg = usePatchImage(itemId);
  const deleteImg = useDeleteImage(itemId);

  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setFileError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Только JPEG, PNG или WebP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("Файл больше 8 МБ");
      return;
    }
    upload.mutate(
      {
        file,
        variant_id: variantId ?? undefined,
        is_main: images.length === 0,
      },
      { onSuccess: () => { onChanged(); } },
    );
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so the same file can be re-selected
    e.target.value = "";
  }

  function handleSetMain(img: StoreItemImage) {
    patchImg.mutate(
      { img_id: img.id, body: { is_main: true } },
      { onSuccess: () => onChanged() },
    );
  }

  function handleDelete(img: StoreItemImage) {
    deleteImg.mutate(img.id, { onSuccess: () => onChanged() });
  }

  const showDropZone = images.length < max;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {images.map((img) => {
        const src = resolveCatalogAsset(img.url) ?? img.url;
        return (
          <div
            key={img.id}
            style={{
              position: "relative",
              width: 96,
              height: 96,
              border: img.is_main
                ? "2px solid var(--color-ink)"
                : "1px solid var(--color-hair)",
              borderRadius: 6,
              overflow: "hidden",
              background: "var(--color-cream)",
              flexShrink: 0,
            }}
          >
            <img
              src={src}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {/* Set main */}
            <button
              aria-label="Главное фото"
              onClick={() => handleSetMain(img)}
              style={{
                position: "absolute",
                top: 3,
                left: 3,
                background: img.is_main ? "var(--color-ink)" : "rgba(255,255,255,0.82)",
                color: img.is_main ? "var(--color-cream)" : "var(--color-ink)",
                border: "none",
                borderRadius: 3,
                width: 22,
                height: 22,
                cursor: "pointer",
                fontFamily: "var(--font-geist-sans)",
                fontSize: 13,
                lineHeight: 1,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ★
            </button>
            {/* Delete */}
            <button
              aria-label="Удалить фото"
              onClick={() => handleDelete(img)}
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                background: "rgba(255,255,255,0.82)",
                color: "var(--color-ink)",
                border: "none",
                borderRadius: 3,
                width: 22,
                height: 22,
                cursor: "pointer",
                fontFamily: "var(--font-geist-sans)",
                fontSize: 13,
                lineHeight: 1,
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        );
      })}

      {/* Upload spinner tile */}
      {upload.isPending && (
        <div
          style={{
            width: 96,
            height: 96,
            border: "1px solid var(--color-hair)",
            borderRadius: 6,
            background: "var(--color-cream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-label="Загрузка"
        >
          <span
            className="mono"
            style={{ fontSize: 11, color: "var(--color-clay)", letterSpacing: "0.08em" }}
          >
            …
          </span>
        </div>
      )}

      {/* Drop-zone */}
      {showDropZone && !upload.isPending && (
        <label
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          style={{
            width: 96,
            height: 96,
            border: `1px dashed ${isDragOver ? "var(--color-ink)" : "var(--color-clay)"}`,
            borderRadius: 6,
            background: isDragOver ? "rgba(0,0,0,0.04)" : "var(--color-cream)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            transition: "border-color 0.15s, background 0.15s",
          }}
          aria-label="Добавить фото"
        >
          <span
            className="mono"
            style={{ fontSize: 18, color: "var(--color-clay)", lineHeight: 1 }}
          >
            +
          </span>
          <span
            className="mono"
            style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-clay)", marginTop: 4 }}
          >
            фото
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleInputChange}
            data-testid="photo-file-input"
          />
        </label>
      )}

      {/* Inline file error */}
      {fileError && (
        <div
          role="alert"
          className="mono"
          style={{
            width: "100%",
            fontSize: 11,
            letterSpacing: "0.08em",
            color: "var(--color-terracotta, #b94f40)",
            marginTop: 2,
          }}
        >
          {fileError}
        </div>
      )}

      {/* Drag-reorder is deferred (v1 ships set-main + delete; reorder is a follow-up). */}
    </div>
  );
}
