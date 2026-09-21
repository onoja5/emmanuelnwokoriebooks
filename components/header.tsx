"use client";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingCart,
  Menu,
  X,
  ArrowUpRight,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { useStore } from "./store-provider";
export function Header({ enquiry }: { enquiry?: React.ReactNode }) {
  const { currency, setCurrency, items, ready, setCartOpen } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="utility">
        <span>Books that inform, inspire and endure.</span>
        <div>
          <div className="header-enquiry">{enquiry}</div>
          <span className="utility-note">
            An independent voice. A world of ideas.
          </span>
          <label className="currency-label">
            <span className="sr-only">Currency</span>
            <select
              disabled={!ready}
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as "NGN" | "USD")}
            >
              <option value="NGN">NGN ₦</option>
              <option value="USD">USD $</option>
            </select>
          </label>
        </div>
      </div>
      <header className="header">
        <Link
          href="/"
          className="wordmark"
          aria-label="Emmanuel Chibuike Nwokorie home"
        >
          <span className="monogram" aria-hidden="true">
            e<span>n.</span>
          </span>
          <span>
            EMMANUEL CHIBUIKE
            <br />
            <strong>NWOKORIE</strong>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="/books">Books</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/about">The author</Link>
          <Link href="/events">Events</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/bundles">Bundles</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="header-actions">
          <Link href="/books?search=1" aria-label="Search books">
            <Search />
          </Link>
          <Link
            className="wishlist-icon"
            href="/wishlist"
            aria-label="Saved books"
          >
            <Heart />
          </Link>
          <button
            disabled={!ready}
            onClick={() => setCartOpen(true)}
            className="cart-icon"
            aria-label={`Shopping cart, ${items.reduce((n, i) => n + i.quantity, 0)} items`}
          >
            <ShoppingCart />
            <span>{items.reduce((n, i) => n + i.quantity, 0)}</span>
          </button>
          <button
            disabled={!ready}
            className="menu-toggle icon-button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[
            ["/", "Home"],
            ["/books", "Books"],
            ["/categories", "Categories"],
            ["/about", "The author"],
            ["/events", "Events"],
            ["/resources", "Resources"],
            ["/bundles", "Bundles"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {label}
              <ArrowUpRight size={18} />
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
export function Footer({ enquiry }: { enquiry?: React.ReactNode }) {
  return (
    <footer>
      <div className="footer-main">
        <div className="footer-intro">
          <BookOpen size={30} />
          <h3>
            Good books.
            <br />
            Lasting perspectives.
          </h3>
          <p>
            Emmanuel Chibuike Nwokorie
            <br />
            Mindfield Publishing
          </p>
        </div>
        {[
          {
            title: "THE BOOKS",
            links: [
              ["All books", "/books"],
              ["Fiction", "/books?category=African%20Fiction"],
              ["Medical & professional", "/books?category=Medical%20Imaging"],
              ["Collections & bundles", "/bundles"],
            ],
          },
          {
            title: "HERE TO HELP",
            links: [
              ["Shipping & returns", "/shipping"],
              ["Order support", "/contact?subject=Order%20support"],
              ["Ebook help", "/contact?subject=Reading%20sample"],
              ["Frequently asked questions", "/help"],
            ],
          },
          {
            title: "STAY CONNECTED",
            links: [
              ["Meet Emmanuel", "/about"],
              ["Events & speaking", "/events"],
              ["Contact the publisher", "/contact"],
              ["Resources", "/resources"],
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            {col.links.map(([title, href]) => (
              <Link href={href} key={title}>
                {title}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="footer-enquiry">{enquiry}</div>
      <div className="footer-bottom">
        <div className="footer-credits">
          <span>
            © {new Date().getFullYear()} Mindfield Publishing. All rights
            reserved.
          </span>
          <span>Developed by Microflex Technologies</span>
        </div>
        <div className="footer-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/refunds">Refund policy</Link>
          <span>NGN / USD · WhatsApp ordering</span>
        </div>
      </div>
    </footer>
  );
}
