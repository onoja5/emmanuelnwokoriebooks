import { z } from "zod";
const text = z.string().max(10000);
const short = z.string().max(250);
const id = z.uuid();
const price = z.number().int().min(1).max(10000000000);
const nonnegative = z.number().int().min(0);
const nullableShort = short.nullable().optional();
const safeUrl = z
  .string()
  .refine(
    (s) => (s.startsWith("/") && !s.startsWith("//")) || /^https:\/\//.test(s),
    "Use a relative path or HTTPS URL",
  );
export const adminSchemas: Record<string, z.ZodType> = {
  books: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: short.min(1),
    subtitle: nullableShort,
    author_display: short.min(1),
    description: text.min(1),
    cover_url: safeUrl,
    category: short.min(1),
    categories: z.array(short),
    color: z.enum(["paper", "clay", "blue"]).default("paper"),
    isbn: nullableShort,
    pages: z.number().int().positive().nullable().optional(),
    publication_year: z
      .number()
      .int()
      .min(1800)
      .max(2200)
      .nullable()
      .optional(),
    sample_url: safeUrl.nullable().optional(),
    amazon_url: z
      .url()
      .refine((s) => /^https:\/\/(www\.)?(amazon\.[a-z.]+|amzn\.to)\//.test(s))
      .nullable()
      .optional(),
    table_of_contents: z.array(short).nullable().optional(),
    gallery: z.array(safeUrl).default([]),
    published: z.boolean(),
    sort_order: z.number().int().default(0),
  }),
  product_variants: z.object({
    book_id: id,
    format: z.enum(["ebook", "paperback"]),
    price_ngn: price,
    price_usd: price,
    active: z.boolean(),
  }),
  inventory: z.object({ variant_id: id, stock: nonnegative }),
  categories: z.object({
    name: short.min(1),
    slug: z.string().regex(/^[a-z0-9-]+$/),
  }),
  authors: z.object({
    name: short.min(1),
    biography: text.nullable().optional(),
    portrait_url: safeUrl.nullable().optional(),
  }),
  book_contributors: z.object({
    book_id: id,
    author_id: id,
    role: z.enum(["author", "editor"]),
  }),
  book_categories: z.object({ book_id: id, category_id: id }),
  digital_assets: z.object({
    variant_id: id,
    storage_path: z
      .string()
      .regex(/^[a-zA-Z0-9/_\-.]+$/)
      .refine((s) => !s.includes("..")),
    file_type: z.enum(["pdf", "epub"]),
    active: z.boolean(),
  }),
  shipping_methods: z.object({
    name: short,
    country: nullableShort,
    kind: z.enum(["delivery", "pickup", "quote"]),
    price_ngn: nonnegative.nullable(),
    price_usd: nonnegative.nullable(),
    free_above_ngn: nonnegative.nullable().optional(),
    free_above_usd: nonnegative.nullable().optional(),
    active: z.boolean(),
  }),
  coupons: z.object({
    code: z.string().regex(/^[A-Z0-9_-]{2,40}$/),
    percent: z.number().int().min(1).max(99),
    max_uses: z.number().int().positive().nullable().optional(),
    starts_at: z.iso.datetime({ offset: true }),
    expires_at: z.iso.datetime({ offset: true }).nullable().optional(),
    active: z.boolean(),
  }),
  bundles: z.object({
    title: short.min(1),
    book_ids: z.array(id).min(2),
    percent: z.number().int().min(0).max(99),
    active: z.boolean(),
  }),
  events: z.object({
    title: short.min(1),
    description: text.nullable().optional(),
    date: z.iso.datetime({ offset: true }),
    location: short,
    event_type: nullableShort,
    registration_url: safeUrl.nullable().optional(),
    published: z.boolean(),
  }),
  reviews: z.object({
    book_id: id,
    name: short.min(1),
    quote: text.min(1),
    rating: z.number().int().min(1).max(5).nullable().optional(),
    published: z.boolean(),
  }),
  bank_accounts: z.object({
    account_name: short.min(1),
    bank: short.min(1),
    account_number: z.string().regex(/^[0-9A-Z-]{5,40}$/),
    label: short,
    currency: z.enum(["NGN", "USD"]),
    active: z.boolean(),
  }),
  site_settings: z.object({
    key: z.enum(["homepage", "publisher", "downloads"]),
    value: z.record(z.string(), z.unknown()),
  }),
};
export const readOnlyTables = [
  "orders",
  "payments",
  "profiles",
  "newsletter_subscribers",
  "download_entitlements",
  "contact_messages",
  "email_outbox",
];
export const tableTemplates: Record<string, Record<string, unknown>> = {
  books: {
    slug: "new-book",
    title: "",
    subtitle: null,
    author_display: "Emmanuel Chibuike Nwokorie",
    description: "",
    cover_url: "/covers/weyoh.jpg",
    category: "African Fiction",
    categories: ["African Fiction"],
    color: "paper",
    published: false,
    sort_order: 4,
  },
  product_variants: {
    book_id: "",
    format: "ebook",
    price_ngn: 300000,
    price_usd: 200,
    active: false,
  },
  inventory: { variant_id: "", stock: 0 },
  categories: { name: "", slug: "" },
  authors: { name: "", biography: "", portrait_url: null },
  book_contributors: { book_id: "", author_id: "", role: "author" },
  book_categories: { book_id: "", category_id: "" },
  digital_assets: {
    variant_id: "",
    storage_path: "",
    file_type: "pdf",
    active: false,
  },
  shipping_methods: {
    name: "",
    country: "Nigeria",
    kind: "delivery",
    price_ngn: 500000,
    price_usd: null,
    free_above_ngn: null,
    free_above_usd: null,
    active: false,
  },
  coupons: {
    code: "",
    percent: 10,
    max_uses: null,
    starts_at: "2026-09-15T00:00:00Z",
    expires_at: null,
    active: false,
  },
  bundles: { title: "", book_ids: [], percent: 0, active: false },
  events: {
    title: "",
    description: "",
    date: "2026-10-01T12:00:00Z",
    location: "",
    event_type: "Lecture",
    registration_url: null,
    published: false,
  },
  reviews: { book_id: "", name: "", quote: "", rating: null, published: false },
  bank_accounts: {
    account_name: "",
    bank: "",
    account_number: "",
    label: "",
    currency: "NGN",
    active: false,
  },
  site_settings: { key: "homepage", value: {} },
};
