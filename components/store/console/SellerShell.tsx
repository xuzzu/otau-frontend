import type { ReactNode } from "react";
import { SellerSidebar } from "./SellerSidebar";

export function SellerShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
      <SellerSidebar />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
