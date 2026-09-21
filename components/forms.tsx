"use client";
import { useState, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
export function Newsletter() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="newsletter">
      <div>
        <p className="eyebrow">A LETTER, EVERY SO OFTEN</p>
        <h2>A little more to think about.</h2>
        <p>Notes, new books and ideas from Emmanuel. Straight to your inbox.</p>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const form = new FormData(e.currentTarget);
          try {
            const r = await fetch("/contact.php", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: "newsletter",
                email: form.get("email"),
                website: form.get("website"),
              }),
            });
            const data = await r.json();
            setMessage(r.ok ? "Thank you. You’re on the list." : data.error);
          } catch {
            setMessage("Unable to connect. Please try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label htmlFor="newsletter-email">Your email address</label>
        <div className="newsletter-input">
          <input
            id="newsletter-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />
          <button disabled={busy} aria-label="Subscribe to newsletter">
            <ArrowRight />
          </button>
        </div>
        <input
          className="honeypot"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <small>Just thoughtful reading. Unsubscribe whenever you like.</small>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
export function ContactForm({
  subject,
  book,
}: {
  subject?: string;
  book?: string;
}) {
  const [message, setMessage] = useState("");
  const search = useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => "",
  );
  const query = new URLSearchParams(search);
  const resolved = {
    subject: subject || query.get("subject") || undefined,
    book: book || query.get("book") || undefined,
  };
  return (
    <form
      key={`${resolved.subject || "general"}:${resolved.book || ""}`}
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setMessage("Sending…");
        try {
          const r = await fetch("/contact.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(f)),
          });
          setMessage(
            r.ok
              ? "Thank you. Your message has reached the publisher."
              : (await r.json()).error,
          );
        } catch {
          setMessage("Unable to connect. Please try again.");
        }
      }}
    >
      <label>
        Your name
        <input name="name" required maxLength={120} />
      </label>
      <label>
        Email
        <input type="email" name="email" required />
      </label>
      <label>
        Subject
        <select name="subject" defaultValue={resolved.subject}>
          <option>General enquiry</option>
          <option>Reading sample</option>
          <option>Media &amp; permissions</option>
          <option>Bulk book order</option>
          <option>Speaking invitation</option>
          <option>International shipping quote</option>
          <option>Order support</option>
        </select>
      </label>
      <label>
        Your message
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
          defaultValue={
            resolved.subject === "Bulk book order"
              ? `Book title: ${resolved.book || ""}\nFormat (ebook/paperback): \nQuantity: \nInstitution: \nDelivery destination: \nRequired date: `
              : resolved.subject === "Speaking invitation"
                ? "Event name: \nDate: \nLocation / online: \nAudience: \nProposed topic: "
                : resolved.book
                  ? `Hello, I’m interested in ${resolved.book}. Please can you assist me with ordering?`
                  : ""
          }
        />
      </label>
      <input
        name="website"
        className="honeypot"
        tabIndex={-1}
        aria-hidden="true"
      />
      <button className="button">
        Send message <ArrowRight size={18} />
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
