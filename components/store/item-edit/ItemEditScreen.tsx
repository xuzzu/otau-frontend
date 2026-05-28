"use client";

import { SellerTopBar } from "../console/SellerTopBar";
import {
  SectionRail, PhotosSection, BasicsSection, PriceStockSection, DimensionsSection,
  MaterialsColorsSection, CategorySection, StudioARSection, DeliverySection, RightRail,
} from "./sections";

export function ItemEditScreen() {
  const right = (
    <>
      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#3F4A39", display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase" }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: "#3F4A39" }} />
        All changes saved · 14:08
      </span>
      <div style={{ height: 22, width: 1, background: "#E8DFD0" }} />
      <button className="btn ghost" style={{ padding: "10px 16px", fontSize: 12 }}>Preview</button>
      <button className="btn ghost" style={{ padding: "10px 16px", fontSize: 12 }}>Save as draft</button>
      <button className="btn clay" style={{ padding: "11px 18px", fontSize: 12 }}>
        Save &amp; publish <span className="arrow">→</span>
      </button>
    </>
  );

  return (
    <>
      <SellerTopBar
        crumbs={["Sellers", "Mebel Astana", "Catalog", "OT‑3127"]}
        title={<>Klemo modular sofa<span className="it">, 3‑seat</span></>}
        subtitle="Editing · live"
        right={right}
      />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <SectionRail />
        <div style={{ flex: 1, minWidth: 0, overflow: "auto", padding: "24px 32px 80px" }}>
          <PhotosSection />
          <BasicsSection />
          <PriceStockSection />
          <DimensionsSection />
          <MaterialsColorsSection />
          <CategorySection />
          <StudioARSection />
          <DeliverySection />
        </div>
        <RightRail />
      </div>
    </>
  );
}
