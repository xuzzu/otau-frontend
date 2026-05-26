"use client";
import { use } from "react";
import { usePromotions } from "@/lib/store-api/hooks";
import { PromotionForm } from "@/components/store/PromotionForm";

export default function EditPromotionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data } = usePromotions("all");
  const promo = data?.find((p) => p.id === id);
  if (!promo) return <p>…</p>;
  return <PromotionForm mode="edit" promotion={promo} />;
}
