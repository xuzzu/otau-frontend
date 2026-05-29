"use client";

import { ItemEditProvider, useItemEdit } from "./context";
import { SellerTopBar } from "../console/SellerTopBar";
import { useT } from "@/lib/i18n";
import {
  SectionRail, PhotosSection, BasicsSection, PriceStockSection, DimensionsSection,
  MaterialsColorsSection, CategorySection, StudioARSection, DeliverySection, RightRail,
} from "./sections";

// ——— Header content inside the provider ———
// Must be a child of ItemEditProvider so it can call useItemEdit().
function HeaderContent({ onPublish }: { onPublish: () => void }) {
  const { saveStatus } = useItemEdit();
  const { t } = useT();
  const indicator =
    saveStatus === "saving" ? { dot: "#D8A05B", label: t("itemEdit.saving") }
    : saveStatus === "saved" ? { dot: "#3F4A39", label: t("itemEdit.saved") }
    : saveStatus === "error" ? { dot: "#B5532E", label: t("itemEdit.save_error") }
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
      <button className="btn ghost" style={{ padding: "10px 16px", fontSize: 12 }} disabled>{t("itemEdit.preview")}</button>
      <button className="btn ghost" style={{ padding: "10px 16px", fontSize: 12 }}>{t("itemEdit.save_draft")}</button>
      <button className="btn clay" style={{ padding: "11px 18px", fontSize: 12 }} onClick={onPublish}>
        {t("itemEdit.save_publish")} <span className="arrow">→</span>
      </button>
    </>
  );
}

function HeaderTitle() {
  const { form } = useItemEdit();
  const { t } = useT();
  return <>{form.name || <span className="it" style={{ color: "#9A8A72" }}>{t("itemEdit.label.new_item")}</span>}</>;
}

function ItemEditBody({ onPublish }: { onPublish: () => void }) {
  const { t } = useT();
  const right = <HeaderContent onPublish={onPublish} />;

  return (
    <>
      <SellerTopBar
        crumbs={[t("itemEdit.crumb.sellers"), t("itemEdit.crumb.catalog")]}
        title={<HeaderTitle />}
        subtitle={t("itemEdit.label.editing")}
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
