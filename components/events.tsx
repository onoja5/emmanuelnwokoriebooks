import Link from "next/link";
import { publishedEvents } from "@/lib/content";
export async function Events() {
  const events = await publishedEvents();
  if (!events.length)
    return (
      <div className="empty-state">
        <h2>New dates, coming soon.</h2>
        <p>There are no announced events at the moment.</p>
        <Link href="/contact" className="button">
          Invite Emmanuel to speak ↗
        </Link>
      </div>
    );
  return (
    <div>
      {events.map((e) => (
        <article
          key={e.id}
          style={{ padding: "30px 0", borderBottom: "1px solid var(--line)" }}
        >
          <p className="eyebrow">
            {e.event_type} ·{" "}
            {new Date(e.date).toLocaleDateString("en-GB", {
              dateStyle: "long",
            })}
          </p>
          <h2>{e.title}</h2>
          <p>{e.location}</p>
          <p>{e.description}</p>
          {e.registration_url && (
            <a
              className="button"
              href={e.registration_url}
              target="_blank"
              rel="noreferrer"
            >
              Register ↗
            </a>
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                name: e.title,
                startDate: e.date,
                location: { "@type": "Place", name: e.location },
                description: e.description,
                url: e.registration_url,
              }).replace(/</g, "\u003c"),
            }}
          />
        </article>
      ))}
    </div>
  );
}
