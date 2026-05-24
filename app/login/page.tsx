"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TopNav } from "@/components/nav/TopNav";
import { LoginForm } from "@/components/auth/LoginForm";
import { useMe } from "@/lib/hooks";

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") ?? "/";
  const me = useMe();

  useEffect(() => {
    if (me.data?.status === "active") {
      router.replace(next);
    }
  }, [me.data?.status, next, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--color-cream)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopNav />
      <section
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 56,
        }}
      >
        <LoginForm onSuccess={() => router.replace(next)} />
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="label" style={{ padding: 56 }}>…</div>}>
      <LoginInner />
    </Suspense>
  );
}
