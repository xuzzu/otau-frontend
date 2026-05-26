"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setCurrentShopId } from "./shop-id";

type Shop = { id: string; slug: string; name: string };
type Ctx = {
  shops: Shop[];
  selectedShopId: string | null;
  selectShop: (id: string) => void;
};

const ShopContext = createContext<Ctx | null>(null);
const COOKIE_NAME = "store_shop_id";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function ShopProvider({ shops, children }: { shops: Shop[]; children: React.ReactNode }) {
  const qc = useQueryClient();
  const [selectedShopId, setSelected] = useState<string | null>(() => {
    const fromCookie = readCookie(COOKIE_NAME);
    if (fromCookie && shops.some((s) => s.id === fromCookie)) return fromCookie;
    return shops[0]?.id ?? null;
  });

  useEffect(() => {
    setCurrentShopId(selectedShopId);
  }, [selectedShopId]);

  const selectShop = useCallback(
    (id: string) => {
      setSelected(id);
      writeCookie(COOKIE_NAME, id);
      qc.invalidateQueries({ queryKey: ["store"] });
    },
    [qc],
  );

  const value = useMemo(() => ({ shops, selectedShopId, selectShop }), [shops, selectedShopId, selectShop]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShopContext(): Ctx {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShopContext must be used inside <ShopProvider>");
  return ctx;
}
