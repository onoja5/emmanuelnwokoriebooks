"use client";
import Image from "next/image";
import { useState } from "react";
import type { Book } from "@/lib/catalog";
import { useStore } from "./store-provider";
export function BookGallery({ book }: { book: Book }) {
  const images = [book.cover, ...(book.gallery || [])];
  const [selected, setSelected] = useState(0);
  const { ready } = useStore();
  return (
    <div>
      <div className="product-stage">
        <Image
          src={images[selected]}
          alt={
            selected === 0
              ? `${book.title} cover`
              : `${book.title} gallery image ${selected + 1}`
          }
          width={350}
          height={560}
          preload={selected === 0}
        />
      </div>
      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            padding: "18px 0",
          }}
        >
          {images.map((src, i) => (
            <button
              key={src + i}
              disabled={!ready}
              aria-label={`View book image ${i + 1}`}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              style={{
                padding: 4,
                border: `1px solid ${selected === i ? "var(--copper)" : "var(--line)"}`,
                background: "transparent",
              }}
            >
              <Image
                src={src}
                alt=""
                width={50}
                height={80}
                style={{ objectFit: "contain" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
