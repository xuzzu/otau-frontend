"use client";
import { useEffect, useRef, useState } from "react";
import { useStoreItem, usePatchItem, useCreateItem, usePublishItem } from "@/lib/store-api/hooks";
import type { StoreItem } from "@/lib/store-api/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export function useItemEditForm(itemId?: string, opts?: { onCreated?: (id: string) => void }) {
  const query = useStoreItem(itemId);
  const patch = usePatchItem(itemId ?? "");
  const create = useCreateItem();
  const publish = usePublishItem(itemId ?? "");
  const [form, setForm] = useState<ItemForm>(EMPTY);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [publishMissing, setPublishMissing] = useState<string[]>([]);
  const seeded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creating = useRef(false);

  // Seed once from the loaded item.
  useEffect(() => {
    if (itemId && query.data && !seeded.current) {
      seeded.current = true;
      setForm(fromItem(query.data));
    }
  }, [itemId, query.data]);

  // Draft-first create: once name + category are set in create mode.
  useEffect(() => {
    if (itemId || creating.current) return;
    if (form.name.trim().length >= 2 && form.category_id) {
      creating.current = true;
      const t = setTimeout(() => {
        create.mutate(
          {
            slug: slugify(form.name),
            name: form.name,
            category_id: form.category_id,
            brand: form.brand || null,
            description: form.description,
            room_target_id: form.room_target_id ?? undefined,
            dims: form.dims,
            weight_kg: form.weight_kg ?? undefined,
            style_ids: form.style_ids,
            material_ids: form.material_ids,
            finish_material_ids: form.finish_material_ids,
          },
          {
            onSuccess: (it) => opts?.onCreated?.(it.id),
            onError: () => { creating.current = false; },
          },
        );
      }, 700);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, form.name, form.category_id]);

  function setField<K extends keyof ItemForm>(key: K, value: ItemForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (!itemId) return; // create-mode: draft created via the useEffect above
    setSaveStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      patch.mutate({ [key]: value } as Record<string, unknown>, {
        onSuccess: () => setSaveStatus("saved"),
        onError: () => setSaveStatus("error"),
      });
    }, 700);
  }

  async function doPublish(): Promise<boolean> {
    setPublishMissing([]);
    try {
      await publish.mutateAsync();
      return true;
    } catch (e) {
      const body = (e as { body?: string }).body;
      try {
        const j = JSON.parse(body ?? "{}");
        setPublishMissing(j.detail?.missing ?? []);
      } catch {
        // ignore parse error
      }
      return false;
    }
  }

  return { form, setField, saveStatus, loading: query.isLoading, item: query.data, publish: doPublish, publishMissing };
}
