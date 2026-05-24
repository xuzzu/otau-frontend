// Compatibility shim — re-exports from the per-service catalog client.
// Prefer importing from "@/lib/api/catalog" directly in new code.

import { getPartnerBySlug, listPartners } from "./api/catalog";
import type { Partner } from "./api/types";

export type Showroom = Partner;
export { listPartners as fetchShowrooms, getPartnerBySlug as findShowroom };
