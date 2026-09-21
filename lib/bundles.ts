import type { Book, Currency, Format } from "./catalog";
export type BundleRule = {
  id: string;
  title: string;
  book_ids: string[];
  percent: number;
};
export const defaultBundles: BundleRule[] = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    title: "The fiction collection",
    book_ids: [
      "10000000-0000-4000-8000-000000000001",
      "10000000-0000-4000-8000-000000000002",
    ],
    percent: 10,
  },
];
export function collectionDiscount(
  items: { book: Book; format: Format; quantity: number }[],
  currency: Currency,
  rules: BundleRule[],
) {
  return Math.max(
    0,
    ...rules
      .filter(
        (r) =>
          r.book_ids.length >= 2 &&
          r.book_ids.every((id) => items.some((i) => i.book.id === id)),
      )
      .map((r) =>
        Math.floor(
          (items
            .filter((i) => r.book_ids.includes(i.book.id))
            .reduce(
              (sum, i) => sum + i.book.prices[i.format][currency] * i.quantity,
              0,
            ) *
            r.percent) /
            100,
        ),
      ),
  );
}
