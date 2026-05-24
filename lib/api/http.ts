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

function buildHeaders(extra: HeadersInit | undefined): Headers {
  const h = new Headers({ Accept: "application/json" });
  if (extra) new Headers(extra).forEach((v, k) => h.set(k, v));
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
    headers: buildHeaders(init?.headers),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, path, body);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}
