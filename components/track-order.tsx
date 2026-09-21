"use client";
import { useState } from "react";
import Link from "next/link";
type Tracking = {
  order_number: string;
  status: string;
  tracking_number: string | null;
};
export function TrackOrder() {
  const [result, setResult] = useState<Tracking | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="content narrow">
      <form
        className="form-panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setResult(null);
          setBusy(true);
          setMessage("");
          try {
            const r = await fetch("/api/track-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                Object.fromEntries(new FormData(e.currentTarget)),
              ),
            });
            const data = await r.json();
            if (r.ok) setResult(data);
            else setMessage(data.error);
          } catch {
            setMessage("Unable to connect. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Order number
          <input
            name="order_number"
            required
            maxLength={40}
            placeholder="ECN-2026-000001"
            autoCapitalize="characters"
          />
        </label>
        <label>
          Purchase email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <button className="button" disabled={busy}>
          {busy ? "Checking…" : "Track order"}
        </button>
        <p role="status">{message}</p>
      </form>
      {result && (
        <div className="trust-panel" role="status">
          <p className="eyebrow">{result.order_number}</p>
          <h2>{result.status.replaceAll("_", " ")}</h2>
          {result.tracking_number ? (
            <p>
              Tracking reference: <strong>{result.tracking_number}</strong>
            </p>
          ) : (
            <p>
              A tracking reference will appear when supplied by the publisher.
            </p>
          )}
          <Link className="text-link" href="/account">
            Sign in for full order details ↗
          </Link>
        </div>
      )}
      <p>
        For ebooks, visit{" "}
        <Link className="text-link" href="/downloads">
          My Downloads
        </Link>
        . For delivery assistance,{" "}
        <Link className="text-link" href="/contact?subject=Order%20support">
          contact the publisher
        </Link>
        .
      </p>
    </section>
  );
}
