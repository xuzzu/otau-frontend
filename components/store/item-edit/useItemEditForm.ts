"use client";
import { useEffect, useRef, useState } from "react";
import { useStoreItem, usePatchItem } from "@/lib/store-api/hooks";
import type { StoreItem } from "@/lib/store-api/types";

export type ItemForm = {
  name: string;
  brand: string;
  description: Record<string, string>;
  slug: string;
  category_id: string;
  room_target_id: string | null;
  dims: { width_cm?: number; depth_cm?: number; height_cm?: number };
  weight_kg: number | null;
  style_ids: string[];
  material_ids: string[];
  finish_material_ids: string[];
};

const EMPTY: ItemForm = {
  name: "", brand: "", description: {}, slug: "", category_id: "",
  room_target_id: null, dims: {}, weight_kg: null,
  style_ids: [], material_ids: [], finish_material_ids: [],
};

function fromItem(it: StoreItem): ItemForm {
  return {
    name: it.name ?? "", brand: it.brand ?? "", description: it.description ?? {},
    slug: it.slug ?? "", category_id: it.category_id ?? "", room_target_id: it.room_target_id ?? null,
    dims: (it.dims as ItemForm["dims"]) ?? {}, weight_kg: it.weight_kg ?? null,
    style_ids: it.style_ids ?? [], material_ids: it.material_ids ?? [],
    finish_material_ids: it.finish_material_ids ?? [],
  };
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useItemEditForm(itemId?: string) {
  const query = useStoreItem(itemId);
  const patch = usePatchItem(itemId ?? "");
  const [form, setForm] = useState<ItemForm>(EMPTY);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const seeded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Seed once from the loaded item.
  useEffect(() => {
    if (itemId && query.data && !seeded.current) {
      seeded.current = true;
      setForm(fromItem(query.data));
    }
  }, [itemId, query.data]);

  function setField<K extends keyof ItemForm>(key: K, value: ItemForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (!itemId) return; // create-mode persistence handled in Task 6
    setSaveStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      patch.mutate({ [key]: value } as Record<string, unknown>, {
        onSuccess: () => setSaveStatus("saved"),
        onError: () => setSaveStatus("error"),
      });
    }, 700);
  }

  return { form, setField, saveStatus, loading: query.isLoading, item: query.data };
}
