import { it, expect } from "vitest";
import { books } from "../lib/catalog";
import { collectionDiscount, defaultBundles } from "../lib/bundles";
it("discounts only complete collections in each currency and selected format", () => {
  const items = [
    { book: books[0], format: "paperback" as const, quantity: 1 },
    { book: books[1], format: "ebook" as const, quantity: 1 },
  ];
  expect(collectionDiscount(items, "NGN", defaultBundles)).toBe(90000);
  expect(collectionDiscount(items, "USD", defaultBundles)).toBe(65);
  expect(collectionDiscount(items.slice(0, 1), "NGN", defaultBundles)).toBe(0);
});
it("does not discount unrelated books or stack collection rules", () => {
  const items = books.map((book) => ({
    book,
    format: "ebook" as const,
    quantity: 1,
  }));
  expect(
    collectionDiscount(items, "NGN", [
      ...defaultBundles,
      { ...defaultBundles[0], id: "other", percent: 5 },
    ]),
  ).toBe(60000);
});
