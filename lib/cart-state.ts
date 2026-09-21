import { z } from "zod";
import type { Book, Format } from "./catalog";
const prices = z.object({
  NGN: z.number().int().positive(),
  USD: z.number().int().positive(),
});
const storedBook = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    title: z.string().min(1),
    cover: z.string().min(1),
    author: z.string(),
    category: z.string(),
    categories: z.array(z.string()),
    description: z.string(),
    color: z.string(),
    variants: z.object({
      ebook: z.string().min(1),
      paperback: z.string().min(1),
    }),
    prices: z.object({ ebook: prices, paperback: prices }),
  })
  .passthrough();
const item = z.object({
  book: storedBook,
  format: z.enum(["ebook", "paperback"]),
  quantity: z.number().int().min(1).max(50),
});
export function readCartItems(
  value: unknown,
): { book: Book; format: Format; quantity: number }[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 50).flatMap((raw) => {
    const result = item.safeParse(raw);
    if (!result.success) return [];
    const i = result.data;
    const key = i.book.variants[i.format];
    if (seen.has(key)) return [];
    seen.add(key);
    return [
      {
        ...i,
        book: i.book as Book,
        quantity: i.format === "ebook" ? 1 : i.quantity,
      },
    ];
  });
}
export function cartQuantity(value: number) {
  return Number.isFinite(value)
    ? Math.max(1, Math.min(50, Math.floor(value)))
    : 1;
}
