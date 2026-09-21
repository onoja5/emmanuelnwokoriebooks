import { z } from "zod";
import type { Currency } from "./catalog";
export const cartSchema = z
  .array(
    z.object({
      variant_id: z.uuid(),
      quantity: z.number().int().min(1).max(50),
    }),
  )
  .min(1)
  .max(50)
  .refine(
    (items) => new Set(items.map((i) => i.variant_id)).size === items.length,
    "Duplicate variants",
  );
export type Variant = {
  id: string;
  format: "ebook" | "paperback";
  price_ngn: number;
  price_usd: number;
  active: boolean;
};
export type Shipping = {
  id: string;
  name: string;
  kind: "delivery" | "pickup" | "quote";
  country: string | null;
  price_ngn: number | null;
  price_usd: number | null;
  free_above_ngn?: number | null;
  free_above_usd?: number | null;
};
export const defaultShipping: Shipping[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    name: "Nigeria delivery",
    country: "Nigeria",
    kind: "delivery",
    price_ngn: 500000,
    price_usd: null,
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    name: "Abuja pickup",
    country: "Nigeria",
    kind: "pickup",
    price_ngn: 0,
    price_usd: 0,
  },
];
export function calculateTotals(
  items: { variant_id: string; quantity: number }[],
  variants: Variant[],
  currency: Currency,
  shipping: Shipping | null,
  country: string,
  percent = 0,
) {
  cartSchema.parse(items);
  let subtotal = 0;
  let physical = false;
  for (const item of items) {
    const v = variants.find((v) => v.id === item.variant_id && v.active);
    if (!v) throw Error("Book unavailable");
    if (v.format === "ebook" && item.quantity !== 1)
      throw Error("Ebooks can only be purchased once per order");
    if (v.format === "paperback") physical = true;
    subtotal +=
      item.quantity * (currency === "NGN" ? v.price_ngn : v.price_usd);
  }
  let delivery = 0;
  if (physical) {
    if (!shipping || shipping.kind === "quote")
      throw Error("Please request a shipping quote before ordering");
    if (shipping.kind === "delivery" && shipping.country !== country)
      throw Error("Please request a shipping quote for this destination");
    const price = currency === "NGN" ? shipping.price_ngn : shipping.price_usd;
    const threshold =
      currency === "NGN" ? shipping.free_above_ngn : shipping.free_above_usd;
    if (price === null)
      throw Error("Please request a shipping quote for this currency");
    delivery = threshold != null && subtotal >= threshold ? 0 : price;
  }
  if (!Number.isInteger(percent) || percent < 0 || percent > 100)
    throw Error("Invalid discount");
  const discount = Math.floor((subtotal * percent) / 100);
  return {
    subtotal,
    shipping: delivery,
    discount,
    total: subtotal + delivery - discount,
    physical,
  };
}
