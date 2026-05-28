"use client";

import { SellerTopBar } from "../console/SellerTopBar";
import { SellerSearch, IconBtn } from "../console/atoms";
import { Card, Kpi, RevenueChart, TopItem, TodoRow, Inquiry } from "./parts";
import { KPIS, REVENUE_WEEKS, TOP_ITEMS, TODOS, INQUIRIES } from "../_fixtures/overview";

export function OverviewScreen() {
  const right = (
    <>
      <SellerSearch placeholder="Search listings, orders, buyers…" width={300} />
      <IconBtn badge={14}>✉</IconBtn>
      <IconBtn>⚙</IconBtn>
      <button className="btn clay" style={{ padding: "11px 18px", fontSize: 12 }}>
        <span style={{ fontSize: 14 }}>+</span> New listing
      </button>
    </>
  );

  return (
    <>
      <SellerTopBar
        crumbs={["Sellers", "Mebel Astana", "Overview"]}
        title={<><span>Good evening,</span> <span className="it">Bauyrzhan.</span></>}
        subtitle="Thursday · 28 May · Almaty"
        right={right}
      />

      <div style={{ padding: "20px 36px 36px", flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Editorial strip */}
        <div style={{ padding: "14px 18px", background: "#1A1612", color: "#FBF8F2", display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 30, height: 30, borderRadius: 999, border: "1px solid #FBF8F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>◇</span>
            <div className="serif it" style={{ fontSize: 18, lineHeight: 1 }}>
              You&apos;re in the top 12 % of sellers this month.
            </div>
          </div>
          <div style={{ height: 22, width: 1, background: "rgba(251,248,242,.2)" }} />
          <div className="mono" style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.7 }}>
            Otaū grades you on responsiveness, photography, returns, and rating.
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", opacity: 0.7 }}>SEE RUBRIC</span>
            <span style={{ fontFamily: "serif", fontSize: 16 }}>→</span>
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
          {KPIS.map((k, i) => <Kpi key={i} {...k} />)}
        </div>

        {/* Body grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 16, flex: 1, minHeight: 0 }}>
          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
            <Card style={{ padding: "20px 22px", flex: "0 0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="label">Revenue · last 12 weeks</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                    <span className="serif num" style={{ fontSize: 32, letterSpacing: "-0.01em" }}>₸62.4M</span>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#3F4A39" }}>+18% vs Q1</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, padding: 3, background: "#F4EFE6", border: "1px solid #E8DFD0" }}>
                  {["Weeks", "Months", "YTD"].map((tab, i) => (
                    <span key={tab} className={i === 0 ? "chip solid" : "chip"} style={{ border: i === 0 ? "1px solid #1A1612" : "none", fontSize: 10, padding: "5px 11px" }}>{tab}</span>
                  ))}
                </div>
              </div>
              <RevenueChart weeks={REVENUE_WEEKS} />
            </Card>

            <Card style={{ padding: "18px 22px 20px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="label">Top performing · this week</div>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#B5532E", textTransform: "uppercase" }}>See all 218 →</span>
              </div>
              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, flex: 1, minHeight: 0 }}>
                {TOP_ITEMS.map((it, i) => <TopItem key={i} {...it} />)}
              </div>
            </Card>
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 0 }}>
            <Card style={{ padding: "18px 22px", flex: "0 0 auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="label">To do · today</div>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#9A8A72" }}>6 items</span>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column" }}>
                {TODOS.map((td, i) => <TodoRow key={i} {...td} />)}
              </div>
            </Card>

            <Card style={{ padding: "18px 22px 22px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="label">Recent inquiries</div>
                <span className="mono" style={{ fontSize: 10, letterSpacing: "0.10em", color: "#B5532E", textTransform: "uppercase" }}>Inbox →</span>
              </div>
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, flex: 1, minHeight: 0, overflow: "hidden" }}>
                {INQUIRIES.map((q, i) => <Inquiry key={i} {...q} />)}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
