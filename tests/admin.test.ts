import { it, expect } from "vitest";
import { adminSchemas } from "../lib/admin-schema";
it("rejects invalid administrative prices and quantities", () => {
  expect(() =>
    adminSchemas.product_variants.parse({
      book_id: "10000000-0000-4000-8000-000000000001",
      format: "ebook",
      price_ngn: -1,
      price_usd: 2,
      active: true,
    }),
  ).toThrow();
  expect(() =>
    adminSchemas.inventory.parse({
      variant_id: "20000000-0000-4000-8000-000000000001",
      stock: -10,
    }),
  ).toThrow();
});
it("does not permit changing reserved inventory from the record editor", () => {
  expect(
    adminSchemas.inventory.parse({
      variant_id: "20000000-0000-4000-8000-000000000001",
      stock: 10,
      reserved: 0,
    }),
  ).toEqual({ variant_id: "20000000-0000-4000-8000-000000000001", stock: 10 });
});
it("does not expose payment or role mutations as generic CRUD", () => {
  expect(adminSchemas.orders).toBeUndefined();
  expect(adminSchemas.payments).toBeUndefined();
  expect(adminSchemas.profiles).toBeUndefined();
  expect(adminSchemas.download_entitlements).toBeUndefined();
});
it("prevents unsafe book URLs and private path traversal", () => {
  expect(() =>
    adminSchemas.books.parse({
      slug: "test",
      title: "Test",
      author_display: "Test",
      description: "Test",
      cover_url: "javascript:alert(1)",
      category: "Fiction",
      categories: [],
      published: false,
    }),
  ).toThrow();
  expect(() =>
    adminSchemas.digital_assets.parse({
      variant_id: "20000000-0000-4000-8000-000000000001",
      storage_path: "../private.pdf",
      file_type: "pdf",
      active: true,
    }),
  ).toThrow();
});
