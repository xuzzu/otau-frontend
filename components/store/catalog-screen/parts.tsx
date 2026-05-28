"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Photo } from "../console/atoms";
import {
  ROWS, QUICK_VIEWS, CATEGORY_FILTERS, MATERIAL_FILTERS,
  type CatalogRow, type CatalogStatus,
} from "../_fixtures/catalog";

// ——— Left filter rail ———
export function CatalogFilterRail() {
  const [active, setActive] = useState("All listings");
  return (
    <aside style={{ width: 220, padding: "20px 22px", borderRight: "1px solid #E8DFD0", flexShrink: 0, background: "#F4EFE6", overflowY: "hidden" }}>
      <div className="label">Quick views</div>
      <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
        {QUICK_VIEWS.map((q) => (
          <FilterLink key={q.label} label={q.label} count={q.count} tone={q.tone} active={active === q.label} onClick={() => setActive(q.label)} />
        ))}
      </div>

      <hr className="hr-hair" style={{ margin: "20px 0 18px" }} />

      <div className="label">Filter</div>

      <FilterGroup title="Category">
        {CATEGORY_FILTERS.map((f) => <Check key={f.label} {...f} />)}
      </FilterGroup>

      <FilterGroup title="Material">
        {MATERIAL_FILTERS.map((f) => <Check key={f.label} {...f} />)}
      </FilterGroup>

      <FilterGroup title="Price · KZT">
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#5B5043", display: "flex", justifyContent: "space-between" }}>
          <span>₸ 120k</span><span>—</span><span>₸ 1.4M</span>
        </div>
        <div style={{ marginTop: 6, height: 4, background: "#E8DFD0", position: "relative" }}>
          <div style={{ position: "absolute", left: "12%", right: "22%", top: 0, bottom: 0, background: "#1A1612" }} />
          <div style={{ position: "absolute", left: "12%", top: -3, width: 10, height: 10, background: "#FBF8F2", border: "1.5px solid #1A1612" }} />
          <div style={{ position: "absolute", right: "22%", top: -3, width: 10, height: 10, background: "#FBF8F2", border: "1.5px solid #1A1612" }} />
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterLink({ label, count, tone = "#1A1612", active, onClick }: { label: string; count: number; tone?: string; active?: boolean; onClick?: () => void }) {
  return (
    <a onClick={onClick} style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "7px 10px", fontSize: 12, cursor: "pointer",
      background: active ? "#FBF8F2" : "transparent",
      border: "1px solid", borderColor: active ? "#E8DFD0" : "transparent",
      color: "#1A1612",
    }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: tone }} />
        {label}
      </span>
      <span className="mono" style={{ fontSize: 10, color: "#9A8A72" }}>{count}</span>
    </a>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#1A1612", textTransform: "uppercase" }}>{title}</div>
        <span style={{ fontSize: 11, color: "#9A8A72" }}>−</span>
      </div>
      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
        {children}
      </div>
    </div>
  );
}

function Check({ label, count, on }: { label: string; count?: number; on?: boolean }) {
  const [checked, setChecked] = useState(!!on);
  return (
    <label onClick={() => setChecked((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", color: "#1A1612" }}>
      <span style={{
        width: 12, height: 12, border: "1px solid #1A1612",
        background: checked ? "#1A1612" : "#FBF8F2",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: "#FBF8F2", fontSize: 9, lineHeight: 1, flexShrink: 0,
      }}>{checked ? "✓" : ""}</span>
      <span style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{label}</span>
        {count != null && <span className="mono" style={{ fontSize: 10, color: "#9A8A72", letterSpacing: ".04em" }}>{count}</span>}
      </span>
    </label>
  );
}

// ——— Toolbar above table ———
export function CatalogToolbar() {
  const [view, setView] = useState<"table" | "grid">("table");
  return (
    <div style={{ padding: "14px 28px", borderBottom: "1px solid #E8DFD0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, background: "#F4EFE6", flex: "0 0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="chip solid" style={{ fontSize: 10 }}>Sofas ×</span>
        <span className="chip solid" style={{ fontSize: 10 }}>Linen + Oak ×</span>
        <span className="chip" style={{ fontSize: 10 }}>+ Add filter</span>
        <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", marginLeft: 8 }}>142 of 218 shown</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span className="label">Sort</span>
        <span style={{ fontSize: 12 }}>Last edited ↓</span>
        <div style={{ height: 18, width: 1, background: "#E8DFD0" }} />
        <div style={{ display: "flex", gap: 2, padding: 3, background: "#FBF8F2", border: "1px solid #E8DFD0" }}>
          <span onClick={() => setView("table")} className={view === "table" ? "chip solid" : "chip"} style={{ fontSize: 10, border: view === "table" ? "1px solid #1A1612" : "none", cursor: "pointer" }}>Table</span>
          <span onClick={() => setView("grid")} className={view === "grid" ? "chip solid" : "chip"} style={{ fontSize: 10, border: view === "grid" ? "1px solid #1A1612" : "none", cursor: "pointer" }}>Grid</span>
        </div>
      </div>
    </div>
  );
}

// ——— Table ———
export function CatalogTable() {
  const selectedCount = ROWS.filter((r) => r.sel).length;
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Bulk action bar */}
      <div style={{ padding: "10px 28px", background: "#1A1612", color: "#FBF8F2", display: "flex", alignItems: "center", gap: 18, flex: "0 0 auto" }}>
        <span style={{ width: 16, height: 16, background: "#FBF8F2", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#1A1612", fontSize: 11 }}>−</span>
        <span className="mono" style={{ fontSize: 11, letterSpacing: "0.10em" }}>{selectedCount} SELECTED</span>
        <div style={{ height: 16, width: 1, background: "rgba(251,248,242,.25)" }} />
        <BulkAct label="Publish" />
        <BulkAct label="Hide" />
        <BulkAct label="Duplicate" />
        <BulkAct label="Edit prices" />
        <BulkAct label="Add to scene…" />
        <span style={{ marginLeft: "auto", color: "#C9694A", fontSize: 12, cursor: "pointer" }}>× Delete</span>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "28px 56px 1fr 130px 110px 100px 100px 90px 70px 60px", padding: "10px 28px", borderBottom: "1px solid #E8DFD0", gap: 14, background: "#FBF8F2", flex: "0 0 auto" }}>
        <Hd></Hd>
        <Hd></Hd>
        <Hd>Item</Hd>
        <Hd>Category</Hd>
        <Hd>Status</Hd>
        <Hd r>Price · ₸</Hd>
        <Hd r>Stock</Hd>
        <Hd r>Views wk</Hd>
        <Hd r>Sold</Hd>
        <Hd></Hd>
      </div>

      {/* Rows */}
      <div style={{ overflow: "auto", flex: 1, minHeight: 0 }}>
        {ROWS.map((r) => <Row key={r.id} r={r} />)}
      </div>
    </div>
  );
}

function Hd({ children, r }: { children?: ReactNode; r?: boolean }) {
  return (
    <div className="mono" style={{ fontSize: 10, letterSpacing: "0.12em", color: "#9A8A72", textTransform: "uppercase", textAlign: r ? "right" : "left" }}>
      {children}
    </div>
  );
}

function BulkAct({ label }: { label: string }) {
  return <span style={{ fontSize: 12, color: "#FBF8F2", cursor: "pointer", opacity: 0.85 }}>{label}</span>;
}

const STATUS_MAP: Record<CatalogStatus, { c: string; t: string }> = {
  live: { c: "#3F4A39", t: "Live" },
  low: { c: "#D8A05B", t: "Low stock" },
  oos: { c: "#B5532E", t: "Out of stock" },
  draft: { c: "#9A8A72", t: "Draft" },
};

function Row({ r }: { r: CatalogRow }) {
  const status = STATUS_MAP[r.status];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "28px 56px 1fr 130px 110px 100px 100px 90px 70px 60px", padding: "12px 28px", borderBottom: "1px solid #E8DFD0", gap: 14, alignItems: "center", background: r.sel ? "#FBF8F2" : "transparent" }}>
      <span style={{ width: 14, height: 14, border: "1px solid #1A1612", background: r.sel ? "#1A1612" : "#FBF8F2", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FBF8F2", fontSize: 9, lineHeight: 1 }}>{r.sel ? "✓" : ""}</span>
      <Photo src={r.img} style={{ width: 48, height: 48 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.2, letterSpacing: "-0.005em" }}>{r.name}</div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: "0.08em", color: "#9A8A72", marginTop: 4, textTransform: "uppercase" }}>{r.sku} · {r.dims} cm</div>
      </div>
      <div style={{ fontSize: 12, color: "#5B5043" }}>{r.cat}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: status.c }} />
        {status.t}
      </div>
      <div className="num" style={{ textAlign: "right", fontSize: 13 }}>{r.price}</div>
      <div className="num" style={{ textAlign: "right", fontSize: 13, color: r.status === "oos" ? "#B5532E" : r.status === "low" ? "#D8A05B" : "#1A1612" }}>{r.stock}</div>
      <div className="num" style={{ textAlign: "right", fontSize: 13, color: "#5B5043" }}>{r.views || "—"}</div>
      <div className="num" style={{ textAlign: "right", fontSize: 13, color: "#5B5043" }}>{r.sold || "—"}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
        <RowBtn href={`/store/catalog/${r.id}/edit`}>✎</RowBtn>
        <RowBtn>⋯</RowBtn>
      </div>
    </div>
  );
}

function RowBtn({ children, href }: { children: ReactNode; href?: string }) {
  const style: CSSProperties = {
    width: 26, height: 26, background: "#FBF8F2", border: "1px solid #E8DFD0",
    cursor: "pointer", fontSize: 12, color: "#1A1612",
    display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none",
  };
  if (href) return <Link href={href} style={style}>{children}</Link>;
  return <button style={style}>{children}</button>;
}

// ——— Footer ———
export function CatalogFooter() {
  return (
    <div style={{ padding: "12px 28px", borderTop: "1px solid #E8DFD0", background: "#FBF8F2", display: "flex", alignItems: "center", justifyContent: "space-between", flex: "0 0 auto" }}>
      <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72", textTransform: "uppercase" }}>Showing 1–9 of 142</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <PageBtn>‹</PageBtn>
        <PageBtn active>1</PageBtn>
        <PageBtn>2</PageBtn>
        <PageBtn>3</PageBtn>
        <span className="mono" style={{ fontSize: 10, color: "#9A8A72" }}>…</span>
        <PageBtn>16</PageBtn>
        <PageBtn>›</PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <button style={{
      minWidth: 26, height: 26, padding: "0 6px",
      background: active ? "#1A1612" : "#FBF8F2",
      color: active ? "#FBF8F2" : "#1A1612",
      border: "1px solid", borderColor: active ? "#1A1612" : "#E8DFD0",
      fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
    }}>{children}</button>
  );
}
