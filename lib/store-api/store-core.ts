import { BASES } from "@/lib/api/env";
import { apiFetch } from "@/lib/api/http";
import type { DashboardData } from "./types";

const B = BASES.core;

export const getStoreDashboard = (shop_id: string) =>
  apiFetch<DashboardData>(B, `/me/store/dashboard?shop_id=${encodeURIComponent(shop_id)}`);
