"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Style } from "./products";

export type RoomKey = "Living" | "Bedroom" | "Kitchen" | "Workspace";

type DesignAnswers = {
  scope: "apartment" | "room" | null;
  /** Which ЖК was selected (apartment) OR which room (room) */
  spaceId: string | null;
  /** Free-form area in m² (room) */
  area?: number;
  styles: Style[];
  /** Budget in tenge */
  budget: number;
  /** Currently selected room in the Studio (apartment-plan view). */
  selectedRoom: RoomKey | null;
  /** Active scene-generation run, set when the wizard finishes. */
  generationId: string | null;
};

type DesignStore = DesignAnswers & {
  setScope: (s: DesignAnswers["scope"]) => void;
  setSpace: (id: string) => void;
  setArea: (m2: number) => void;
  toggleStyle: (s: Style) => void;
  setBudget: (n: number) => void;
  setSelectedRoom: (r: RoomKey | null) => void;
  setGenerationId: (id: string | null) => void;
  reset: () => void;
};

const initial: DesignAnswers = {
  scope: null,
  spaceId: null,
  area: undefined,
  styles: [],
  budget: 3_000_000,
  selectedRoom: null,
  generationId: null,
};

export const useDesign = create<DesignStore>()(
  persist(
    (set, get) => ({
      ...initial,
      setScope: (s) => {
        const cur = get().scope;
        if (cur === s) {
          set({ scope: s });
        } else {
          // Switching scope: the old spaceId (e.g. a room id) is meaningless
          // in the new scope. Clear it so apartment doesn't carry over "bedroom"
          // and room doesn't carry over a ЖК slug.
          set({ scope: s, spaceId: null, area: undefined });
        }
      },
      setSpace: (id) => set({ spaceId: id }),
      setArea: (m2) => set({ area: m2 }),
      toggleStyle: (s) => {
        const cur = get().styles;
        if (cur.includes(s)) {
          set({ styles: cur.filter((x) => x !== s) });
        } else if (cur.length < 2) {
          set({ styles: [...cur, s] });
        } else {
          set({ styles: [cur[1], s] });
        }
      },
      setBudget: (n) => set({ budget: n }),
      setSelectedRoom: (r) => set({ selectedRoom: r }),
      setGenerationId: (id) => set({ generationId: id }),
      reset: () => set(initial),
    }),
    { name: "otau.design" }
  )
);

// ───────── My Room (selected items) ─────────

type RoomStore = {
  items: string[]; // product ids
  add: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
};

export const useMyRoom = create<RoomStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (id) => {
        if (get().items.includes(id)) return;
        set({ items: [...get().items, id] });
      },
      remove: (id) => set({ items: get().items.filter((x) => x !== id) }),
      has: (id) => get().items.includes(id),
      clear: () => set({ items: [] }),
    }),
    { name: "otau.myroom" }
  )
);
