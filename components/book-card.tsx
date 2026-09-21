"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Plus, ArrowUpRight } from "lucide-react";
import { type Book, type Format, money } from "@/lib/catalog";
import { useStore } from "./store-provider";
export function BookCard({ book, index = 0 }: { book: Book; index?: number }) {
  const [format, setFormat] = useState<Format>("ebook");
  const { currency, add, saved, toggle, ready, setCartOpen } = useStore();
  return (
    <article className="book-card">
      <div className={`book-stage ${book.color}`}>
        <span className="book-number">0{index + 1} / THE COLLECTION</span>
        <button
          disabled={!ready}
          className={`save-button ${saved.includes(book.id) ? "saved" : ""}`}
          aria-label={`Save ${book.title}`}
          aria-pressed={saved.includes(book.id)}
          onClick={() => toggle(book.id)}
        >
          <Heart size={19} />
        </button>
        <Link href={`/books/${book.slug}`} aria-label={`View ${book.title}`}>
          <Image
            src={book.cover}
            alt={`${book.title} cover`}
            width={280}
            height={440}
            sizes="(max-width: 700px) 65vw, 25vw"
            className="book-cover"
            priority={index === 0}
          />
        </Link>
      </div>
      <div className="book-copy">
        <p className="eyebrow">{book.category}</p>
        <Link href={`/books/${book.slug}`}>
          <h3>{book.title}</h3>
        </Link>
        <p className="byline">{book.author}</p>
        <div className="card-commerce">
          <div className="format-tabs" aria-label={`Format for ${book.title}`}>
            <button
              disabled={!ready}
              aria-pressed={format === "ebook"}
              onClick={() => setFormat("ebook")}
            >
              Ebook
            </button>
            <button
              disabled={!ready}
              aria-pressed={format === "paperback"}
              onClick={() => setFormat("paperback")}
            >
              Paperback
            </button>
          </div>
          <strong>{money(book.prices[format][currency], currency)}</strong>
        </div>
        <button
          disabled={!ready || book.availability?.[format] === false}
          className="card-add button"
          onClick={() => {
            add(book, format);
            setCartOpen(true);
          }}
        >
          Add to cart <Plus size={18} />
        </button>
      </div>
    </article>
  );
}
export function Purchase({ book }: { book: Book }) {
  const router = useRouter();
  const [format, setFormat] = useState<Format>("ebook");
  const [quantity, setQuantity] = useState(1);
  const { currency, add, saved, toggle, ready, setCartOpen } = useStore();
  return (
    <div className="purchase">
      <div className="format-tabs big">
        <button
          disabled={!ready}
          aria-pressed={format === "ebook"}
          onClick={() => {
            setFormat("ebook");
            setQuantity(1);
          }}
        >
          Ebook<span>Digital edition</span>
        </button>
        <button
          disabled={!ready}
          aria-pressed={format === "paperback"}
          onClick={() => setFormat("paperback")}
        >
          Paperback<span>Printed edition</span>
        </button>
      </div>
      <p className="stock-note">
        {book.availability?.[format] === true
          ? "In stock"
          : book.availability?.[format] === false
            ? "Currently unavailable"
            : "Availability confirmed on WhatsApp"}
      </p>
      <div className="purchase-price">
        <strong>{money(book.prices[format][currency], currency)}</strong>
        <span>
          {format === "ebook"
            ? "Secure digital delivery"
            : "Shipping confirmed on WhatsApp"}
        </span>
      </div>
      <div className="purchase-actions">
        {format === "paperback" && (
          <label>
            Qty
            <input
              aria-label="Quantity"
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.max(
                    1,
                    Math.min(50, Math.floor(Number(e.target.value)) || 1),
                  ),
                )
              }
            />
          </label>
        )}
        <button
          disabled={!ready || book.availability?.[format] === false}
          className="button"
          onClick={() => {
            add(book, format, quantity);
            setCartOpen(true);
          }}
        >
          Add to cart <Plus size={18} />
        </button>
        <button
          disabled={!ready || book.availability?.[format] === false}
          className="button copper"
          onClick={() => {
            add(book, format, quantity);
            router.push("/checkout");
          }}
        >
          Order now <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="mobile-purchase-bar">
        <span>
          {format === "ebook" ? "Ebook" : "Paperback"} ·{" "}
          {money(book.prices[format][currency], currency)}
        </span>
        <button
          className="button"
          disabled={!ready || book.availability?.[format] === false}
          onClick={() => {
            add(book, format, quantity);
            setCartOpen(true);
          }}
        >
          Add to cart
        </button>
      </div>
      <div className="purchase-secondary">
        <button disabled={!ready} onClick={() => toggle(book.id)}>
          <Heart
            size={17}
            fill={saved.includes(book.id) ? "currentColor" : "none"}
          />{" "}
          {saved.includes(book.id) ? "Saved" : "Save for later"}
        </button>
        {book.sample ? (
          <a href={book.sample} target="_blank" rel="noreferrer">
            Read a sample ↗
          </a>
        ) : (
          <Link
            href={`/contact?subject=Reading%20sample&book=${encodeURIComponent(book.title)}`}
          >
            Ask for a reading sample ↗
          </Link>
        )}
      </div>
    </div>
  );
}
