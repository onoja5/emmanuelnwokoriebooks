import { getBooks } from "@/lib/catalog-server";
import { homepageSettings, authorContent } from "@/lib/content";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Truck,
  ShieldCheck,
  Globe2,
} from "lucide-react";
import { faqs } from "@/lib/catalog";
import { BookCard } from "@/components/book-card";
import { Newsletter } from "@/components/forms";
export default async function Home() {
  const [books, settings, authorInfo] = await Promise.all([
    getBooks(),
    homepageSettings(),
    authorContent(),
  ]);
  const featured =
    books.find((b) => b.id === settings.featured_book_id) || books[0];
  if (!featured)
    return (
      <section className="content empty-state">
        <h1>The next chapter is coming.</h1>
        <p>
          The publisher is preparing the collection. Please check back soon.
        </p>
      </section>
    );
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="line" /> LITERATURE. FAITH. SCIENCE. LIFE.
          </p>
          <h1>
            Stories that move <br />
            the heart.
            <br />
            <em>
              Knowledge that <br />
              moves the world.
            </em>
          </h1>
          <p className="hero-description">
            Step into the worlds of Emmanuel Chibuike Nwokorie.
            <br className="desktop-only" /> From the richness of African stories
            to the frontiers of
            <br className="desktop-only" /> medical knowledge — find your next
            perspective.
          </p>
          <div className="hero-buttons">
            <Link href="/books" className="button">
              Explore the books <ArrowUpRight size={18} />
            </Link>
            <Link href="/about" className="text-link">
              Meet the author <ArrowRight size={18} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span>01 — 03</span>
            <span>One author. Many ways of seeing.</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-art-top">
            <span>THE MINDFIELD COLLECTION</span>
            <span>VOL. 01</span>
          </div>
          <Link href={`/books/${featured.slug}`} className="hero-book">
            <Image
              src={featured.cover}
              alt={`${featured.title} by ${featured.author}`}
              width={335}
              height={535}
              priority
              sizes="(max-width: 700px) 65vw, 30vw"
            />
          </Link>
          <div className="hero-caption">
            <div>
              <span className="eyebrow">
                IN THE SPOTLIGHT · {featured.category}
              </span>
              <h2>{featured.title}</h2>
              <p>A story waiting to meet you.</p>
            </div>
            <Link
              href={`/books/${featured.slug}`}
              aria-label={`Explore ${featured.title}`}
              className="circle-link"
            >
              <ArrowUpRight />
            </Link>
          </div>
          <span className="vertical-label">A MINDFIELD PUBLICATION</span>
        </div>
      </section>
      <div className="assurance">
        <span>
          <BookOpen /> Ebook & paperback editions
        </span>
        <span>
          <Truck /> Delivered to your doorstep
        </span>
        <span>
          <Globe2 /> Pay in NGN or USD
        </span>
        <span>
          <ShieldCheck /> Order directly with the author on WhatsApp
        </span>
      </div>
      <section className="section catalogue-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE BOOKSHELF</p>
            <h2>Three books. A world of perspectives.</h2>
          </div>
          <Link className="text-link" href="/books">
            Discover all books <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="book-grid">
          {books.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </section>
      <section className="category-strip">
        <p className="eyebrow">FOLLOW YOUR CURIOSITY</p>
        <div>
          {[
            "African Fiction",
            "Faith & Culture",
            "Medical Imaging",
            "Education",
          ].map((name, i) => (
            <Link
              href={`/books?category=${encodeURIComponent(name)}`}
              key={name}
            >
              <span>0{i + 1}</span>
              <h3>{name}</h3>
              <ArrowUpRight size={21} />
            </Link>
          ))}
        </div>
        <Link className="text-link" href="/categories">
          Explore every subject <ArrowRight size={17} />
        </Link>
      </section>
      {settings.show_author !== false && (
        <section className="author-section">
          <div className="author-letter">
            <span className="eyebrow">THE VOICE BEHIND THE PAGES</span>
            {authorInfo?.portrait_url ? (
              <Image
                src={authorInfo.portrait_url}
                alt="Emmanuel Chibuike Nwokorie"
                width={300}
                height={300}
                style={{ objectFit: "cover", height: 300, width: "100%" }}
              />
            ) : (
              <span className="large-initial">
                E<span>N.</span>
              </span>
            )}
            <div>
              <span>EMMANUEL CHIBUIKE NWOKORIE</span>
              <span>AUTHOR & EDITOR</span>
            </div>
          </div>
          <div className="author-copy">
            <p className="eyebrow">MEET EMMANUEL</p>
            <h2>
              A curious mind.
              <br />A deeply human voice.
            </h2>
            <p>
              Literature and science ask different questions. Both begin with a
              desire to understand.
            </p>
            <p>
              Emmanuel Chibuike Nwokorie’s work brings together African fiction,
              faith, culture and medical education. Explore an author’s
              collection that makes room for the heart and the mind.
            </p>
            <Link href="/about" className="text-link">
              The person behind the books <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      )}
      <section className="section collection-section">
        <div className="collection-copy">
          <p className="eyebrow">BETTER READ TOGETHER</p>
          <h2>
            Faith. Conflict.
            <br />
            The choices that
            <br />
            <em>make us human.</em>
          </h2>
          <p>
            Two works of Nigerian fiction.
            <br />
            Two invitations to see differently.
          </p>
          <Link className="button" href="/bundles">
            Explore the fiction collection <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="collection-covers">
          <Image
            src="/covers/obiako.jpg"
            alt="The Agony of Obiako"
            width={230}
            height={368}
          />
          <Image
            src="/covers/weyoh.jpg"
            alt="Weyoh Aunty Mero"
            width={230}
            height={368}
          />
        </div>
      </section>
      <section className="medical-section">
        <Image
          src="/covers/mri.jpg"
          alt="Magnetic Resonance Imaging in the Tropics textbook cover"
          width={235}
          height={376}
        />
        <div>
          <p className="eyebrow">FOR THE MINDS ADVANCING MEDICINE</p>
          <h2>
            Knowledge made
            <br />
            for real-world practice.
          </h2>
          <p>Magnetic Resonance Imaging in the Tropics</p>
          <span>Principles, Practice & Innovations</span>
          <Link
            href="/books/magnetic-resonance-imaging-in-the-tropics"
            className="text-link"
          >
            Explore the textbook <ArrowUpRight size={18} />
          </Link>
        </div>
        <span className="medical-side">MEDICAL & PROFESSIONAL</span>
      </section>
      {settings.show_events !== false && (
        <section className="section events-teaser">
          <div>
            <p className="eyebrow">BEYOND THE PAGE</p>
            <h2>
              Good ideas bring
              <br />
              people together.
            </h2>
          </div>
          <div>
            <p>
              Book conversations, lectures and speaking engagements. Discover
              opportunities to connect with Emmanuel’s work.
            </p>
            <Link href="/events" className="text-link">
              Events & speaking <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>
      )}
      <section className="section faq-section">
        <div>
          <p className="eyebrow">A FEW HELPFUL ANSWERS</p>
          <h2>
            Before you turn
            <br />
            the first page.
          </h2>
          <Link href="/help" className="text-link">
            Visit the help centre <ArrowUpRight size={18} />
          </Link>
        </div>
        <div>
          {faqs.slice(0, 5).map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <span>+</span>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <Newsletter />
    </>
  );
}
