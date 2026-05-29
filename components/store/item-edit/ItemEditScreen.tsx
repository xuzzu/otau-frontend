"use client";

import { ItemEditProvider, useItemEdit } from "./context";
import { SellerTopBar } from "../console/SellerTopBar";
import {
  SectionRail, PhotosSection, BasicsSection, PriceStockSection, DimensionsSection,
  MaterialsColorsSection, CategorySection, StudioARSection, DeliverySection, RightRail,
} from "./sections";

// ——— Header content inside the provider ———
// Must be a child of ItemEditProvider so it can call useItemEdit().
function HeaderContent({ onPublish }: { onPublish: () => void }) {
  const { saveStatus } = useItemEdit();
  const indicator =
    saveStatus === "saving" ? { dot: "#D8A05B", label: "Saving…" }
    : saveStatus === "saved" ? { dot: "#3F4A39", label: "All changes saved" }
    : saveStatus === "error" ? { dot: "#B5532E", label: "Save error — retry" }
    : null;

  return (
    <>
      {indicator && (
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: indicator.dot, display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase" }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: indicator.dot }} />
          {indicator.label}
        </span>
      )}
      <div style={{ height: 22, width: 1, background: "#E8DFD0" }} />
      <button className="btn ghost" style={{ padding: "10px 16px", fontSize: 12 }} disabled>Preview</button>
      <button className="btn ghost" style={{ padding: "10px 16px", fontSize: 12 }}>Save as draft</button>
      <button className="btn clay" style={{ padding: "11px 18px", fontSize: 12 }} onClick={onPublish}>
        Save &amp; publish <span className="arrow">→</span>
      </button>
    </>
  );
}

function HeaderTitle() {
  const { form } = useItemEdit();
  return <>{form.name || <span className="it" style={{ color: "#9A8A72" }}>New item</span>}</>;
}

function ItemEditBody({ onPublish }: { onPublish: () => void }) {
  const right = <HeaderContent onPublish={onPublish} />;

  return (
    <>
      <SellerTopBar
        crumbs={["Sellers", "Catalog"]}
        title={<HeaderTitle />}
        subtitle="Editing"
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

export function ItemEditScreen({ itemId, onCreated }: { itemId?: string; onCreated?: (id: string) => void }) {
  return (
    <ItemEditProvider itemId={itemId} onCreated={onCreated}>
      <ItemEditBodyWithPublish />
    </ItemEditProvider>
  );
}

// Inner wrapper that can call useItemEdit() to get publish()
function ItemEditBodyWithPublish() {
  const { publish } = useItemEdit();
  return <ItemEditBody onPublish={publish} />;
}
