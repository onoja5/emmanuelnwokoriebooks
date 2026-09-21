import { describe, expect, it } from "vitest";
import { books } from "../lib/catalog";
import { orderMessage, whatsappUrl } from "../lib/whatsapp";

describe("WhatsApp order handoff", () => {
  it("uses the author’s approved number and safely encodes the message", () => {
    const url = new URL(whatsappUrl("Hello Emmanuel & team"));
    expect(url.origin + url.pathname).toBe("https://wa.me/2347047100043");
    expect(url.searchParams.get("text")).toBe("Hello Emmanuel & team");
  });

  it("includes the complete order and confirmation request", () => {
    const message = orderMessage({
      items: [
        { book: books[0], format: "ebook", quantity: 1 },
        { book: books[0], format: "paperback", quantity: 2 },
      ],
      currency: "NGN",
      customer: {
        name: "Ada Reader",
        email: "ada@example.com",
        phone: "08000000000",
      },
      delivery: {
        method: "Nigeria delivery",
        address: "1 Library Road",
        city: "Abuja",
        state: "FCT",
        country: "Nigeria",
      },
      subtotal: 1_500_000,
      discount: 100_000,
      shipping: 500_000,
      total: 1_900_000,
    });

    expect(message).toContain(books[0].title);
    expect(message).toContain("Format: Ebook");
    expect(message).toContain("Format: Paperback");
    expect(message).toContain("Quantity: 2");
    expect(message).toContain("Collection discount: -₦1,000");
    expect(message).toContain("Estimated order total: ₦19,000");
    expect(message).toContain("Name: Ada Reader");
    expect(message).toContain("Address: 1 Library Road");
    expect(message).toContain("Please confirm availability");
  });

  it("marks delivery as pending when a shipping quote is needed", () => {
    const message = orderMessage({
      items: [{ book: books[0], format: "paperback", quantity: 1 }],
      currency: "USD",
      customer: { name: "Ada Reader", email: "ada@example.com" },
      delivery: { method: "Nigeria delivery", country: "Other country" },
      subtotal: 400,
      discount: 0,
      shipping: null,
      total: 400,
    });
    expect(message).toContain("Delivery: Please confirm the shipping cost");
    expect(message).toContain("(shipping pending)");
  });
});
