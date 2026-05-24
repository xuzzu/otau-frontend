import { notFound } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getItemBySlug } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: slug } = await params;
  try {
    const product = await getItemBySlug(slug);
    return (
      <>
        <TopNav />
        <ProductDetail product={product} />
      </>
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
