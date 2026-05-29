"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useItemEditForm } from "./useItemEditForm";

type Ctx = ReturnType<typeof useItemEditForm>;
const ItemEditCtx = createContext<Ctx | null>(null);

export function ItemEditProvider({ itemId, onCreated, children }: {
  itemId?: string; onCreated?: (id: string) => void; children: ReactNode;
}) {
  const form = useItemEditForm(itemId, { onCreated });
  return <ItemEditCtx.Provider value={form}>{children}</ItemEditCtx.Provider>;
}

export function useItemEdit(): Ctx {
  const v = useContext(ItemEditCtx);
  if (!v) throw new Error("useItemEdit must be used within ItemEditProvider");
  return v;
}
