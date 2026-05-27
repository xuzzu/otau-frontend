"use client";

import { useQuery } from "@tanstack/react-query";
import { getGeneration, listRoomItemsByType } from "@/lib/api/generation";
import { qk } from "./queryKeys";
import type { Generation, GenerationRoom } from "@/lib/api/types";

const IN_FLIGHT: Generation["status"][] = ["queued", "running"];
const ROOM_IN_FLIGHT_STATUSES: GenerationRoom["status"][] = ["replacing"];

export function useGeneration(id: string | null | undefined) {
  return useQuery({
    queryKey: id ? qk.generation(id) : ["generation", null],
    queryFn: () => getGeneration(id as string),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as Generation | undefined;
      if (!data) return false;
      if (IN_FLIGHT.includes(data.status)) return 1500;
      if (data.rooms.some((r) => ROOM_IN_FLIGHT_STATUSES.includes(r.status))) {
        return 1500;
      }
      return false;
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
