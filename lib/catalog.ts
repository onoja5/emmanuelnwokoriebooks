export type Currency = "NGN" | "USD";
export type Format = "ebook" | "paperback";
export type Book = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  cover: string;
  category: string;
  categories: string[];
  description: string;
  color: string;
  prices: Record<Format, Record<Currency, number>>;
  variants: Record<Format, string>;
  isbn?: string;
  pages?: number;
  year?: number;
  sample?: string;
  amazon?: string;
  toc?: string[];
  gallery?: string[];
  availability?: Partial<Record<Format, boolean>>;
};
export const author = "Emmanuel Chibuike Nwokorie";
export const books: Book[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    slug: "weyoh-aunty-mero",
    title: "Weyoh Aunty Mero",
    author,
    cover: "/covers/weyoh.jpg",
    category: "African Fiction",
    categories: [
      "African Fiction",
      "Nigerian Literature",
      "Contemporary Fiction",
      "Social Issues",
      "Faith & Culture",
    ],
    description:
      "An encounter with Nigerian storytelling. Discover Weyoh Aunty Mero, a work of fiction by Emmanuel Chibuike Nwokorie.",
    color: "paper",
    prices: {
      ebook: { NGN: 300000, USD: 200 },
      paperback: { NGN: 600000, USD: 450 },
    },
    variants: {
      ebook: "20000000-0000-4000-8000-000000000001",
      paperback: "20000000-0000-4000-8000-000000000002",
    },
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    slug: "the-agony-of-obiako",
    title: "The Agony of Obiako",
    author,
    cover: "/covers/obiako.jpg",
    category: "Historical Fiction",
    categories: [
      "African Fiction",
      "Historical Fiction",
      "Nigerian Civil War",
      "Christian Literature",
      "War & Faith",
    ],
    description:
      "Explore faith, conflict and human choices through Nigerian fiction. A novel by Emmanuel Chibuike Nwokorie.",
    color: "clay",
    prices: {
      ebook: { NGN: 300000, USD: 200 },
      paperback: { NGN: 600000, USD: 450 },
    },
    variants: {
      ebook: "20000000-0000-4000-8000-000000000003",
      paperback: "20000000-0000-4000-8000-000000000004",
    },
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    slug: "magnetic-resonance-imaging-in-the-tropics",
    title: "Magnetic Resonance Imaging in the Tropics",
    subtitle: "Principles, Practice & Innovations",
    author: author + " & Joseph Dlama Zira (editors)",
    cover: "/covers/mri.jpg",
    category: "Medical Imaging",
    categories: [
      "Medical Imaging",
      "Radiography",
      "MRI",
      "Education",
      "Diagnostic Imaging",
      "Textbooks",
      "Professional Development",
    ],
    description:
      "A professional title for the imaging community. Explore principles, practice and innovations in MRI with a focus on the tropics, edited by Emmanuel Chibuike Nwokorie and Joseph Dlama Zira.",
    color: "blue",
    prices: {
      ebook: { NGN: 500000, USD: 400 },
      paperback: { NGN: 1000000, USD: 800 },
    },
    variants: {
      ebook: "20000000-0000-4000-8000-000000000005",
      paperback: "20000000-0000-4000-8000-000000000006",
    },
  },
];
export const categories = [
  "African Fiction",
  "Faith & Culture",
  "Medical Imaging",
  "Radiography",
  "Education",
  "Christian Literature",
  "Historical Fiction",
  "Professional Development",
];
export function money(amount: number, currency: Currency) {
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}
export const faqs = [
  [
    "Which format should I buy?",
    "Choose an ebook to read digitally, or a paperback if you prefer a printed book. Each format is purchased separately.",
  ],
  [
    "How do ebooks work?",
    "After confirmed payment, your purchase appears in My Downloads. Download the available PDF or EPUB and read it with a compatible reader.",
  ],
  [
    "How will I receive an ebook?",
    "Emmanuel confirms payment and ebook delivery with you directly on WhatsApp or email. Contact the publisher if you need help receiving or opening the file.",
  ],
  [
    "Do you deliver paperbacks?",
    "Yes. Nigerian delivery has a default ₦5,000 logistics fee per order. Abuja pickup is also available. International delivery requires a shipping quote before purchase.",
  ],
  [
    "How long does delivery take?",
    "Delivery timing depends on your address and stock. Contact the publisher for an estimate before placing a time-sensitive order.",
  ],
  [
    "Can I pay in Naira or US Dollars?",
    "Yes. Select NGN or USD before ordering. Prices are set independently for each currency. Emmanuel will confirm the final amount and payment instructions with you on WhatsApp.",
  ],
  [
    "Can organisations order in bulk?",
    "Yes. Contact Mindfield Publishing with the titles, quantities and delivery location for a tailored quote.",
  ],
  [
    "Can Emmanuel speak at an event?",
    "Send the date, location, audience and proposed subject through the contact form. The publisher will respond about availability.",
  ],
  [
    "Are these books available on Amazon?",
    "Where an Amazon edition is listed, a link appears on the book’s page. You can purchase directly here using the available formats.",
  ],
];
