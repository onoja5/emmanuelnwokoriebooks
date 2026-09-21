# Mindfield Bookstore

An editorial bookstore for Emmanuel Chibuike Nwokorie. Readers can browse the catalogue, choose formats, build a cart, review delivery details, and send a complete order request directly to the author on WhatsApp. The production build is a static export for Namecheap shared hosting.

## Ordering flow

The website does not collect payment or place an order automatically.

1. A reader adds ebook or paperback editions to the cart.
2. The cart calculates book totals, collection savings, and any configured delivery fee.
3. Checkout collects only the contact and delivery details needed for fulfilment.
4. **Continue on WhatsApp** opens a prefilled message to **0704 710 0043** (`2347047100043`) with the cart and customer details.
5. Emmanuel confirms availability, the final amount, payment instructions, and fulfilment directly with the reader.

There is no active card-payment provider, webhook, database, or payment credential in the public application.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Configuration

| Variable                        | Purpose                                                                 |
| ------------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`          | Canonical public URL.                                                   |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`   | Digits-only international WhatsApp number. Defaults to `2347047100043`. |
| `NEXT_PUBLIC_PUBLISHER_EMAIL`   | Optional publisher email shown where relevant.                          |

No environment variables are required for the supplied Namecheap build. The values above are already the defaults used by the export.

The contact and newsletter forms post to `contact.php`, which uses Namecheap shared hosting’s PHP `mail()` support. Enquiries are sent to `info@emmanuelnwokoriebooks.com`; the visitor’s address is set as `Reply-To`.

## Quality checks

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run test:e2e
```

The browser audit script checks responsive pages, runtime errors, image loading, internal links, horizontal overflow, and WCAG issues when an axe bundle path is supplied.

```bash
node scripts/audit-site.mjs PATH_TO_AXE_MIN_JS
```

## Namecheap shared-hosting deployment

Run `npm run build`, then upload the **contents** of `out/` to the domain’s document root (normally `public_html`). The ready-made deployment ZIP contains those contents at its root, including `.htaccess` and `contact.php`; upload, extract, and visit the domain. Do not upload the source project or `node_modules`.

The mailbox `info@emmanuelnwokoriebooks.com` must exist and the domain’s email routing must be correct. No database, Node.js app, npm install, API keys, or cron job is required on the hosting account.

Keep ebook files in private storage. Do not place manuscripts in `public/`.
