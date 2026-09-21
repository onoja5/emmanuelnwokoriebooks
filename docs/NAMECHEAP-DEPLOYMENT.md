# Namecheap shared-hosting deployment

The prepared ZIP is a static website package. It does not require a database, a Node.js application, npm, API keys, or environment variables on Namecheap.

## Upload

1. Sign in to Namecheap and open cPanel.
2. Open **File Manager** and enter the domain’s document root. For the primary domain this is normally `public_html`; for an addon domain, use the document root shown under **Domains**.
3. Back up or remove the previous website files from that document root.
4. Upload `emmanuelnwokoriebooks-namecheap.zip`.
5. Extract it in the document root. `index.html`, `contact.php`, `.htaccess`, `_next/`, `books/`, and the other page folders must sit directly in that folder, with no extra outer folder.
6. Visit `https://emmanuelnwokoriebooks.com` and test a book order, WhatsApp enquiry, contact message, and newsletter submission.

## Contact email

`contact.php` sends contact and newsletter submissions to:

`info@emmanuelnwokoriebooks.com`

The mailbox must already exist and the domain’s email routing must be correct. The handler sends from `website@emmanuelnwokoriebooks.com` and sets the visitor’s email as `Reply-To`. Namecheap states that PHP `mail()` on shared hosting can use a sender on the hosted domain without creating that sender mailbox.

After uploading, submit one test message and check the Inbox and Spam folders. If it does not arrive, use cPanel **Track Delivery** and verify the domain’s **Email Routing** setting. SMTP can be added later if stronger deliverability is required.

References: [Namecheap File Manager](https://www.namecheap.com/support/knowledgebase/article.aspx/9700/29/how-to-use-file-manager-in-cpanel/), [Namecheap contact-form configuration](https://www.namecheap.com/support/knowledgebase/article/10038/31/how-to-configure-a-contact-form-with-us/).
