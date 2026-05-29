import { BASES } from "./env";
import { apiFetch } from "./http";
import type {
  AlternatesResponse,
  CreateGenerationBody,
  Generation,
  GenerationRoom,
  ItemSummary,
  RoomScenesResponse,
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

// --- Item Replacement (alternates + replace) ---

export const getAlternates = (generation_id: string, room_id: string) =>
  apiFetch<AlternatesResponse>(
    B,
    `/generations/${encodeURIComponent(generation_id)}/rooms/${encodeURIComponent(room_id)}/alternates`,
  );

export const getRoomScenes = (generation_id: string, room_id: string) =>
  apiFetch<RoomScenesResponse>(
    B,
    `/generations/${encodeURIComponent(generation_id)}/rooms/${encodeURIComponent(room_id)}/scenes`,
  );

export const replaceItem = (
  generation_id: string,
  room_id: string,
  old_item_id: string,
  new_item_id: string,
) =>
  apiFetch<GenerationRoom>(
    B,
    `/generations/${encodeURIComponent(generation_id)}/rooms/${encodeURIComponent(room_id)}/replace`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ old_item_id, new_item_id }),
    },
  );
