"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { money, type Currency } from "@/lib/catalog";
type AccountData = {
  email: string;
  profile: { full_name: string; role: string } | null;
  orders: {
    id: string;
    order_number: string;
    status: string;
    total: number;
    currency: Currency;
  }[];
  downloads: {
    id: string;
    downloads: number;
    max_downloads: number;
    order_items: { title: string; variant_id: string };
  }[];
  assets: { id: string; variant_id: string; file_type: string }[];
  addresses: {
    id: string;
    label: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  }[];
};
export function Account({ initialTab = "Orders" }: { initialTab?: string }) {
  const [data, setData] = useState<AccountData | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [tab, setTab] = useState(initialTab);
  async function load() {
    try {
      const r = await fetch("/api/account");
      if (r.ok) setData(await r.json());
    } catch {}
  }
  useEffect(() => {
    fetch("/api/account")
      .then(async (r) => {
        if (r.ok) setData(await r.json());
      })
      .catch(() => {});
  }, []);
  async function save(body: object) {
    const r = await fetch("/api/account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setMessage(r.ok ? "Saved." : (await r.json()).error);
    if (r.ok) await load();
  }
  if (!data)
    return (
      <div className="content narrow">
        <h2>Your books, all in one place.</h2>
        <p>
          Sign in with the email you used at checkout to see orders and secure
          downloads. No password to remember.
        </p>
        <form
          className="form-panel"
          style={{ maxWidth: 450, marginTop: 25 }}
          onSubmit={async (e) => {
            e.preventDefault();
            setMessage("Please wait…");
            const f = new FormData(e.currentTarget);
            try {
              const r = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email,
                  ...(sent ? { token: f.get("token") } : {}),
                }),
              });
              const value = await r.json();
              if (!r.ok) {
                setMessage(value.error);
                return;
              }
              if (sent) {
                setMessage("Signed in.");
                await load();
              } else {
                setSent(true);
                setMessage("Check your email for the sign-in code.");
              }
            } catch {
              setMessage("Unable to connect. Please try again.");
            }
          }}
        >
          <label>
            Email address
            <input
              type="email"
              value={email}
              required
              onChange={(e) => {
                setEmail(e.target.value);
                setSent(false);
              }}
              autoComplete="email"
            />
          </label>
          {sent && (
            <label>
              One-time email code
              <input
                name="token"
                inputMode="numeric"
                pattern="[0-9]{6,10}"
                required
                autoComplete="one-time-code"
              />
            </label>
          )}
          <button className="button">
            {sent ? "Verify code & sign in" : "Send a sign-in code"} ↗
          </button>
          {sent && (
            <button
              className="button outline"
              type="button"
              onClick={() => setSent(false)}
              style={{ marginLeft: 12 }}
            >
              Request new code
            </button>
          )}
          <p role="status">{message}</p>
        </form>
      </div>
    );
  return (
    <div className="content">
      <div className="section-heading">
        <div>
          <p className="eyebrow">YOUR READING ROOM</p>
          <h2>
            Welcome back
            {data.profile?.full_name
              ? ", " + data.profile.full_name.split(" ")[0]
              : ""}
            .
          </h2>
          <p>{data.email}</p>
        </div>
        <button
          className="button outline"
          onClick={async () => {
            await fetch("/api/auth", { method: "DELETE" });
            setData(null);
          }}
        >
          Sign out
        </button>
      </div>
      <nav className="account-tabs">
        {["Orders", "Downloads", "Addresses", "Settings"].map((t) => (
          <button
            key={t}
            aria-pressed={tab === t}
            onClick={() => {
              setTab(t);
              setMessage("");
            }}
          >
            {t}
          </button>
        ))}
        <Link href="/wishlist">Saved books</Link>
        {data.profile?.role === "admin" && (
          <Link href="/admin">Publisher admin ↗</Link>
        )}
      </nav>
      {tab === "Orders" &&
        (data.orders.length ? (
          data.orders.map((o) => (
            <Link
              className="summary-line"
              style={{ borderBottom: "1px solid var(--line)", padding: 20 }}
              href={`/orders/${o.id}`}
              key={o.id}
            >
              <span>
                {o.order_number}
                <br />
                <small>{o.status.replaceAll("_", " ")}</small>
              </span>
              <strong>{money(o.total, o.currency)} ↗</strong>
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <h2>Your next chapter awaits.</h2>
            <p>No orders for this email yet.</p>
            <Link className="button" href="/books">
              Browse the books ↗
            </Link>
          </div>
        ))}
      {tab === "Downloads" &&
        (data.downloads.length ? (
          data.downloads.map((d) => (
            <div
              key={d.id}
              style={{
                borderBottom: "1px solid var(--line)",
                padding: "20px 0",
              }}
            >
              <h3>{d.order_items.title}</h3>
              <p>
                {Math.max(0, d.max_downloads - d.downloads)} download links
                remaining
              </p>
              {data.assets
                .filter((a) => a.variant_id === d.order_items.variant_id)
                .map((a) => (
                  <button
                    className="button"
                    key={a.id}
                    disabled={d.downloads >= d.max_downloads}
                    style={{ margin: "15px 12px 0 0" }}
                    onClick={async () => {
                      const r = await fetch("/api/downloads", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          entitlement_id: d.id,
                          asset_id: a.id,
                        }),
                      });
                      const value = await r.json();
                      if (!r.ok) setMessage(value.error);
                      else {
                        window.location.assign(value.url);
                        await load();
                      }
                    }}
                  >
                    Download {a.file_type.toUpperCase()} ↗
                  </button>
                ))}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <h2>Your digital bookshelf.</h2>
            <p>Ebooks appear here after confirmed payment.</p>
          </div>
        ))}
      {tab === "Addresses" && (
        <div className="cart-layout">
          <div>
            {data.addresses.map((a) => (
              <div
                key={a.id}
                className="summary-panel"
                style={{ marginBottom: 20 }}
              >
                <h3>{a.label}</h3>
                <p>
                  {a.address}
                  <br />
                  {a.city}, {a.state}
                  <br />
                  {a.country} {a.postal_code}
                </p>
                <button
                  className="button outline"
                  onClick={() => save({ action: "delete_address", id: a.id })}
                >
                  Remove address
                </button>
              </div>
            ))}
          </div>
          <form
            className="form-panel"
            onSubmit={(e) => {
              e.preventDefault();
              void save({
                action: "address",
                ...Object.fromEntries(new FormData(e.currentTarget)),
              });
            }}
          >
            <h2>Add an address</h2>
            {[
              "label",
              "address",
              "city",
              "state",
              "country",
              "postal_code",
            ].map((n) => (
              <label key={n}>
                {n.replaceAll("_", " ")}
                <input name={n} required={n !== "postal_code"} />
              </label>
            ))}
            <button className="button">Save address</button>
          </form>
        </div>
      )}
      {tab === "Settings" && (
        <form
          className="form-panel"
          style={{ maxWidth: 450 }}
          onSubmit={(e) => {
            e.preventDefault();
            void save({
              action: "profile",
              full_name: new FormData(e.currentTarget).get("full_name"),
            });
          }}
        >
          <label>
            Your name
            <input
              name="full_name"
              defaultValue={data.profile?.full_name}
              required
              maxLength={150}
            />
          </label>
          <p>Your sign-in email: {data.email}</p>
          <button className="button" style={{ marginTop: 20 }}>
            Save details
          </button>
        </form>
      )}
      <p role="status" style={{ marginTop: 20 }}>
        {message}
      </p>
    </div>
  );
}
