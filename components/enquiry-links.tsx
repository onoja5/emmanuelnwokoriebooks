import Link from "next/link";
import { whatsappUrl } from "@/lib/whatsapp";
export function EnquiryLinks({
  book,
  speaking = false,
}: {
  book?: string;
  speaking?: boolean;
}) {
  const email =
    process.env.NEXT_PUBLIC_PUBLISHER_EMAIL || "info@emmanuelnwokoriebooks.com";
  const message = book
    ? `Hello Emmanuel, I’m interested in ${book}. Please can you confirm availability, price and how to order?`
    : speaking
      ? "Hello, I would like to invite Emmanuel to speak. Please can we discuss the event?"
      : "Hello Emmanuel, I have an enquiry about your books.";
  return (
    <div className="enquiry-links">
      <a
        className="text-link"
        href={whatsappUrl(message)}
        target="_blank"
        rel="noreferrer"
      >
        {book
          ? "Ask about this book on WhatsApp"
          : "WhatsApp Emmanuel · 0704 710 0043"}{" "}
        ↗
      </a>
      {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
        <a
          className="text-link"
          href={`mailto:${email}?subject=${encodeURIComponent(speaking ? "Speaking invitation" : book || "Publisher enquiry")}`}
        >
          Email the publisher ↗
        </a>
      )}
      <Link
        className="text-link"
        href={`/contact?subject=${encodeURIComponent(speaking ? "Speaking invitation" : "General enquiry")}${book ? `&book=${encodeURIComponent(book)}` : ""}`}
      >
        Send an enquiry ↗
      </Link>
    </div>
  );
}
