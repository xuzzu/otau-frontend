import { BASES } from "./env";
import { apiFetch } from "./http";
import type {
  CreateGenerationBody,
  Generation,
  GenerationRoom,
  ItemSummary,
} from "./types";

const B = BASES.generation;

export const createGeneration = (body: CreateGenerationBody) =>
  apiFetch<Generation>(B, `/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const getGeneration = (id: string) =>
  apiFetch<Generation>(B, `/generations/${encodeURIComponent(id)}`);

export const listGenerations = (params?: { status?: string }) => {
  const qs = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  return apiFetch<Generation[]>(B, `/generations${qs}`);
};

export const cancelGeneration = (id: string) =>
  apiFetch<Generation>(B, `/generations/${encodeURIComponent(id)}`, {
    method: "PATCH",
  });

export const getRoomByType = (generation_id: string, room_type: string) =>
  apiFetch<GenerationRoom>(
    B,
    `/generations/${encodeURIComponent(generation_id)}/rooms/by-type/${encodeURIComponent(room_type)}`,
  );

export const listRoomItemsByType = (
  generation_id: string,
  room_type: string,
) =>
  apiFetch<ItemSummary[]>(
    B,
    `/generations/${encodeURIComponent(generation_id)}/rooms/by-type/${encodeURIComponent(room_type)}/items`,
  );
