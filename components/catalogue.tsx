"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { BookCard } from "./book-card";
import { categories, type Book } from "@/lib/catalog";
import { useStore } from "./store-provider";
export function Catalogue({
  books,
  initialCategory = "",
  wishlist = false,
}: {
  books: Book[];
  initialCategory?: string;
  wishlist?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory || "__url__");
  const { saved, ready } = useStore();
  const urlCategory =
    ready && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("category") || ""
      : "";
  const activeCategory = category === "__url__" ? urlCategory : category;
  const filtered = books.filter(
    (b) =>
      (!wishlist || saved.includes(b.id)) &&
      (!activeCategory || b.categories.includes(activeCategory)) &&
      [b.title, b.author, b.isbn, ...b.categories, b.description]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="filter-bar">
        <label className="search-input">
          <Search size={19} />
          <span className="sr-only">Search books</span>
          <input
            disabled={!ready}
            type="search"
            placeholder="Search title, author or subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by category"
          value={activeCategory}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All subjects</option>
          {[
            ...new Set([...categories, ...books.flatMap((b) => b.categories)]),
          ].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <span aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "book" : "books"}
        </span>
      </div>
      {filtered.length ? (
        <div className="book-grid">
          {filtered.map((b, i) => (
            <BookCard book={b} key={b.id} index={i} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>
            {wishlist ? "Your next read starts here." : "No books found."}
          </h2>
          <p>
            {wishlist
              ? "Save a book using the heart on its cover."
              : "Try another title or subject."}
          </p>
        </div>
      )}
    </>
  );
}
