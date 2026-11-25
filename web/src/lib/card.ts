import type { Product } from "./types";
import { coverImage, productState } from "./catalog";

export type CardData = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  category: string;
  image: string | null;
  bg: string | null;
  badge: string | null;
};

export function toCard(p: Product): CardData {
  const state = productState(p);
  let badge: string | null = null;
  if (state === "some") badge = "บางสี/ไซส์ สั่งทาง LINE";
  if (state === "none") badge = p.variants.some((v) => v.availability === "preorder") ? "พรีออเดอร์ทาง LINE" : "สอบถามทาง LINE";
  return {
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    price: p.price,
    category: p.category,
    image: coverImage(p),
    bg: p.image_bg,
    badge,
  };
}
