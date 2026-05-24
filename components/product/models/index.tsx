"use client";

import type { ModelKey } from "@/lib/products";
import { Sofa } from "./Sofa";
import { Armchair } from "./Armchair";
import { CoffeeTable } from "./CoffeeTable";
import { FloorLamp } from "./FloorLamp";
import { DiningChair } from "./DiningChair";
import { Shelf } from "./Shelf";
import { Bench } from "./Bench";
import { Console } from "./Console";

export function ProductModel({
  kind,
  color,
}: {
  kind: ModelKey;
  color: string;
}) {
  switch (kind) {
    case "sofa":
      return <Sofa color={color} />;
    case "armchair":
      return <Armchair color={color} />;
    case "coffeeTable":
      return <CoffeeTable color={color} />;
    case "floorLamp":
      return <FloorLamp color={color} />;
    case "diningChair":
      return <DiningChair color={color} />;
    case "shelf":
      return <Shelf color={color} />;
    case "bench":
      return <Bench color={color} />;
    case "console":
      return <Console color={color} />;
    default:
      return null;
  }
}
