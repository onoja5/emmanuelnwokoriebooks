"use client";
import { useState } from "react";
import Image from "next/image";
import { type Book, type Format, money } from "@/lib/catalog";
import { useStore } from "./store-provider";
export function BundlePurchase({
  books,
  percent = 0,
  title = "The fiction collection",
}: {
  books: Book[];
  percent?: number;
  title?: string;
}) {
  const { currency, add, ready, setCartOpen } = useStore();
  const [formats, setFormats] = useState<Record<string, Format>>({});
  const subtotal = books.reduce(
    (s, b) => s + b.prices[formats[b.id] || "ebook"][currency],
    0,
  );
  const discount = Math.floor((subtotal * percent) / 100);
  const unavailable = books.some(
    (b) => b.availability?.[formats[b.id] || "ebook"] === false,
  );
  return (
    <div className="bundle-purchase">
      <div className="bundle-books">
        {books.map((b) => (
          <article key={b.id}>
            <Image src={b.cover} alt={b.title} width={110} height={170} />
            <div>
              <h3>{b.title}</h3>
              <label>
                Edition for {b.title}
                <select
                  disabled={!ready}
                  value={formats[b.id] || "ebook"}
                  onChange={(e) =>
                    setFormats({ ...formats, [b.id]: e.target.value as Format })
                  }
                >
                  <option value="ebook">Ebook</option>
                  <option value="paperback">Paperback</option>
                </select>
              </label>
              <strong>
                {money(b.prices[formats[b.id] || "ebook"][currency], currency)}
              </strong>
            </div>
          </article>
        ))}
      </div>
      <aside className="trust-panel">
        <p className="eyebrow">BUY TOGETHER</p>
        <h2>{title}</h2>
        {percent > 0 && (
          <p>
            Save {percent}% · <del>{money(subtotal, currency)}</del>
          </p>
        )}
        <p className="bundle-total">{money(subtotal - discount, currency)}</p>
        <p>
          {percent > 0
            ? `You save ${money(discount, currency)}. The saving appears in your WhatsApp order summary.`
            : "Choose each format and add both books in one step."}{" "}
          Paperback delivery is calculated once per order.
        </p>
        <button
          disabled={!ready || books.length < 2 || unavailable}
          className="button"
          onClick={() => {
            books.forEach((b) => add(b, formats[b.id] || "ebook"));
            setCartOpen(true);
          }}
        >
          {unavailable
            ? "Selected edition unavailable"
            : "Add collection to cart →"}
        </button>
      </aside>
    </div>
  );
}
