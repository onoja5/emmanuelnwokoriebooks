import { describe, it, expect } from "vitest";
import { books } from "../lib/catalog";
import {
  calculateTotals,
  defaultShipping,
  cartSchema,
  type Variant,
} from "../lib/commerce";
import { accessToken, validAccess } from "../lib/security";
import { renderEmail } from "../lib/emails";
const variants: Variant[] = books.flatMap((b) =>
  Object.entries(b.variants).map(([format, id]) => ({
    id,
    format: format as "ebook" | "paperback",
    active: true,
    price_ngn: b.prices[format as "ebook" | "paperback"].NGN,
    price_usd: b.prices[format as "ebook" | "paperback"].USD,
  })),
);
const ebook = { variant_id: variants[0].id, quantity: 1 };
const paper = { variant_id: variants[1].id, quantity: 2 };
describe("server-authoritative monetary rules", () => {
  it("digital delivery is free", () =>
    expect(
      calculateTotals([ebook], variants, "NGN", null, "Nigeria"),
    ).toMatchObject({ subtotal: 300000, shipping: 0, total: 300000 }));
  it("paperback quantity and shipping apply once", () =>
    expect(
      calculateTotals([paper], variants, "NGN", defaultShipping[0], "Nigeria"),
    ).toMatchObject({ subtotal: 1200000, shipping: 500000, total: 1700000 }));
  it("mixed orders include shipping once", () =>
    expect(
      calculateTotals(
        [ebook, paper],
        variants,
        "NGN",
        defaultShipping[0],
        "Nigeria",
      ).total,
    ).toBe(2000000));
  it("USD uses explicit prices", () =>
    expect(
      calculateTotals(
        [ebook, paper],
        variants,
        "USD",
        defaultShipping[1],
        "Nigeria",
      ).total,
    ).toBe(1100));
  it("USD delivery requires a quote", () =>
    expect(() =>
      calculateTotals([paper], variants, "USD", defaultShipping[0], "Nigeria"),
    ).toThrow(/quote/));
  it("international delivery requires a quote", () =>
    expect(() =>
      calculateTotals([paper], variants, "NGN", defaultShipping[0], "Ghana"),
    ).toThrow(/quote/));
  it("coupon never discounts shipping", () =>
    expect(
      calculateTotals(
        [ebook, paper],
        variants,
        "NGN",
        defaultShipping[0],
        "Nigeria",
        10,
      ),
    ).toMatchObject({ discount: 150000, total: 1850000 }));
  it("free delivery threshold is configurable", () =>
    expect(
      calculateTotals(
        [paper],
        variants,
        "NGN",
        { ...defaultShipping[0], free_above_ngn: 1000000 },
        "Nigeria",
      ).shipping,
    ).toBe(0));
  it("rejects unknown and duplicate variants", () => {
    expect(() =>
      calculateTotals(
        [{ variant_id: "10000000-0000-4000-8000-000000000099", quantity: 1 }],
        variants,
        "NGN",
        null,
        "Nigeria",
      ),
    ).toThrow();
    expect(() => cartSchema.parse([ebook, ebook])).toThrow();
  });
  it("rejects extra ebook copies, negative quantities", () => {
    expect(() =>
      calculateTotals(
        [{ ...ebook, quantity: 2 }],
        variants,
        "NGN",
        null,
        "Nigeria",
      ),
    ).toThrow();
    expect(() => cartSchema.parse([{ ...paper, quantity: -1 }])).toThrow();
  });
});
describe("signed order access", () => {
  it("guest access is signed, scoped and expiring", () => {
    const token = accessToken("one", "test-secret");
    expect(validAccess(token, "one", "test-secret")).toBe(true);
    expect(validAccess(token, "two", "test-secret")).toBe(false);
    expect(validAccess(token, "one", "wrong-secret")).toBe(false);
    expect(
      validAccess(
        accessToken("one", "test-secret", Date.now() - 1),
        "one",
        "test-secret",
      ),
    ).toBe(false);
  });
  it("escapes email content", () =>
    expect(
      renderEmail(
        "order_received",
        { order_number: "<script>x</script>" },
        "https://example.com",
      ).html,
    ).not.toContain("<script>"));
});
