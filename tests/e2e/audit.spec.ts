import { test, expect } from "@playwright/test";
test("cart survives disabled browser storage for the current session", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Storage disabled", "SecurityError");
    };
  });
  await page.goto("/books/weyoh-aunty-mero");
  await page
    .locator(".purchase-actions")
    .getByRole("button", { name: "Add to cart", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByText("Weyoh Aunty Mero", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Review order for WhatsApp" })
    .click();
  await expect(page.locator(".summary-panel")).toContainText(
    "Weyoh Aunty Mero",
  );
});
test("malformed saved cart and fractional quantity do not break shopping", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "mindfield-store",
      JSON.stringify({
        items: [
          null,
          {
            book: {
              id: "bad",
              prices: { ebook: {}, paperback: {} },
              variants: {},
            },
          },
        ],
        saved: [],
        currency: "NGN",
      }),
    ),
  );
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Your cart is empty." }),
  ).toBeVisible();
  await page.goto("/books/weyoh-aunty-mero");
  await page.getByRole("button", { name: "Paperback Printed edition" }).click();
  await page.getByLabel("Quantity", { exact: true }).fill("2.5");
  await page
    .locator(".purchase-actions")
    .getByRole("button", { name: "Add to cart", exact: true })
    .click();
  await expect(
    page.getByRole("dialog").getByLabel("Cart quantity for Weyoh Aunty Mero"),
  ).toHaveValue("2");
});
test("default shipping method is selected and quoted", async ({ page }) => {
  await page.goto("/books/weyoh-aunty-mero");
  await page.getByRole("button", { name: "Paperback Printed edition" }).click();
  await page.getByRole("button", { name: "Order now" }).click();
  await expect(page.getByLabel("Delivery method")).toHaveValue(
    "30000000-0000-4000-8000-000000000001",
  );
  await expect(page.locator(".summary-line.total")).toContainText("₦11,000");
});
