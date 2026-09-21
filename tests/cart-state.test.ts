import { it, expect } from "vitest";
import { readCartItems, cartQuantity } from "../lib/cart-state";
import { books } from "../lib/catalog";
it("rejects damaged persisted book data without breaking valid cart items", () => {
  const valid = { book: books[0], format: "paperback", quantity: 2 };
  expect(
    readCartItems([
      null,
      { book: { id: "broken" } },
      valid,
      {
        ...valid,
        book: { ...books[0], prices: { ebook: { NGN: "bad", USD: 2 } } },
      },
    ]),
  ).toEqual([valid]);
});
it("deduplicates variants and enforces one digital licence", () => {
  const ebook = { book: books[0], format: "ebook", quantity: 5 };
  expect(readCartItems([ebook, ebook])).toEqual([{ ...ebook, quantity: 1 }]);
});
it("normalizes fractional and invalid quantities", () => {
  expect(cartQuantity(1.5)).toBe(1);
  expect(cartQuantity(99)).toBe(50);
  expect(cartQuantity(NaN)).toBe(1);
  expect(cartQuantity(-2)).toBe(1);
});
