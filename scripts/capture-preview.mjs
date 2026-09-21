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
    await page.goto(process.env.PREVIEW_URL || "http://localhost:3100", {
      waitUntil: "networkidle",
    });
    await page.addStyleTag({
      content: "html { scroll-behavior: auto !important; }",
    });
    for (const img of await page.getByRole("img").all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(async (el) => {
        await el.decode();
      });
    }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({
      path: `docs/previews/${name}.png`,
      fullPage: true,
      animations: "disabled",
      caret: "initial",
    });
    console.log(
      name,
      await page.evaluate(() => ({
        heroCount: document.querySelectorAll(".hero").length,
        width: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        imagesLoaded: [...document.images].every(
          (i) => i.complete && i.naturalWidth > 0,
        ),
      })),
    );
    await context.close();
  }
} finally {
  await browser.close();
}
