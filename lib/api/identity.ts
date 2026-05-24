// Module-level current-user ref. The backend's generation service (and any
// future /me-style endpoint that doesn't share Core's cookie) reads
// `X-User-Id` as a stub for the authenticated caller. The browser knows
// its user id from useMe() — we plumb that into http.ts via this module
// so api fetchers don't each need to thread it through.
//
// This is the dev-stub mirror of the backend's `X-User-Id` header. Replace
// with a Core-issued JWT or session-shared cookie when auth hardens.

let currentUserId: string | null = null;

export function setCurrentUserId(id: string | null): void {
  currentUserId = id;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}
