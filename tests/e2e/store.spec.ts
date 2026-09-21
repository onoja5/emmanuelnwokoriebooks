import { test, expect } from "@playwright/test";
test("ebook and paperback variants, currency persistence, mixed shipping, guest checkout", async ({
  page,
}) => {
  await page.goto("/books/weyoh-aunty-mero");
  await page
    .locator(".purchase-actions")
    .getByRole("button", { name: "Add to cart", exact: true })
    .click();
  await page.getByRole("button", { name: "Close cart", exact: true }).click();
  await page.getByRole("button", { name: "Paperback Printed edition" }).click();
  await page.getByLabel("Quantity", { exact: true }).fill("2");
  await page
    .locator(".purchase-actions")
    .getByRole("button", { name: "Add to cart", exact: true })
    .click();
  await page.getByRole("button", { name: "Close cart", exact: true }).click();
  await page.goto("/cart");
  await expect(page.getByText("₦20,000", { exact: true })).toBeVisible();
  await page.getByLabel("Currency", { exact: true }).selectOption("USD");
  await expect(
    page.getByText("Confirm on WhatsApp", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Delivery method")
    .selectOption({ label: "Abuja pickup" });
  await expect(
    page.locator(".summary-line.total").getByText("$11", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Currency", { exact: true })).toHaveValue("USD");
  await page.getByLabel("Currency", { exact: true }).selectOption("NGN");
  await page.getByRole("link", { name: "Order via WhatsApp" }).click();
  await expect(page.getByLabel("Delivery method")).toHaveValue(
    "30000000-0000-4000-8000-000000000002",
  );
  await expect(page.getByLabel("Street address", { exact: true })).toHaveCount(
    0,
  );
  await page
    .getByLabel("Delivery method")
    .selectOption({ label: "Nigeria delivery" });
  await page.getByLabel("First name", { exact: true }).fill("Test");
  await page.getByLabel("Last name", { exact: true }).fill("Reader");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("test@example.com");
  await page.getByLabel("Phone number", { exact: true }).fill("08000000000");
  await page.getByLabel("Street address", { exact: true }).fill("Test address");
  await page.getByLabel("City", { exact: true }).fill("Abuja");
  await page.getByLabel("State / region", { exact: true }).fill("FCT");
  await page.getByRole("checkbox").check();
  let whatsappRequest = "";
  await page.route("https://wa.me/**", async (route) => {
    whatsappRequest = route.request().url();
    await route.abort();
  });
  await page.getByRole("button", { name: "Continue on WhatsApp" }).click();
  await expect.poll(() => whatsappRequest).toContain("wa.me/2347047100043");
  const message = new URL(whatsappRequest).searchParams.get("text") || "";
  expect(message).toContain("Weyoh Aunty Mero");
  expect(message).toContain("Format: Ebook");
  expect(message).toContain("Format: Paperback");
  expect(message).toContain("Quantity: 2");
  expect(message).toContain("Name: Test Reader");
  expect(message).toContain("Address: Test address");
  expect(message).toContain("Estimated order total: ₦20,000");
});
test("search, category filter and wishlist", async ({ page }) => {
  await page.goto("/books");
  await page.getByRole("searchbox").fill("Obiako");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Save The Agony of Obiako" }).click();
  await page.goto("/wishlist");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await page.goto("/books?category=Medical%20Imaging");
  await expect(page.locator(".book-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", {
      name: "Magnetic Resonance Imaging in the Tropics",
    }),
  ).toBeVisible();
});
test("digital cart free shipping and remove", async ({ page }) => {
  await page.goto("/books/weyoh-aunty-mero");
  await page
    .locator(".purchase-actions")
    .getByRole("button", { name: "Add to cart", exact: true })
    .click();
  await page.getByRole("button", { name: "Close cart", exact: true }).click();
  await page.goto("/cart");
  await expect(
    page.getByText("Digital delivery", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("₦0", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Weyoh Aunty Mero ebook" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your cart is empty." }),
  ).toBeVisible();
});
test("navigation, responsive layout and SEO", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Books", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Find your next perspective." }),
    ).toBeVisible();
  }
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  for (const image of await page.getByRole("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (img) =>
            (img as HTMLImageElement).complete &&
            (img as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/home-${info.project.name}.png`,
    fullPage: true,
  });
  await page.goto("/books/weyoh-aunty-mero");
  await expect(page).toHaveTitle(/Weyoh Aunty Mero/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "Weyoh Aunty Mero",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    2,
  );
});
test("removed server routes and private files are unavailable", async ({
  request,
}) => {
  const admin = await request.get("/api/admin/orders");
  expect(admin.status()).toBe(404);
  const file = await request.get("/ebooks/Weyoh%20Aunty%20Mero.epub");
  expect(file.status()).toBe(404);
  const removedCheckout = await request.post("/api/checkout", { data: {} });
  expect(removedCheckout.status()).toBe(404);
});
