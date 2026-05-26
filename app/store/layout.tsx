// Server component: gates /store/* by seller membership.
// cookies() is async in this Next.js version (>=15-RC) — must await.
// redirect() from next/navigation works in server components without "use server".
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ShopProvider } from "@/lib/shop-context";
import { ShopTabs } from "@/components/store/ShopTabs";
import { StoreSideNav } from "@/components/store/StoreSideNav";
import { BASES } from "@/lib/api/env";

async function fetchMe(cookieHeader: string): Promise<{ id: string } | null> {
  const res = await fetch(`${BASES.core}/me`, {
    headers: { Cookie: cookieHeader, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string }>;
}

async function fetchMyMemberships(cookieHeader: string): Promise<unknown[]> {
  const res = await fetch(`${BASES.core}/me/seller-memberships`, {
    headers: { Cookie: cookieHeader, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return [];
  return res.json() as Promise<unknown[]>;
}

type Shop = { id: string; slug: string; name: string };
type StoreInfo = { partner_id: string; shops: Shop[]; current_shop: Shop | null };

async function fetchStoreInfo(cookieHeader: string, userId: string): Promise<StoreInfo | null> {
  const res = await fetch(`${BASES.catalog}/me/store/info`, {
    headers: {
      Cookie: cookieHeader,
      "X-User-Id": userId,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<StoreInfo>;
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  // cookies() is async in this version — await required.
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join("; ");

  const me = await fetchMe(cookieHeader);
  if (!me?.id) redirect("/");

  const memberships = await fetchMyMemberships(cookieHeader);
  if (!memberships.length) redirect("/");

  const info = await fetchStoreInfo(cookieHeader, me.id);
  if (!info) redirect("/");

  return (
    <ShopProvider shops={info.shops}>
      <ShopTabs />
      <div style={{ display: "flex", minHeight: "calc(100vh - 80px)" }}>
        <StoreSideNav />
        <main style={{ flex: 1, padding: "32px 56px" }}>{children}</main>
      </div>
    </ShopProvider>
  );
}
