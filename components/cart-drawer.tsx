"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useStore } from "./store-provider";
import { money } from "@/lib/catalog";
import { defaultShipping, type Shipping } from "@/lib/commerce";
import {
  collectionDiscount,
  defaultBundles,
  type BundleRule,
} from "@/lib/bundles";
export function CartDrawer() {
  const { cartOpen, setCartOpen, items, update, currency } = useStore();
  const dialog = useRef<HTMLDialogElement>(null);
  const methods: Shipping[] = defaultShipping;
  const bundles: BundleRule[] = defaultBundles;
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (cartOpen) el.showModal();
    else el.close();
    if (!cartOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [cartOpen]);
  const subtotal = items.reduce(
    (sum, i) => sum + i.book.prices[i.format][currency] * i.quantity,
    0,
  );
  const physical = items.some((i) => i.format === "paperback");
  const discount = collectionDiscount(items, currency, bundles);
  const delivery = methods.find(
    (s) => s.country === "Nigeria" && s.kind === "delivery",
  );
  const rate = currency === "NGN" ? delivery?.price_ngn : delivery?.price_usd;
  const threshold =
    currency === "NGN" ? delivery?.free_above_ngn : delivery?.free_above_usd;
  const shipping =
    !physical || (threshold != null && subtotal >= threshold) ? 0 : rate;
  return (
    <dialog
      ref={dialog}
      className="cart-drawer"
      aria-labelledby="drawer-title"
      onCancel={() => setCartOpen(false)}
      onClose={() => setCartOpen(false)}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const box = e.currentTarget.getBoundingClientRect();
          if (e.clientX < box.left) setCartOpen(false);
        }
      }}
    >
      {cartOpen && (
        <>
          <div className="drawer-heading">
            <h2 id="drawer-title">Your cart</h2>
            <button
              className="icon-button"
              aria-label="Close cart"
              onClick={() => setCartOpen(false)}
            >
              <X />
            </button>
          </div>
          <div className="drawer-items">
            {items.length ? (
              items.map((i) => (
                <article className="drawer-item" key={i.book.id + i.format}>
                  <Image
                    src={i.book.cover}
                    alt={i.book.title}
                    width={62}
                    height={96}
                  />
                  <div>
                    <Link
                      href={`/books/${i.book.slug}`}
                      onClick={() => setCartOpen(false)}
                    >
                      <h3>{i.book.title}</h3>
                    </Link>
                    <p>
                      {i.format === "ebook"
                        ? "Ebook · Digital edition"
                        : "Paperback · Printed edition"}
                    </p>
                    <strong>
                      {money(
                        i.book.prices[i.format][currency] * i.quantity,
                        currency,
                      )}
                    </strong>
                    <div className="drawer-item-controls">
                      {i.format === "paperback" ? (
                        <label>
                          Qty{" "}
                          <input
                            aria-label={`Cart quantity for ${i.book.title}`}
                            type="number"
                            min={1}
                            max={50}
                            value={i.quantity}
                            onChange={(e) =>
                              update(
                                i.book.id,
                                i.format,
                                Number(e.target.value) || 1,
                              )
                            }
                          />
                        </label>
                      ) : (
                        <span>Qty 1</span>
                      )}
                      <button
                        onClick={() => update(i.book.id, i.format, 0)}
                        aria-label={`Remove ${i.book.title} ${i.format}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <h3>Your cart is empty.</h3>
                <Link
                  className="button"
                  href="/books"
                  onClick={() => setCartOpen(false)}
                >
                  Explore the books
                </Link>
              </div>
            )}
          </div>
          {!!items.length && (
            <div className="drawer-footer">
              <div className="summary-line">
                <span>Books subtotal</span>
                <strong>{money(subtotal, currency)}</strong>
              </div>
              {discount > 0 && (
                <div className="summary-line">
                  <span>Collection saving</span>
                  <strong>−{money(discount, currency)}</strong>
                </div>
              )}
              <p>
                {physical
                  ? "The cart shows the delivery estimate and any collection saving before you send your WhatsApp request. Abuja pickup is available."
                  : "Digital delivery is free. Emmanuel will confirm payment and ebook delivery on WhatsApp."}
              </p>
              <div className="summary-line">
                <span>
                  {physical ? "Nigeria delivery estimate" : "Digital delivery"}
                </span>
                <strong>
                  {shipping == null
                    ? "Quote required"
                    : money(shipping, currency)}
                </strong>
              </div>
              <Link
                className="button"
                href="/checkout"
                onClick={() => setCartOpen(false)}
              >
                Review order for WhatsApp →
              </Link>
              <Link
                className="text-link"
                href="/cart"
                onClick={() => setCartOpen(false)}
              >
                View cart & delivery options
              </Link>
              <SecureStrip />
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
export function SecureStrip() {
  return (
    <p className="secure-strip">
      Order directly on WhatsApp <span>•</span> NGN & USD <span>•</span> Payment
      and fulfilment confirmed by the author
    </p>
  );
}
