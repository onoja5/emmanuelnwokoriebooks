import { test, expect } from "@playwright/test";
test("cart drawer, ebook checkout and Order Now are clear", async ({
  page,
}) => {
  await page.goto("/books/the-agony-of-obiako");
  await page
    .locator(".purchase-actions")
    .getByRole("button", { name: "Add to cart", exact: true })
    .click();
  const drawer = page.getByRole("dialog", { name: "Your cart" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("Ebook · Digital edition")).toBeVisible();
  await expect(drawer.getByText("₦0", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await page.getByRole("button", { name: "Shopping cart, 1 items" }).click();
  await expect(drawer).toBeVisible();
  await drawer.getByRole("link", { name: "Review order for WhatsApp" }).click();
  await expect(page.getByLabel("Phone number", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Street address", { exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByText("₦0", { exact: true })).toBeVisible();
  await page.goto("/books/weyoh-aunty-mero");
  await page.getByRole("button", { name: "Order now" }).click();
  await expect(page).toHaveURL(/checkout/);
});
test("collection formats, contact routing, WhatsApp and support pages", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await page.goto("/bundles");
  await page
    .getByLabel("Edition for Weyoh Aunty Mero")
    .selectOption("paperback");
  await page.getByRole("button", { name: "Add collection to cart" }).click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.locator(".drawer-item")).toHaveCount(2);
  await expect(drawer.getByText("₦5,000", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close cart" }).click();
  await page.goto("/books/magnetic-resonance-imaging-in-the-tropics");
  const wa = page.getByRole("link", {
    name: "Ask about this book on WhatsApp",
  });
  await expect(wa).toHaveAttribute("href", /wa.me\/2347047100043\?text=/);
  await page
    .getByRole("link", { name: "Request a bulk or institutional quote" })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Subject", exact: true }),
  ).toHaveValue("Bulk book order");
  for (const [path, heading] of [
    ["/events", "Invite Emmanuel to speak."],
    ["/resources", "A reading-group starting point"],
  ]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }

  let enquiry: Record<string, string> = {};
  await page.route("**/contact.php", async (route) => {
    enquiry = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true } });
  });
  await page.goto("/contact/?subject=Speaking%20invitation");
  await page.getByLabel("Your name").fill("Ada Reader");
  await page.getByLabel("Email", { exact: true }).fill("ada@example.com");
  await page
    .getByLabel("Your message")
    .fill("Please contact me about a speaking engagement.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(
    page.getByText("Thank you. Your message has reached the publisher."),
  ).toBeVisible();
  expect(enquiry).toMatchObject({
    name: "Ada Reader",
    email: "ada@example.com",
    subject: "Speaking invitation",
  });
  await page.goto("/about");
  await expect(
    page.getByText(
      "A full biography and author portrait will be published here when supplied.",
    ),
  ).toHaveCount(0);
  await page.goto("/books/weyoh-aunty-mero");
  if (info.project.name === "mobile") {
    await expect(page.locator(".mobile-purchase-bar")).toBeVisible();
    await page
      .locator(".mobile-purchase-bar")
      .getByRole("button", { name: "Add to cart" })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
  }
});
