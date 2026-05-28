"use client";
import { use } from "react";
import { useStoreItem } from "@/lib/store-api/hooks";
import { ItemForm } from "@/components/store/item-form/ItemForm";

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useStoreItem(id);
  if (isLoading) return <p>…</p>;
  if (!data) return <p>Not found.</p>;
  return <ItemForm mode="edit" item={data} />;
}
