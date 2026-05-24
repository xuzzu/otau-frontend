import type { I18nText } from "@/lib/api/types";

export function pickText(
  value: I18nText | string | null | undefined,
  locale: string,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (value[locale]) return value[locale];
  if (value.en) return value.en;
  const first = Object.values(value).find((v) => v && v.length > 0);
  return first ?? "";
}
