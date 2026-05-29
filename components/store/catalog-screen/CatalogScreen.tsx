"use client";

import Link from "next/link";
import { SellerTopBar } from "../console/SellerTopBar";
import { SellerSearch } from "../console/atoms";
import { CatalogFilterRail, CatalogToolbar, CatalogTable, CatalogFooter } from "./parts";

export function CatalogScreen() {
  const right = (
    <>
      <SellerSearch placeholder="Search 218 listings…" width={300} />
      <button className="btn ghost" style={{ padding: "10px 16px", fontSize: 12 }}>↑ Import CSV</button>
      <Link href="/store/catalog/new" className="btn clay" style={{ padding: "11px 18px", fontSize: 12, textDecoration: "none" }}>
        <span style={{ fontSize: 14 }}>+</span> New listing
      </Link>
    </>
  );

  return (
    <>
      <SellerTopBar
        crumbs={["Sellers", "Mebel Astana", "Catalog"]}
        title={<>Catalog <span className="it">·</span> <span className="num">218</span></>}
        subtitle="3 awaiting review · 4 drafts · 2 low stock"
        right={right}
      />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <CatalogFilterRail />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <CatalogToolbar />
          <CatalogTable />
          <CatalogFooter />
        </div>
      </div>
    </>
  );
}
