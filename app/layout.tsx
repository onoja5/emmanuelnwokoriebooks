import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/components/store-provider";
import { EnquiryLinks } from "@/components/enquiry-links";
import { CartDrawer } from "@/components/cart-drawer";
import { Header, Footer } from "@/components/header";
import { WhatsAppContact } from "@/components/whatsapp-contact";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://emmanuelnwokoriebooks.com",
  ),
  title: {
    default: "Emmanuel Chibuike Nwokorie | Books & Ideas",
    template: "%s | Emmanuel Chibuike Nwokorie",
  },
  description:
    "Discover the fiction and medical scholarship of Emmanuel Chibuike Nwokorie. Shop ebooks and paperbacks from Mindfield Publishing.",
  openGraph: {
    type: "website",
    siteName: "Mindfield Publishing",
    title: "Emmanuel Chibuike Nwokorie | Books & Ideas",
    description: "Stories that move the heart. Knowledge that moves the world.",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          id="site-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  name: "Emmanuel Chibuike Nwokorie",
                  url:
                    (process.env.NEXT_PUBLIC_SITE_URL ||
                      "https://emmanuelnwokoriebooks.com") + "/about",
                },
                {
                  "@type": "Organization",
                  name: "Mindfield Publishing",
                  url:
                    process.env.NEXT_PUBLIC_SITE_URL ||
                    "https://emmanuelnwokoriebooks.com",
                },
              ],
            }).replace(/</g, "\u003c"),
          }}
        />
        <StoreProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Header enquiry={<EnquiryLinks />} />
          <main id="main">{children}</main>
          <Footer enquiry={<EnquiryLinks />} />
          <WhatsAppContact />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
