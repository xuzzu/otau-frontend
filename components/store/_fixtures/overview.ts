import type { KpiProps, TopItemProps, TodoRowProps, InquiryProps } from "../overview/parts";

export const KPIS: KpiProps[] = [
  { label: "Revenue · May", value: "₸18.4M", delta: "+22%", sub: "vs ₸15.1M Apr", up: true, tone: "clay", spark: true },
  { label: "Orders · May", value: "47", delta: "+12 wk", sub: "3 awaiting ship", up: true },
  { label: "Active listings", value: "218", delta: "4 draft", sub: "2 low · 1 out", tone: "muted" },
  { label: "Conversion", value: "3.8%", delta: "+0.4", sub: "cat. avg 2.6%", up: true },
  { label: "Buyer rating", value: "4.8", delta: "312 reviews", sub: "0 disputes open", tone: "muted" },
];

export const REVENUE_WEEKS: number[] = [3.2, 4.1, 3.6, 4.4, 5.0, 4.2, 5.7, 5.1, 6.4, 5.8, 6.9, 7.0];

export const TOP_ITEMS: TopItemProps[] = [
  { img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=70", name: "Klemo modular sofa", sku: "OT‑3127", v: "1 240", o: "14", rev: "₸9.6M" },
  { img: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=70", name: "Aigerim sectional", sku: "OT‑3401", v: "892", o: "6", rev: "₸5.5M", badge: "trending" },
  { img: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=70", name: "Linen armchair, ecru", sku: "OT‑2891", v: "486", o: "11", rev: "₸3.4M" },
  { img: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=400&q=70", name: "Otaū house sofa", sku: "OT‑3580", v: "612", o: "4", rev: "₸2.9M", badge: "featured" },
];

export const TODOS: TodoRowProps[] = [
  { tone: "clay", num: "3", label: "Orders awaiting shipment", hint: "oldest · OT‑3127, 2d ago" },
  { tone: "amber", num: "14", label: "Unanswered buyer inquiries", hint: "avg response · 1h 48m" },
  { tone: "clay", num: "2", label: "Items low on stock", hint: "Linen armchair · 2 left" },
  { tone: "muted", num: "1", label: "Item out of stock", hint: "Aigerim sectional · restock 4 Jun" },
  { tone: "muted", num: "4", label: "Drafts to finish", hint: "Otaū × Mebel house sofa, +3", last: true },
];

export const INQUIRIES: InquiryProps[] = [
  { initials: "AS", name: "Aliya S.", city: "Astana", item: "Klemo modular sofa", snippet: "Hello — can the slipcover be ordered in moss linen?", time: "14:22", unread: true },
  { initials: "DM", name: "Daniyar M.", city: "Almaty", item: "Aigerim sectional", snippet: "Lead time if I order today? I'm moving in mid‑June.", time: "11:08", unread: true },
  { initials: "ZK", name: "Zarina K.", city: "Shymkent", item: "Linen armchair", snippet: "Shipping to Shymkent — what does it run for one?", time: "Yest" },
];
