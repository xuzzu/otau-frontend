/** Tenge formatter — "₸ 685 000" */
export const T = (n: number) =>
  "₸ " + n.toLocaleString("en-US").replace(/,/g, " ");

/** Compact tenge — "₸685k", "₸2.1M" */
export const Tc = (n: number) => {
  if (n >= 1_000_000) return "₸" + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return "₸" + Math.round(n / 1_000) + "k";
  return "₸" + n;
};

/** Format price with currency — "₸ 685 000" for KZT */
export function formatPrice(amount: number, currency: string): string {
  if (currency === "KZT") return T(amount);
  return `${amount} ${currency}`;
}
