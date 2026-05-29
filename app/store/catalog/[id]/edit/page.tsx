import { ItemEditScreen } from "@/components/store/item-edit/ItemEditScreen";

// params is a Promise in this Next.js version — use async/await to resolve it.
export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ItemEditScreen itemId={id} />;
}
