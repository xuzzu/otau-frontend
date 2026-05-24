"use client";

import { useQuery } from "@tanstack/react-query";
import { getGeneration, listRoomItemsByType } from "@/lib/api/generation";
import { qk } from "./queryKeys";
import type { Generation } from "@/lib/api/types";

const IN_FLIGHT: Generation["status"][] = ["queued", "running"];

export function useGeneration(id: string | null | undefined) {
  return useQuery({
    queryKey: id ? qk.generation(id) : ["generation", null],
    queryFn: () => getGeneration(id as string),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as Generation | undefined;
      return data && IN_FLIGHT.includes(data.status) ? 1500 : false;
    },
  });
}

export function useGenerationRoomItems(
  generation_id: string | null | undefined,
  room_type: string | null | undefined,
) {
  return useQuery({
    queryKey:
      generation_id && room_type
        ? qk.generationRoomItemsByType(generation_id, room_type)
        : ["generation-room-items", null],
    queryFn: () =>
      listRoomItemsByType(generation_id as string, room_type as string),
    enabled: !!generation_id && !!room_type,
  });
}
