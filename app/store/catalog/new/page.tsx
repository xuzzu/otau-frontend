"use client";

import { useRouter } from "next/navigation";
import { ItemEditScreen } from "@/components/store/item-edit/ItemEditScreen";

export default function NewItemPage() {
  const router = useRouter();
  return (
    <ItemEditScreen
      onCreated={(id) => router.replace(`/store/catalog/${id}/edit`)}
    />
  );
}
