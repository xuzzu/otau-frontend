// Module-level current-shop ref. Same dev-stub pattern as identity.ts.
// http.ts reads this to inject X-Shop-Id on /me/store/* requests.
let currentShopId: string | null = null;
export function setCurrentShopId(id: string | null): void { currentShopId = id; }
export function getCurrentShopId(): string | null { return currentShopId; }
