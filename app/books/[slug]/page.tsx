import { EnquiryLinks } from "@/components/enquiry-links";
import { publishedReviews } from "@/lib/content";
import { BookGallery } from "@/components/book-gallery";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBooks } from "@/lib/catalog-server";
import { Purchase, BookCard } from "@/components/book-card";
import type { Metadata } from "next";
export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getBooks()).map((book) => ({ slug: book.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = (await getBooks()).find((b) => b.slug === slug);
  if (!b) return {};
  return {
    title: b.title,
    description: b.description,
    alternates: { canonical: `/books/${slug}` },
    openGraph: {
      title: b.title,
      description: b.description,
      images: [{ url: b.cover, alt: b.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: b.title,
      description: b.description,
      images: [b.cover],
    },
  };
}
export default async function Product({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const all = await getBooks();
  const b = all.find((b) => b.slug === slug);
  if (!b) notFound();
  const reviews = await publishedReviews();
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://emmanuelnwokoriebooks.com"}/books/${b.slug}`;
  const encoded = encodeURIComponent(url);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Book",
        "@id": url + "#book",
        name: b.title,
        author: { "@type": "Person", name: b.author },
        image: b.cover,
        inLanguage: "en",
        ...(b.isbn ? { isbn: b.isbn } : {}),
      },
      {
        "@type": "Product",
        name: b.title,
        image: b.cover,
        description: b.description,
        offers: {
          "@type": "Offer",
          priceCurrency: "NGN",
          price: b.prices.ebook.NGN / 100,
          url,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Books",
            item: url.split("/books/")[0] + "/books",
          },
          { "@type": "ListItem", position: 2, name: b.title, item: url },
        ],
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\u003c"),
        }}
      />
      <div className="breadcrumbs">
        <Link href="/">Home</Link> / <Link href="/books">Books</Link> /{" "}
        {b.title}
      </div>
      <section className="product-layout">
        <BookGallery book={b} />
        <div className="product-info">
          <p className="eyebrow">{b.category}</p>
          <h1>{b.title}</h1>
          {b.subtitle && <p className="subtitle">{b.subtitle}</p>}
          <p>By {b.author}</p>
          <p>{b.description}</p>
          <Purchase book={b} />
          <div className="product-assurance">
            <strong>Order directly from Emmanuel on WhatsApp</strong>
            <p>
              Ebooks: Emmanuel will confirm availability, payment and secure
              digital delivery with you. No delivery fee.
            </p>
            <p>
              Paperbacks: the final total and delivery timing are confirmed for
              your destination before payment.
            </p>
          </div>
          <EnquiryLinks book={b.title} />
          {b.category === "Medical Imaging" && (
            <div className="trust-panel">
              <h3>Ordering for your institution?</h3>
              <p>
                Universities, radiography departments, hospitals and student
                groups can request a quotation for multiple copies.
              </p>
              <Link
                href={`/contact?subject=Bulk%20book%20order&book=${encodeURIComponent(b.title)}`}
                className="text-link"
              >
                Request a bulk or institutional quote ↗
              </Link>
            </div>
          )}
          <div className="share-links">
            <span>Share this book</span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(b.title + " " + url)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encoded}`}
              target="_blank"
              rel="noreferrer"
            >
              X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </div>
          {b.amazon && (
            <a
              className="text-link"
              href={b.amazon}
              target="_blank"
              rel="noreferrer"
            >
              Also available on Amazon ↗
            </a>
          )}
        </div>
      </section>
      <section className="book-details">
        <div>
          <h2>Inside the book</h2>
          <p>{b.description}</p>
          <details>
            <summary>
              Authors & editors <span>+</span>
            </summary>
            <p>{b.author}</p>
          </details>
          <details>
            <summary>
              Table of contents <span>+</span>
            </summary>
            <p>
              {b.toc?.length
                ? b.toc.join(" • ")
                : "The table of contents will be added by the publisher."}
            </p>
          </details>
          <details>
            <summary>
              Reviews & endorsements <span>+</span>
            </summary>
            {reviews.length ? (
              reviews.map((r) => (
                <blockquote key={r.id}>
                  <p>{r.quote}</p>
                  <cite>{r.name}</cite>
                </blockquote>
              ))
            ) : (
              <p>No reviews published yet.</p>
            )}
          </details>
          <details>
            <summary>
              Shipping & digital delivery <span>+</span>
            </summary>
            <p>
              Emmanuel confirms ebook delivery with you after payment. Nigerian
              paperback delivery is ₦5,000 per order by default; pickup and
              international quotes are available.
            </p>
          </details>
        </div>
        <div>
          <h2>The details</h2>
          <dl>
            {[
              ["Publisher", "Mindfield Publishing"],
              ["Language", "English"],
              ["Formats", "Ebook · Paperback"],
              ["ISBN", b.isbn || "To be confirmed"],
              ["Pages", b.pages || "To be confirmed"],
              ["Publication year", b.year || "To be confirmed"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <h2>Keep exploring.</h2>
          <Link href="/books" className="text-link">
            The full collection ↗
          </Link>
        </div>
        <div className="book-grid">
          {all
            .filter((v) => v.id !== b.id)
            .map((book, i) => (
              <BookCard book={book} index={i} key={book.id} />
            ))}
        </div>
      </section>
    </>
  );
}
