# Validation status

Date: 19 September 2026.

The current customer purchase path sends a prepared order request to Emmanuel on WhatsApp at `2347047100043`. It does not initialize or verify an online payment.

## Verified locally

- `npm test`: 40 tests passed across six files.
- `npm run lint`: passed with no errors or warnings.
- `npm run typecheck`: passed.
- `npm run build`: passed on Next.js 16.3.5 and generated a complete static export in `out/`; the exported route table contains no application API routes.
- `npm run test:e2e`: 20 desktop and mobile scenarios passed.
- Responsive browser and WCAG sweep of the static export: 34 surfaces checked at 1440, 768, 390, and 320 pixels; zero reported accessibility violations, runtime errors, broken images, broken internal links, or horizontal overflow.
- Lighthouse mobile, three local production runs: performance 65–96 (median 90), accessibility 100, best practices 100, and SEO 100. The median run measured LCP 3.4 s, TBT 160 ms, and CLS 0. Recheck performance on the production host because local CPU-throttled results varied materially.

## Coverage

- Unit tests cover cart normalization, catalogue totals, shipping and collection discounts, HTML email escaping, and WhatsApp URL/message generation.
- Playwright runs against the generated static export and covers desktop and mobile catalogue browsing, format choice, quantities, cart persistence, delivery selection, the exact WhatsApp destination and order-message contents, contact-form payloads, search, saved books, navigation, removed server-route denial, and responsive overflow.
- The browser audit checks all public routes at 1440, 768, 390, and 320 pixel widths, plus populated cart and checkout surfaces.

## Launch dependencies

- Confirm the production catalogue, inventory, biography, bibliographic data, samples, delivery timing, and policy copy with the publisher.
- Upload and extract the prepared ZIP in the domain document root, normally `public_html`.
- Confirm that `info@emmanuelnwokoriebooks.com` exists and submit a live contact-form test after upload. PHP syntax and payload behavior are validated locally, but only Namecheap can execute and deliver the live mail.
- Test the published WhatsApp link on real Android and iOS devices and confirm the number remains owned and monitored by Emmanuel.

The final command results and browser-audit evidence are recorded after each release candidate is checked.
