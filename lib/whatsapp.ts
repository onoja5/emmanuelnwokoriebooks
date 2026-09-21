import type { CartItem } from "@/components/store-provider";
import type { Currency } from "./catalog";
import { money } from "./catalog";

export const whatsappNumber = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2347047100043"
).replace(/[^0-9]/g, "");

export type WhatsAppOrder = {
  items: CartItem[];
  currency: Currency;
  customer: { name: string; email: string; phone?: string };
  delivery?: {
    method: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  subtotal: number;
  discount: number;
  shipping: number | null;
  total: number;
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function orderMessage(order: WhatsAppOrder) {
  const lines = [
    "Hello Emmanuel, I would like to order the following books:",
    "",
    ...order.items.map(
      (item, index) =>
        `${index + 1}. ${item.book.title}\n   Format: ${item.format === "ebook" ? "Ebook" : "Paperback"}\n   Quantity: ${item.quantity}\n   Price: ${money(item.book.prices[item.format][order.currency] * item.quantity, order.currency)}`,
    ),
    "",
    `Books subtotal: ${money(order.subtotal, order.currency)}`,
  ];
  if (order.discount > 0)
    lines.push(
      `Collection discount: -${money(order.discount, order.currency)}`,
    );
  lines.push(
    order.shipping === null
      ? "Delivery: Please confirm the shipping cost"
      : `Delivery: ${money(order.shipping, order.currency)}`,
    order.shipping === null
      ? `Estimated books total: ${money(order.total, order.currency)} (shipping pending)`
      : `Estimated order total: ${money(order.total, order.currency)}`,
    "",
    "Customer details",
    `Name: ${order.customer.name}`,
    `Email: ${order.customer.email}`,
  );
  if (order.customer.phone) lines.push(`Phone: ${order.customer.phone}`);
  if (order.delivery) {
    lines.push(`Delivery method: ${order.delivery.method}`);
    if (order.delivery.address)
      lines.push(`Address: ${order.delivery.address}`);
    if (order.delivery.city) lines.push(`City: ${order.delivery.city}`);
    if (order.delivery.state)
      lines.push(`State/region: ${order.delivery.state}`);
    if (order.delivery.country)
      lines.push(`Country: ${order.delivery.country}`);
    if (order.delivery.postalCode)
      lines.push(`Postal code: ${order.delivery.postalCode}`);
  }
  lines.push(
    "",
    "Please confirm availability, the final amount, payment instructions and fulfilment details. Thank you.",
  );
  return lines.join("\n");
}
