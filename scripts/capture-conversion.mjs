import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome", headless: true });
await mkdir("docs/previews", { recursive: true });
try {
  for (const [name, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    for (const [label, path] of [
      ["home", "/"],
      ["product", "/books/weyoh-aunty-mero"],
      ["bundles", "/bundles"],
      ["contact", "/contact"],
    ]) {
      await page.goto("http://localhost:3000" + path, {
        waitUntil: "networkidle",
      });
      await page.addStyleTag({
        content: "html {scroll-behavior:auto!important}",
      });
      for (const img of await page.locator("img:visible").all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((el) => el.decode());
      }
      await page.evaluate(async () => {
        window.scrollTo({ top: 0, behavior: "instant" });
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
      });
      await page.screenshot({
        path: `docs/previews/conversion-${name}-${label}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      if (overflow) throw Error(`${name} ${label} overflows`);
    }
    await page.goto("http://localhost:3000/books/weyoh-aunty-mero");
    await page
      .locator(".purchase-actions")
      .getByRole("button", { name: "Add to cart", exact: true })
      .click();
    await page.screenshot({
      path: `docs/previews/conversion-${name}-drawer.png`,
    });
    await page
      .getByRole("dialog")
      .getByRole("link", { name: "Review order for WhatsApp" })
      .click();
  await page.waitForURL("**/checkout/");
    await page.getByRole("heading", { name: "01. Your details" }).waitFor();
    await page.waitForLoadState("networkidle");
    await page.locator("body").click({ position: { x: 2, y: 2 } });
    await page.screenshot({
      path: `docs/previews/conversion-${name}-checkout.png`,
      fullPage: true,
    });
    console.log(
      `${name}: home, product, bundle, contact, cart and checkout captured; page widths pass`,
    );
    await context.close();
  }
} finally {
  await browser.close();
}
