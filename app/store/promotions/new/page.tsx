"use client";
import { useSearchParams } from "next/navigation";
import { PromotionForm } from "@/components/store/PromotionForm";

export default function NewPromotionPage() {
  const sp = useSearchParams();
  const item_id = sp.get("item_id") ?? undefined;
  return <PromotionForm mode="create" initial={item_id ? { item_id } : undefined} />;
}
