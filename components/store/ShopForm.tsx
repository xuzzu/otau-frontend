"use client";
import { useState } from "react";
import { useShopContext } from "@/lib/shop-context";
import { useAddShopPhoto, useDeleteShopPhoto, usePatchShop, useStoreInfo } from "@/lib/store-api/hooks";

export function ShopForm() {
  const { selectedShopId } = useShopContext();
  const info = useStoreInfo();
  const shop = info.data?.shops.find((s) => s.id === selectedShopId);
  const patch = usePatchShop(selectedShopId ?? "");
  const addPhoto = useAddShopPhoto(selectedShopId ?? "");
  const delPhoto = useDeleteShopPhoto(selectedShopId ?? "");
  const [name, setName] = useState(shop?.name ?? "");
  const [city, setCity] = useState((shop as any)?.city ?? "");
  const [address, setAddress] = useState((shop as any)?.address ?? "");
  const [photoUrl, setPhotoUrl] = useState("");

  if (!shop) return <p>…</p>;
  return (
    <div style={{ maxWidth: 520 }}>
      <Row label="Name"><input value={name} onChange={(e) => setName(e.target.value)} /></Row>
      <Row label="City"><input value={city} onChange={(e) => setCity(e.target.value)} /></Row>
      <Row label="Address"><input value={address} onChange={(e) => setAddress(e.target.value)} /></Row>
      <button onClick={() => patch.mutate({ name, city, address })} style={{ padding: "6px 14px", marginTop: 8, background: "var(--color-ink)", color: "var(--color-paper)" }}>Save shop info</button>

      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-rust)" }}>Photos</div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input placeholder="https://photo-url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
          <button onClick={() => { if (photoUrl) { addPhoto.mutate({ url: photoUrl }); setPhotoUrl(""); } }}>Add</button>
        </div>
      </div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 8, padding: "4px 0" }}><span style={{ fontSize: 11, color: "var(--color-rust)" }}>{label}</span>{children}</div>;
}
