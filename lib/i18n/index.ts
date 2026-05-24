"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dict, type Lang } from "./dict";

export type { Lang } from "./dict";
export { pickText } from "./text";

interface LangStore {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: "kz",
      setLang: (l) => set({ lang: l }),
    }),
    { name: "otau.lang" },
  ),
);

export function useLocale(): Lang {
  return useLangStore((s) => s.lang);
}

function interp(s: string, params?: Record<string, string | number>) {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ""));
}

export function useT() {
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);
  const t = (k: string, params?: Record<string, string | number>) =>
    interp(dict[lang][k] ?? k, params);
  return { t, lang, setLang };
}
