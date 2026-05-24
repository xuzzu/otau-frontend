"use client";

import { useEffect } from "react";
import { useMe } from "@/lib/hooks";
import { setCurrentUserId } from "./identity";

/** Mirrors useMe().data.id into the module-level identity ref so that
 * http.ts can attach X-User-Id on calls to services that don't share
 * Core's cookie (currently generation-service). Mount once near the
 * QueryClientProvider root. */
export function IdentitySync() {
  const me = useMe();
  useEffect(() => {
    setCurrentUserId(me.data?.id ?? null);
  }, [me.data?.id]);
  return null;
}
