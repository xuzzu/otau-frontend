import { notFound } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getItemBySlug } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/http";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id: slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  try {
    const product = await getItemBySlug(slug, { preview: isPreview });
    return (
      <>
        <TopNav />
        {isPreview && (
          <div style={{ background: "#5a3c54", color: "#FBF8F2", padding: "6px 12px", fontSize: "11px" }}>
            Preview · not yet visible to customers
          </div>
        )}
        <ProductDetail product={product} />
      </>
    );
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}
