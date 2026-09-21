# Architecture

Mindfield is a Next.js App Router storefront exported as static HTML, CSS, and JavaScript for Namecheap shared hosting. Product prices use integer minor units with explicit NGN and USD values.

## WhatsApp ordering

The browser owns the draft cart. The checkout screen validates its visible form fields, builds a readable order summary, URL-encodes it, and opens `https://wa.me/2347047100043`. The summary includes editions, quantities, book subtotal, collection discount, delivery status, estimated total, contact details, and delivery details.

The website does not claim that checkout has placed or paid for an order. It tells the reader to review and send the message, then wait for Emmanuel to confirm availability, the final amount, payment instructions, and fulfilment.

No active card-payment endpoint, hosted checkout initializer, payment webhook, Node.js server, or database exists in the deployed application.

## Data and trust boundaries

- Cart state is stored locally in the browser and validated before it is restored.
- Catalogue prices, available formats, shipping, and collection rules come from the static application catalogue.
- International or unsupported-currency delivery is marked for confirmation rather than silently converted.
- WhatsApp is an external handoff reached only after the reader submits the checkout form.
- The contact and newsletter forms submit to a same-origin PHP handler with origin checks, validation, a honeypot, and per-IP throttling. It sends mail to `info@emmanuelnwokoriebooks.com` and stores no submission database.

## Deployment

Upload the contents of `out/` to the Namecheap document root. Apache serves the static pages and executes `contact.php`. No Node.js application or database configuration is required.
