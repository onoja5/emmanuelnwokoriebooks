"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SecureStrip } from "./cart-drawer";
import { useStore } from "./store-provider";
import { money } from "@/lib/catalog";
import { defaultShipping, type Shipping } from "@/lib/commerce";
import {
  collectionDiscount,
  defaultBundles,
  type BundleRule,
} from "@/lib/bundles";
import { orderMessage, whatsappUrl } from "@/lib/whatsapp";

type Config = { bundles: BundleRule[]; shipping: Shipping[] };

export function Cart({ checkout = false }: { checkout?: boolean }) {
  const {
    items,
    update,
    currency,
    shippingId: preferredDeliveryId,
    setShippingId,
    ready,
  } = useStore();
  const [config] = useState<Config>({
    bundles: defaultBundles,
    shipping: defaultShipping,
  });
  const [country, setCountry] = useState("Nigeria");

  const physical = items.some((item) => item.format === "paperback");
  const shippingId = config.shipping.some(
    (method) => method.id === preferredDeliveryId,
  )
    ? preferredDeliveryId
    : (config.shipping[0]?.id ?? null);
  const selected = config.shipping.find((method) => method.id === shippingId);
  const subtotal = items.reduce(
    (sum, item) =>
      sum + item.book.prices[item.format][currency] * item.quantity,
    0,
  );
  const discount = collectionDiscount(items, currency, config.bundles);
  const rawShipping = !physical
    ? 0
    : currency === "NGN"
      ? selected?.price_ngn
      : selected?.price_usd;
  const threshold =
    currency === "NGN" ? selected?.free_above_ngn : selected?.free_above_usd;
  const shipping =
    !physical || (threshold != null && subtotal >= threshold)
      ? 0
      : selected?.kind === "quote" ||
          (selected?.kind === "delivery" && selected.country !== country)
        ? null
        : (rawShipping ?? null);
  const total = subtotal - discount + (shipping || 0);

  if (!ready)
    return (
      <div className="content" role="status">
        Loading your cart…
      </div>
    );
  if (!items.length)
    return (
      <div className="content empty-state">
        <h2>Your cart is empty.</h2>
        <p>Find a story to get lost in, or knowledge to take with you.</p>
        <Link href="/books" className="button">
          Explore the books <ArrowRight size={18} />
        </Link>
      </div>
    );

  return (
    <div className="content">
      <div className="cart-layout">
        <div>
          {checkout ? (
            <form
              id="checkout-form"
              className="form-panel"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const message = orderMessage({
                  items,
                  currency,
                  customer: {
                    name: `${form.get("first_name") || ""} ${form.get("last_name") || ""}`.trim(),
                    email: String(form.get("email") || ""),
                    phone: physical
                      ? String(form.get("phone") || "")
                      : undefined,
                  },
                  delivery: physical
                    ? {
                        method: selected?.name || "To be confirmed",
                        address:
                          selected?.kind === "pickup"
                            ? undefined
                            : String(form.get("address") || ""),
                        city:
                          selected?.kind === "pickup"
                            ? undefined
                            : String(form.get("city") || ""),
                        state:
                          selected?.kind === "pickup"
                            ? undefined
                            : String(form.get("state") || ""),
                        country,
                        postalCode:
                          selected?.kind === "pickup"
                            ? undefined
                            : String(form.get("postal_code") || ""),
                      }
                    : undefined,
                  subtotal,
                  discount,
                  shipping,
                  total,
                });
                window.location.href = whatsappUrl(message);
              }}
            >
              <h2>01. Your details</h2>
              <p className="form-intro">
                Enter your details so the author can confirm availability,
                payment and fulfilment with you on WhatsApp.
              </p>
              <div className="form-grid">
                <label>
                  First name
                  <input
                    name="first_name"
                    autoComplete="given-name"
                    required
                    maxLength={80}
                  />
                </label>
                <label>
                  Last name
                  <input
                    name="last_name"
                    autoComplete="family-name"
                    required
                    maxLength={80}
                  />
                </label>
              </div>
              <label>
                Email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
              {physical && (
                <label>
                  Phone number
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={5}
                    maxLength={30}
                  />
                </label>
              )}
              {physical && selected?.kind !== "pickup" && (
                <>
                  <h2>02. Delivery details</h2>
                  <label>
                    Street address
                    <input
                      name="address"
                      autoComplete="street-address"
                      required
                      maxLength={250}
                    />
                  </label>
                  <div className="form-grid">
                    <label>
                      City
                      <input
                        name="city"
                        autoComplete="address-level2"
                        required
                        maxLength={100}
                      />
                    </label>
                    <label>
                      State / region
                      <input
                        name="state"
                        autoComplete="address-level1"
                        required
                        maxLength={100}
                      />
                    </label>
                    <label>
                      Country
                      <select
                        value={country}
                        onChange={(event) => setCountry(event.target.value)}
                      >
                        <option>Nigeria</option>
                        <option>Other country</option>
                      </select>
                    </label>
                    <label>
                      Postal code
                      <input
                        name="postal_code"
                        autoComplete="postal-code"
                        maxLength={30}
                      />
                    </label>
                  </div>
                </>
              )}
              <h2>{physical ? "03" : "02"}. Continue on WhatsApp</h2>
              <div className="whatsapp-checkout-note">
                <MessageCircle size={21} aria-hidden="true" />
                <div>
                  <strong>Your order is not placed automatically.</strong>
                  <p>
                    We will open WhatsApp with a prepared message to Emmanuel at
                    0704 710 0043. Review it, send it, and wait for confirmation
                    before making any payment.
                  </p>
                </div>
              </div>
              <label className="radio-label consent-row">
                <input type="checkbox" required />
                <span>
                  I agree to send these order details through WhatsApp and have
                  read the <Link href="/privacy">privacy notice</Link>.
                </span>
              </label>
            </form>
          ) : (
            items.map((item) => (
              <article className="cart-row" key={item.book.id + item.format}>
                <Image
                  src={item.book.cover}
                  alt={`${item.book.title} cover`}
                  width={77}
                  height={122}
                />
                <div>
                  <Link href={`/books/${item.book.slug}`}>
                    <h3>{item.book.title}</h3>
                  </Link>
                  <p>
                    {item.format === "ebook"
                      ? "Ebook · Digital edition"
                      : "Paperback · Printed edition"}
                  </p>
                  {item.format === "paperback" && (
                    <label>
                      <span className="sr-only">
                        Quantity for {item.book.title}
                      </span>
                      <input
                        aria-label={`Quantity for ${item.book.title}`}
                        type="number"
                        min={1}
                        max={50}
                        step={1}
                        value={item.quantity}
                        onChange={(event) =>
                          update(
                            item.book.id,
                            item.format,
                            Number(event.target.value) || 1,
                          )
                        }
                      />
                    </label>
                  )}
                  <br />
                  <button
                    aria-label={`Remove ${item.book.title} ${item.format}`}
                    onClick={() => update(item.book.id, item.format, 0)}
                  >
                    Remove
                  </button>
                </div>
                <strong>
                  {money(
                    item.book.prices[item.format][currency] * item.quantity,
                    currency,
                  )}
                </strong>
              </article>
            ))
          )}
        </div>

        <aside className="summary-panel">
          <h2>Your order</h2>
          {checkout &&
            items.map((item) => (
              <div className="summary-line" key={item.book.id + item.format}>
                <span>
                  {item.book.title}
                  <br />
                  <small>
                    {item.format} × {item.quantity}
                  </small>
                </span>
                <span>
                  {money(
                    item.book.prices[item.format][currency] * item.quantity,
                    currency,
                  )}
                </span>
              </div>
            ))}
          <div className="summary-line">
            <span>Books subtotal</span>
            <span>{money(subtotal, currency)}</span>
          </div>
          {physical && (
            <label>
              Delivery method
              <select
                value={shippingId || ""}
                onChange={(event) => setShippingId(event.target.value)}
              >
                {config.shipping.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="summary-line">
            <span>{physical ? "Delivery" : "Digital delivery"}</span>
            <span>
              {shipping === null
                ? "Confirm on WhatsApp"
                : money(shipping, currency)}
            </span>
          </div>
          {discount > 0 && (
            <div className="summary-line">
              <span>Collection saving</span>
              <span>−{money(discount, currency)}</span>
            </div>
          )}
          <div className="summary-line total">
            <span>{shipping === null ? "Books total" : "Estimated total"}</span>
            <strong>{money(total, currency)}</strong>
          </div>
          {checkout ? (
            <button className="button whatsapp-button" form="checkout-form">
              Continue on WhatsApp <MessageCircle size={18} />
            </button>
          ) : (
            <Link className="button whatsapp-button" href="/checkout">
              Order via WhatsApp <MessageCircle size={18} />
            </Link>
          )}
          <SecureStrip />
          {checkout && (
            <Link href="/cart" className="text-link edit-cart-link">
              Edit your cart
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
