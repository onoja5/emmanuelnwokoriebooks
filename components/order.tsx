"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { money, type Currency } from "@/lib/catalog";
import { useStore } from "./store-provider";
type Order = {
  id: string;
  order_number: string;
  created_at: string;
  currency: Currency;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment_status: string;
  status: string;
  method: string;
  reference: string;
  tracking_number?: string;
  customer: { first_name: string; last_name: string; email: string };
  order_items: {
    id: string;
    title: string;
    format: string;
    quantity: number;
    unit_price: number;
  }[];
};
type Bank = {
  account_name: string;
  account_number: string;
  bank: string;
  label: string;
  currency: string;
};
export function OrderView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);
  const [message, setMessage] = useState("Loading your order…");
  const { clear } = useStore();
  async function load() {
    try {
      const r = await fetch(`/api/orders/${id}`);
      const data = await r.json();
      if (!r.ok) {
        setMessage(data.error);
        return;
      }
      setOrder(data.order);
      setBank(data.bank);
      setMessage("");
      if (data.order.payment_status === "paid") clear();
    } catch {
      setMessage("Unable to load the order. Please try again.");
    }
  }
  useEffect(() => {
    // The fetch synchronizes this view with the order identified by the route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  if (!order)
    return (
      <div className="content empty-state">
        <p role="status">{message}</p>
        <Link href="/account" className="button">
          Sign in to view your orders
        </Link>
      </div>
    );
  return (
    <div className="content">
      <div className="cart-layout">
        <div>
          <p className="eyebrow">{order.order_number}</p>
          <h2 style={{ margin: "10px 0 20px" }}>
            {order.payment_status === "paid"
              ? "Thank you for your order."
              : "Your order is reserved."}
          </h2>
          <p>
            {order.customer.first_name} {order.customer.last_name} ·{" "}
            {order.customer.email}
          </p>
          <p>
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              dateStyle: "long",
            })}
          </p>
          <div className="alert">
            Payment:{" "}
            <strong>{order.payment_status.replaceAll("_", " ")}</strong>
            <br />
            Order: <strong>{order.status.replaceAll("_", " ")}</strong>
            {order.tracking_number && <p>Tracking: {order.tracking_number}</p>}
          </div>
          {order.order_items.map((i) => (
            <div className="summary-line" key={i.id}>
              <span>
                {i.title}
                <br />
                <small>
                  {i.format} × {i.quantity}
                </small>
              </span>
              <strong>
                {money(i.unit_price * i.quantity, order.currency)}
              </strong>
            </div>
          ))}
          {order.payment_status === "paid" && (
            <Link className="button" href="/account">
              View your downloads & orders ↗
            </Link>
          )}
          {bank && ["pending", "failed"].includes(order.payment_status) && (
            <section className="summary-panel" style={{ marginTop: 25 }}>
              <h2>Bank transfer instructions</h2>
              <p>
                Transfer exactly {money(order.total, order.currency)}. Include{" "}
                {order.order_number} as the payment reference.
              </p>
              <dl>
                {Object.entries(bank).map(([k, v]) => (
                  <div className="summary-line" key={k}>
                    <dt>{k.replaceAll("_", " ")}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="alert">
                The publisher must confirm your transfer before ebooks are
                released.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  setMessage("Uploading…");
                  try {
                    const r = await fetch(`/api/orders/${id}/proof`, {
                      method: "POST",
                      body: form,
                    });
                    const data = await r.json();
                    setMessage(data.message || data.error);
                  } catch {
                    setMessage("Upload failed. Please try again.");
                  }
                }}
              >
                <label>
                  Optional payment proof (PDF, JPG or PNG, up to 4 MB)
                  <input
                    type="file"
                    name="file"
                    required
                    accept="application/pdf,image/jpeg,image/png"
                  />
                </label>
                <button className="button">Submit proof for review</button>
              </form>
            </section>
          )}
          <p role="status" style={{ marginTop: 20 }}>
            {message}
          </p>
        </div>
        <aside className="summary-panel">
          <h2>Order receipt</h2>
          <p>
            Emmanuel Chibuike Nwokorie
            <br />
            Mindfield Publishing
          </p>
          {[
            ["Subtotal", order.subtotal],
            ["Shipping", order.shipping],
            ["Discount", -order.discount],
            ["Total", order.total],
          ].map(([label, value]) => (
            <div
              className={`summary-line ${label === "Total" ? "total" : ""}`}
              key={label}
            >
              <span>{label}</span>
              <span>{money(Number(value), order.currency)}</span>
            </div>
          ))}
          <p>
            Method: {order.method.replaceAll("_", " ")}
            <br />
            Reference: {order.reference}
          </p>
          <button className="button outline" onClick={() => window.print()}>
            Print receipt
          </button>
        </aside>
      </div>
    </div>
  );
}
