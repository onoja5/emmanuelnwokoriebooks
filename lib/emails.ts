export const templates: Record<
  string,
  { subject: string; heading: string; body: string }
> = {
  welcome: {
    subject: "Welcome to the reading list",
    heading: "A new chapter begins.",
    body: "Thank you for joining Emmanuel’s reading list. Expect notes, new books and thoughtful ideas.",
  },
  order_received: {
    subject: "Your Mindfield order has been received",
    heading: "Your next chapter is reserved.",
    body: "We have received your order. Payment confirmation is the next step. Visit your order for details.",
  },
  payment_successful: {
    subject: "Payment confirmed",
    heading: "Thank you for your purchase.",
    body: "Your payment is confirmed. Your order page contains your receipt and the latest fulfilment status.",
  },
  payment_failed: {
    subject: "Your payment needs attention",
    heading: "Let’s finish your order.",
    body: "Your payment has not been confirmed. Visit your order page to check or retry payment.",
  },
  bank_transfer_instructions: {
    subject: "Your bank transfer instructions",
    heading: "One more step.",
    body: "Open your secure order page for the bank details and exact amount. Include your order number in the transfer reference.",
  },
  bank_transfer_confirmed: {
    subject: "Your bank transfer is confirmed",
    heading: "Payment received.",
    body: "The publisher has confirmed your bank transfer. Your books are moving to the next step.",
  },
  ebook_ready: {
    subject: "Your ebook is ready",
    heading: "Your next read is here.",
    body: "Sign in with this purchase email to access your ebook in My Downloads. Each download link is private and expires shortly after it is issued.",
  },
  paperback_processing: {
    subject: "We are preparing your paperback",
    heading: "From our bookshelf to yours.",
    body: "Your paperback order is being prepared. You can follow its progress in your reading room.",
  },
  paperback_shipped: {
    subject: "Your paperback has shipped",
    heading: "Your book is on its way.",
    body: "Your order has been marked as shipped. Open your order page for any tracking details supplied by the publisher.",
  },
  order_delivered: {
    subject: "Your order has been delivered",
    heading: "Time to turn the first page.",
    body: "Your order has been marked as delivered. If something is not right, contact the publisher with your order number.",
  },
  password_reset: {
    subject: "Access your reading room",
    heading: "Your books are waiting.",
    body: "This store uses one-time email sign-in codes. Return to the account page to request a new code; no password reset is needed.",
  },
  contact_acknowledgement: {
    subject: "We have received your message",
    heading: "Thank you for writing.",
    body: "Your enquiry has reached Mindfield Publishing. The publisher will respond to the email address you provided.",
  },
};
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function renderEmail(
  template: string,
  payload: Record<string, string>,
  site: string,
  orderId?: string,
  unsubscribeToken?: string,
) {
  const t = templates[template] || templates.order_received;
  const link = orderId ? `${site}/orders/${orderId}` : `${site}/account`;
  const order = payload.order_number
    ? `<p style="letter-spacing:1px;font-size:12px">${escapeHtml(payload.order_number)}</p>`
    : "";
  return {
    subject: t.subject,
    html: `<!doctype html><html><body style="margin:0;background:#f7f2ea;font-family:Arial,sans-serif;color:#17212b"><table role="presentation" width="100%"><tr><td align="center" style="padding:40px 20px"><table role="presentation" width="560" style="max-width:100%;background:white"><tr><td style="padding:38px"><p style="font-size:11px;letter-spacing:2px;color:#b8613e">MINDFIELD PUBLISHING</p><h1 style="font:36px Georgia,serif">${escapeHtml(t.heading)}</h1>${order}<p style="line-height:1.8;color:#6e6a64">${escapeHtml(t.body)}</p><a href="${escapeHtml(link)}" style="display:inline-block;background:#17212b;color:white;padding:15px 22px;text-decoration:none;margin:18px 0">${orderId ? "View your order" : "Your reading room"} →</a><hr style="border:0;border-top:1px solid #dedad4"><p style="font-size:12px;color:#6e6a64">Emmanuel Chibuike Nwokorie<br>Mindfield Publishing</p>${unsubscribeToken ? `<p><a href="${escapeHtml(site)}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}">Unsubscribe from the reading list</a></p>` : ""}</td></tr></table></td></tr></table></body></html>`,
  };
}
