import { getCurrentUserId } from "./identity";
import { getCurrentShopId } from "@/lib/shop-id";

export class ApiError extends Error {
  readonly status: number;
  readonly path: string;
  readonly body: string;

  constructor(status: number, path: string, body: string) {
    super(`[api] ${status} on ${path}: ${body.slice(0, 200)}`);
    this.name = "ApiError";
    this.status = status;
    this.path = path;
    this.body = body;
  }
}

function buildHeaders(extra: HeadersInit | undefined, path: string): Headers {
  const h = new Headers({ Accept: "application/json" });
  if (extra) new Headers(extra).forEach((v, k) => h.set(k, v));
  const uid = getCurrentUserId();
  if (uid && !h.has("X-User-Id")) h.set("X-User-Id", uid);
  if (path.startsWith("/me/store")) {
    const sid = getCurrentShopId();
    if (sid && !h.has("X-Shop-Id")) h.set("X-Shop-Id", sid);
  }
  return h;
}

export async function apiFetch<T>(
  base: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init?.headers, path),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, path, body);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}
