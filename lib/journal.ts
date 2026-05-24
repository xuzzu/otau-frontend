export type Article = {
  id: string;
  slug: string;
  /** ISO date */
  date: string;
  /** Section / column */
  category:
    | "notes"
    | "trend"
    | "profile"
    | "guide"
    | "house"
    | "essay";
  titleEN: string;
  ledeEN: string;
  bodyEN?: string[];
  author: string;
  readMin: number;
  photo: string;
  featured?: boolean;
  /** Optional second image used in detail */
  detailPhoto?: string;
};

export const ARTICLES: Article[] = [
  {
    id: "esentai-64",
    slug: "what-the-64m-zhk-esentai-asks-of-you",
    date: "2026-04-22",
    category: "notes",
    titleEN: "What the 64 m² ЖК Esentai unit asks of you",
    ledeEN:
      "Eighty percent of the apartments we design fall in the 58–72 m² band — the new Almaty standard. Here's what the plan wants from your sofa, your table, and your light.",
    bodyEN: [
      "The default ЖК Esentai 2-bedroom plan is a forgiving box. Living-room width 4.8 m, depth 5.1 m, one window facing east. The kitchen sits at the head, the bedrooms quietly off to the side. The only hard thing it asks of you is to choose a sofa under 240 cm.",
      "We've measured 18 of them. Eighteen plans, the same shape, the same eastern window. The plan rewards a long, low silhouette — a 220 to 240 cm sofa against the long wall, a soft armchair facing the window, a coffee table that doesn't get in the way of the corridor that always seems to need to be crossed.",
      "Where Esentai is honest: the kitchen-living transition. You will eat where you sit. You will host where you read. Plan for the bench that doubles as seating, the table that doesn't apologise for being there.",
      "Things to keep above the budget line: the sofa, the rug, the floor lamp. Things to keep below: every console you think you need.",
    ],
    author: "Otaū editorial",
    readMin: 6,
    photo:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1600&q=80",
    detailPhoto:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1400&q=80",
    featured: true,
  },
  {
    id: "boucle-moment",
    slug: "why-everyone-in-almaty-is-buying-boucle",
    date: "2026-04-15",
    category: "trend",
    titleEN: "Why everyone in Almaty is suddenly buying boucle",
    ledeEN:
      "Cream loops, soft shoulders, a fabric that forgives a wet kid and a dropped wine glass. Two showrooms tell us why the loveseat is back.",
    bodyEN: [
      "Forma KZ has shipped 144 boucle loveseats in 2026. Through April. That's about as many as their entire 2024.",
      "Boucle reads cream until it doesn't — you can specify it in stone, in moss, even in clay. The fabric's looped texture catches light differently every hour of the day, which is the reason it ends up in dusk-facing rooms more often than morning ones.",
      "Care is the catch. Vacuum weekly with a brush head. Spot-clean with water and dish soap, never solvent. The loops can snag — a cat with claws will not be a friend. None of this stops anyone.",
    ],
    author: "Aigerim K.",
    readMin: 4,
    photo:
      "https://images.unsplash.com/photo-1550226891-ef816aed4a98?w=1400&q=80",
  },
  {
    id: "qara-profile",
    slug: "qara-studio-the-room-above-the-bookshop",
    date: "2026-04-08",
    category: "profile",
    titleEN: "Qara Studio, the room above the bookshop",
    ledeEN:
      "Rattan, paper-cord, hand-shaped oak. Inside Almaty's quietest workshop, where one chair takes a week and they like it that way.",
    bodyEN: [
      "You take the back stairs above a bookshop on Tole Bi to find Qara. The smell hits you first — beeswax finish on white oak. Three people work here. Sometimes four when Adlet's brother comes in for the day.",
      "Qara is known for one chair: the Aralia. Hand-woven rattan over a steamed ash frame. They build one, photograph it, sell it, build the next. Lead time runs four to seven weeks.",
      "We asked Adlet how he thinks about scale. 'A chair should be the smallest thing in the room that anyone remembers.'",
    ],
    author: "Otaū editorial",
    readMin: 7,
    photo:
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=1400&q=80",
  },
  {
    id: "winter-light",
    slug: "lighting-for-the-long-kazakh-winter",
    date: "2026-04-02",
    category: "guide",
    titleEN: "Lighting for the long Kazakh winter",
    ledeEN:
      "Six months of grey sky changes how you have to plan a living room. A practical primer on layers, kelvin, and where the lamp should actually go.",
    photo:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&q=80",
    author: "Otaū editorial",
    readMin: 5,
  },
  {
    id: "house-edition-vol1",
    slug: "house-edition-vol-1",
    date: "2026-03-28",
    category: "house",
    titleEN: "The house edition · Vol. 01",
    ledeEN:
      "Sofas at 240 cm. Benches at 120 cm. We measured 47 ЖК and designed the pieces that fit. Read about the choices we made.",
    photo:
      "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1200&q=80",
    author: "Otaū editorial",
    readMin: 8,
  },
  {
    id: "softer-modular",
    slug: "the-case-for-a-softer-modular-sofa",
    date: "2026-03-22",
    category: "essay",
    titleEN: "The case for a softer modular sofa",
    ledeEN:
      "Rigid frames belong to offices. The sofa your guests want to fall asleep on is the sofa you should buy.",
    photo:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
    author: "Otaū editorial",
    readMin: 4,
  },
  {
    id: "kazakh-textiles",
    slug: "kazakh-textiles-contemporary-spaces",
    date: "2026-03-16",
    category: "essay",
    titleEN: "Kazakh textiles, contemporary spaces",
    ledeEN:
      "Felt is fading from yurts and reappearing in lofts — a long-form on a small heritage revival, told through three Almaty apartments.",
    photo:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=1200&q=80",
    author: "Aigerim K.",
    readMin: 9,
  },
];

export const findArticle = (slug: string) =>
  ARTICLES.find((a) => a.slug === slug) ?? null;

export const formatDate = (iso: string, lang: "kz" | "ru") => {
  const d = new Date(iso);
  const months = {
    kz: [
      "қаң",
      "ақп",
      "нау",
      "сәу",
      "мам",
      "мау",
      "шіл",
      "там",
      "қыр",
      "қаз",
      "қар",
      "жел",
    ],
    ru: [
      "янв",
      "фев",
      "мар",
      "апр",
      "мая",
      "июн",
      "июл",
      "авг",
      "сен",
      "окт",
      "ноя",
      "дек",
    ],
  } as const;
  return `${d.getDate()} ${months[lang][d.getMonth()]} ${d.getFullYear()}`;
};
