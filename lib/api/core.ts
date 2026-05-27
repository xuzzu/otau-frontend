import { BASES } from "./env";
import { apiFetch } from "./http";
import type {
  Cart,
  CartItem,
  JournalArticle,
  Like,
  LoginBody,
  RegisterBody,
  SellerMembership,
  ShowroomVisitRequest,
  User,
} from "./types";

const B = BASES.core;

// --- Sessions ---

export const sessionsRegister = (body: RegisterBody) =>
  apiFetch<User>(B, `/sessions/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const sessionsLogin = (body: LoginBody) =>
  apiFetch<User>(B, `/sessions/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const sessionsLogout = () =>
  apiFetch<null>(B, `/sessions/logout`, { method: "POST" });

export const sessionsExtend = () =>
  apiFetch<null>(B, `/sessions/extend`, { method: "POST" });

// --- Me ---

export const getMe = () => apiFetch<User>(B, `/me`);

export const listMyMemberships = () =>
  apiFetch<SellerMembership[]>(B, `/me/seller-memberships`);

// --- Cart ---

export const getMyCart = () => apiFetch<Cart>(B, `/me/cart`);

export const addCartItem = (body: {
  variant_id: string;
  item_id: string;
  shop_id: string;
  quantity?: number;
}) =>
  apiFetch<CartItem>(B, `/me/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const removeCartItem = (item_id: string) =>
  apiFetch<null>(B, `/me/cart/items/${encodeURIComponent(item_id)}`, {
    method: "DELETE",
  });

export const updateCartItem = (item_id: string, quantity: number) =>
  apiFetch<CartItem>(B, `/me/cart/items/${encodeURIComponent(item_id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });

// --- Likes ---

export const listMyLikes = () => apiFetch<Like[]>(B, `/me/likes`);

export const addLike = (target_kind: string, target_id: string) =>
  apiFetch<Like>(B, `/me/likes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_kind, target_id }),
  });

export const removeLike = (target_kind: string, target_id: string) =>
  apiFetch<null>(
    B,
    `/me/likes?target_kind=${encodeURIComponent(target_kind)}&target_id=${encodeURIComponent(target_id)}`,
    { method: "DELETE" },
  );

// --- Showroom visits ---

export const listMyShowroomVisits = () =>
  apiFetch<ShowroomVisitRequest[]>(B, `/me/showroom-visits`);

export const createShowroomVisit = (body: {
  shop_id: string;
  preferred_date?: string;
  notes?: string;
}) =>
  apiFetch<ShowroomVisitRequest>(B, `/me/showroom-visits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// --- Journal ---

export const listJournal = (params?: {
  category?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}) => {
  const sp = new URLSearchParams();
  if (params?.category) sp.set("category", params.category);
  if (params?.featured !== undefined) sp.set("featured", String(params.featured));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.offset) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return apiFetch<JournalArticle[]>(B, `/journal${q ? `?${q}` : ""}`);
};

export const getJournalArticle = (slug: string) =>
  apiFetch<JournalArticle>(B, `/journal/${encodeURIComponent(slug)}`);
