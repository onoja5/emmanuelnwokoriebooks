import { chromium } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
const base = process.env.AUDIT_URL || "http://localhost:3100";
const axePath = process.argv[2];
const browser = await chromium.launch({ channel: "chrome", headless: true });
const report = [];
const links = new Set();
await mkdir("docs/audit", { recursive: true });
const routes = [
  "/",
  "/books",
  "/books/weyoh-aunty-mero",
  "/books/the-agony-of-obiako",
  "/books/magnetic-resonance-imaging-in-the-tropics",
  "/about",
  "/categories",
  "/events",
  "/resources",
  "/bundles",
  "/contact",
  "/help",
  "/shipping",
  "/privacy",
  "/terms",
  "/refunds",
  "/wishlist",
  "/cart",
  "/checkout",
];
try {
  for (const width of [1440, 390, 768, 320]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(60000);
    for (const route of width === 1440
      ? routes
      : width === 390
        ? ["/", "/books/weyoh-aunty-mero", "/bundles", "/contact", "/checkout"]
        : ["/", "/books/weyoh-aunty-mero", "/bundles"]) {
      const errors = [];
      const handler = (e) => errors.push(e.message);
      page.on("pageerror", handler);
      const response = await page.goto(base + route, { waitUntil: "load" });
      for (const img of await page.locator("img:visible").all()) {
        await img.scrollIntoViewIfNeeded();
        try {
          await img.evaluate((i) => i.decode());
        } catch {
          errors.push("Image failed to decode");
        }
      }
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      const stats = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        h1: document.querySelectorAll("h1").length,
        title: document.title,
        brokenImages: [...document.images]
          .filter(
            (i) => i.offsetParent !== null && (!i.complete || !i.naturalWidth),
          )
          .map((i) => i.src),
        links: [...document.querySelectorAll("a[href]")]
          .map((a) => a.getAttribute("href"))
          .filter((h) => h.startsWith("/") && !h.startsWith("//")),
      }));
      for (const link of stats.links) links.add(link);
      delete stats.links;
      let violations = [];
      if (axePath && [1440, 390].includes(width)) {
        await page.addScriptTag({ path: axePath });
        const result = await page.evaluate(
          async () =>
            await window.axe.run(document, {
              runOnly: {
                type: "tag",
                values: ["wcag2a", "wcag2aa", "wcag21aa"],
              },
            }),
        );
        violations = result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        }));
      }
      report.push({
        width,
        route,
        status: response.status(),
        ...stats,
        errors,
        violations,
      });
      page.off("pageerror", handler);
      await writeFile(
        "docs/audit/browser-audit.json",
        JSON.stringify({ base, report }, null, 2),
      );
    }
    // Populated checkout and drawer are distinct interaction surfaces.
    if ([1440, 390].includes(width)) {
      await page.goto(base + "/books/weyoh-aunty-mero");
      await page
        .locator(".purchase-actions")
        .getByRole("button", { name: "Add to cart", exact: true })
        .click();
      for (const surface of ["drawer", "checkout"]) {
        if (surface === "checkout") {
          await page
            .getByRole("dialog")
            .getByRole("link", { name: "Review order for WhatsApp" })
            .click();
          await page.waitForURL("**/checkout/");
          await page
            .getByRole("heading", { name: "01. Your details" })
            .waitFor();
        }
        let violations = [];
        if (axePath) {
          await page.addScriptTag({ path: axePath });
          const r = await page.evaluate(
            async () =>
              await window.axe.run(document, {
                runOnly: {
                  type: "tag",
                  values: ["wcag2a", "wcag2aa", "wcag21aa"],
                },
              }),
          );
          violations = r.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({
              target: n.target,
              summary: n.failureSummary,
            })),
          }));
        }
        report.push({ width, route: surface, violations });
        await page.screenshot({
          path: `docs/audit/${width}-${surface}.png`,
          fullPage: surface !== "drawer",
        });
      }
    }
    console.log(`Audited ${width}px`);
    await context.close();
  }
  const linkResults = [];
  for (const link of links) {
    const r = await fetch(base + link);
    if (r.status >= 400) linkResults.push({ link, status: r.status });
  }
  await writeFile(
    "docs/audit/browser-audit.json",
    JSON.stringify({ base, report, brokenLinks: linkResults }, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        surfaces: report.length,
        issues: report
          .filter(
            (r) =>
              r.overflow ||
              r.errors?.length ||
              r.brokenImages?.length ||
              r.violations.length ||
              r.status >= 400,
          )
          .map((r) => ({
            width: r.width,
            route: r.route,
            overflow: r.overflow,
            errors: r.errors,
            violations: r.violations.map((v) => v.id),
          })),
        brokenLinks: linkResults,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
