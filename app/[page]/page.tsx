import { Events } from "@/components/events";
import { authorContent, activeBundles } from "@/lib/content";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, faqs } from "@/lib/catalog";
import { getBooks } from "@/lib/catalog-server";
import { Catalogue } from "@/components/catalogue";
import { ContactForm, Newsletter } from "@/components/forms";
import { BundlePurchase } from "@/components/bundle-purchase";
import { EnquiryLinks } from "@/components/enquiry-links";
import { defaultBundles } from "@/lib/bundles";
const titles: Record<string, string> = {
  about: "The person behind the pages.",
  categories: "Follow your curiosity.",
  events: "Beyond the page.",
  resources: "A little help for your next chapter.",
  bundles: "Some books belong together.",
  contact: "Let’s start a conversation.",
  help: "Before you turn the first page.",
  shipping: "Getting your books to you.",
  privacy: "Your privacy matters.",
  terms: "Terms of purchase.",
  refunds: "Returns & refunds.",
  wishlist: "Your saved bookshelf.",
};
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(titles).map((page) => ({ page }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  return { title: titles[page] || "Not found" };
}
export default async function Info({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!titles[page]) notFound();
  const biography = page === "about" ? await authorContent() : null;
  const bundles = page === "bundles" ? await activeBundles() : [];
  const availableBooks = page === "bundles" ? await getBooks() : [];
  const collections = (
    bundles.length ? bundles : [{ ...defaultBundles[0], percent: 0 }]
  ).filter((b) =>
    b.book_ids.every((id: string) =>
      availableBooks.some((book) => book.id === id),
    ),
  );
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">
          EMMANUEL CHIBUIKE NWOKORIE · MINDFIELD PUBLISHING
        </p>
        <h1>{titles[page]}</h1>
      </div>
      <section
        className={`content ${["about", "help", "shipping", "privacy", "terms", "refunds", "events", "resources"].includes(page) ? "narrow" : ""}`}
      >
        {page === "about" && (
          <>
            <p className="eyebrow">AUTHOR. EDITOR. A CURIOUS MIND.</p>
            <h2>At the intersection of stories and scholarship.</h2>
            <p>
              Emmanuel Chibuike Nwokorie is the author of{" "}
              <em>Weyoh Aunty Mero</em> and <em>The Agony of Obiako</em>, and
              co-editor with Joseph Dlama Zira of{" "}
              <em>
                Magnetic Resonance Imaging in the Tropics: Principles, Practice
                & Innovations
              </em>
              .
            </p>
            <p>
              His collection spans African fiction, faith, culture and medical
              education. Mindfield Publishing brings these books together in a
              place for readers, students and professionals.
            </p>
            {biography?.portrait_url && (
              <Image
                src={biography.portrait_url}
                alt="Emmanuel Chibuike Nwokorie"
                width={400}
                height={500}
              />
            )}
            {biography?.biography && <p>{biography.biography}</p>}
            <div className="trust-panel">
              <h3>Explore the work</h3>
              <p>
                Begin with the fiction of Weyoh Aunty Mero and The Agony of
                Obiako, or explore the MRI textbook co-edited with Joseph Dlama
                Zira. Each title is offered as an ebook and a paperback.
              </p>
              <p>
                For interviews, reading-group discussions or speaking
                invitations, contact Mindfield Publishing with your proposed
                topic and date.
              </p>
              <EnquiryLinks speaking />
            </div>
            <Link href="/books" className="button">
              Explore Emmanuel’s books ↗
            </Link>
          </>
        )}
        {page === "categories" && (
          <div className="category-strip">
            <div style={{ gridTemplateColumns: "repeat(2,1fr)", gap: 25 }}>
              {categories.map((c, i) => (
                <Link href={`/books?category=${encodeURIComponent(c)}`} key={c}>
                  <span>0{i + 1}</span>
                  <h3>{c}</h3>
                  <span>↗</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        {page === "wishlist" && <Catalogue books={await getBooks()} wishlist />}
        {page === "contact" && (
          <div className="cart-layout">
            <div>
              <h2>Contact the publisher.</h2>
              <EnquiryLinks />
              <ul className="contact-topics">
                <li>
                  <strong>Book orders & support</strong> — availability,
                  delivery and ebook fulfilment.
                </li>
                <li>
                  <strong>Bulk & institutional orders</strong> — universities,
                  hospitals, departments and reading groups.
                </li>
                <li>
                  <strong>Events & speaking</strong> — invitations, proposed
                  topics and dates.
                </li>
                <li>
                  <strong>Publisher & media enquiries</strong> — interviews,
                  permissions and press materials.
                </li>
              </ul>
              <p style={{ marginTop: 20 }}>
                For book enquiries, bulk orders, speaking invitations and
                shipping quotes, send a message to Mindfield Publishing.
              </p>
              <p style={{ marginTop: 20 }}>
                For an existing order, please include your order number. Never
                send card details or passwords.
              </p>
            </div>
            <ContactForm />
          </div>
        )}
        {page === "help" &&
          faqs.map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        {page === "events" && (
          <>
            <p>
              Conversations that continue beyond the book: launches, lectures,
              signings and speaking engagements.
            </p>
            <Events />
            <div className="trust-panel">
              <p className="eyebrow">INVITATIONS & CONVERSATIONS</p>
              <h2>Invite Emmanuel to speak.</h2>
              <p>
                Send the event date, location or online format, audience,
                proposed topic and a contact person. The publisher will discuss
                availability and arrangements with you.
              </p>
              <h3>Topics to discuss with the publisher</h3>
              <ul>
                <li>African fiction, culture and storytelling</li>
                <li>Faith, conflict and human choices in literature</li>
                <li>Medical publishing and MRI education</li>
              </ul>
              <p>Topics and participation are subject to confirmation.</p>
              <EnquiryLinks speaking />
            </div>
          </>
        )}
        {page === "resources" && (
          <>
            <h2>For readers and learners.</h2>
            <div className="trust-panel">
              <h3>A reading-group starting point</h3>
              <p>
                After each chapter, note a choice that changes a character’s
                direction. Which pressures shape that choice? What does the
                setting reveal? Bring a passage and one open question to your
                group discussion.
              </p>
              <h3>For students using the MRI textbook</h3>
              <p>
                Keep a glossary as you read, connect each chapter to your course
                objectives, and record questions to discuss with your lecturer
                or clinical supervisor. Use your institution’s approved
                protocols for clinical practice.
              </p>
            </div>
            <p>
              Find guidance for ebooks, ordering paperbacks and choosing your
              next read.
            </p>
            {[
              [
                "Ebook delivery help",
                "Emmanuel will confirm payment and ebook delivery with you directly. Contact the publisher if you need a replacement file or help opening your edition.",
                "/contact?subject=Order%20support",
              ],
              [
                "Sample chapters",
                "Ask the publisher for an approved reading sample of the book you are considering.",
                "/contact?subject=Reading%20sample",
              ],
              [
                "Media & permissions",
                "Request the author biography, approved portrait, cover artwork or permission to reproduce an excerpt.",
                "/contact?subject=Media%20%26%20permissions",
              ],
              [
                "Medical & professional reading",
                "Explore the MRI textbook.",
                "/books/magnetic-resonance-imaging-in-the-tropics",
              ],
              [
                "For organisations",
                "For class sets, libraries, hospitals and departments, include the title, format, quantity, destination and required date in your enquiry.",
                "/contact?subject=Bulk%20book%20order",
              ],
            ].map(([h, p, l]) => (
              <div
                key={h}
                style={{
                  padding: "25px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <h3>{h}</h3>
                <p>{p}</p>
                <Link href={l} className="text-link">
                  Explore ↗
                </Link>
              </div>
            ))}
          </>
        )}
        {page === "bundles" && (
          <>
            <div className="section-heading">
              <div>
                <p className="eyebrow">THE FICTION COLLECTION</p>
                <h2>Stories of faith, conflict & human choices.</h2>
                <p style={{ marginTop: 20 }}>
                  Read these two titles together. Choose the edition of each
                  book below.
                </p>
              </div>
            </div>
            {collections.map((b) => (
              <BundlePurchase
                key={b.id}
                title={b.title}
                books={availableBooks.filter((book) =>
                  b.book_ids.includes(book.id),
                )}
                percent={b.percent}
              />
            ))}
            {!collections.length && (
              <p>
                No complete collections are currently available.{" "}
                <Link href="/books" className="text-link">
                  Explore individual books ↗
                </Link>
              </p>
            )}
          </>
        )}
        {page === "shipping" && (
          <>
            <h2>Paperbacks, delivered.</h2>
            <p>
              Nigerian paperback delivery has a default logistics fee of ₦5,000
              per order, including mixed ebook and paperback orders. The order
              summary displays the current configured rate.
            </p>
            <h2>Pickup & international orders</h2>
            <p>
              Abuja pickup is available by arrangement. Contact the publisher
              for collection details. International delivery and USD-priced
              shipping require a confirmed quote or configured shipping rate
              before you pay.
            </p>
            <h2>Digital editions</h2>
            <p>
              Ebook-only orders have no shipping charge. Emmanuel confirms
              payment and digital delivery with you on WhatsApp.
            </p>
            <h2>Delivery updates</h2>
            <p>
              Timing depends on stock and destination. Emmanuel confirms the
              fulfilment plan on WhatsApp. Contact the publisher before ordering
              if you need a specific delivery date.
            </p>
            <Link href="/contact" className="text-link">
              Request a shipping quote ↗
            </Link>
          </>
        )}
        {page === "privacy" && (
          <>
            <p>
              Mindfield Publishing uses the information you provide to process
              orders, deliver books and respond to enquiries.
            </p>
            <h2>Information used</h2>
            <p>
              Order details include your name, email, phone, selected books and
              delivery address where required. Order details are sent to the
              author through WhatsApp when you choose to continue. This website
              does not collect or store card details. Do not send card details,
              passwords or one-time codes in WhatsApp messages.
            </p>
            <h2>Your choices</h2>
            <p>
              Newsletter subscription is optional. You may unsubscribe at any
              time. Contact the publisher to request access, correction or
              deletion of personal information, subject to applicable
              recordkeeping obligations.
            </p>
            <h2>Local storage</h2>
            <p>
              Your currency preference, shopping cart and saved books are stored
              on your device. The public storefront does not require an account.
            </p>
          </>
        )}
        {page === "terms" && (
          <>
            <p>
              These terms describe purchasing from the Emmanuel Chibuike
              Nwokorie bookstore, operated by Mindfield Publishing.
            </p>
            <h2>Orders & payment</h2>
            <p>
              Prices are displayed in your selected currency. Shipping and any
              valid collection discount are shown before you contact the author.
              Availability, final delivery charges and payment instructions are
              confirmed with the author on WhatsApp before you pay.
            </p>
            <h2>Digital licences</h2>
            <p>
              Ebooks are provided for the purchaser’s personal use. Do not
              redistribute the files. Contact the publisher if you need help
              receiving or opening your ebook.
            </p>
            <h2>Availability</h2>
            <p>
              Paperback availability is subject to inventory. Delivery
              arrangements and refund requests are handled by the publisher,
              subject to applicable consumer rights.
            </p>
          </>
        )}
        {page === "refunds" && (
          <>
            <h2>Let us help put things right.</h2>
            <p>
              Contact the publisher with your order number and a description of
              the issue. For damaged or incorrect paperbacks, include
              photographs where possible.
            </p>
            <h2>Ebook issues</h2>
            <p>
              If a download fails, a file is unreadable or the wrong edition was
              supplied, contact support for help. Refund eligibility is assessed
              according to the circumstances and applicable consumer rights.
            </p>
            <h2>Refund processing</h2>
            <p>
              Approved refunds are returned through the original payment channel
              where possible. The publisher will confirm the arrangement and
              timing before processing.
            </p>
            <Link className="button" href="/contact">
              Contact order support ↗
            </Link>
          </>
        )}
      </section>
      {["about", "events", "resources"].includes(page) && <Newsletter />}
    </>
  );
}
