import type { MetadataRoute } from "next";
import { getBooks } from "@/lib/catalog-server";
export const dynamic = "force-static";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://emmanuelnwokoriebooks.com";
  return [
    "",
    "/books",
    "/about",
    "/categories",
    "/bundles",
    "/events",
    "/resources",
    "/help",
    "/contact",
    "/shipping",
    ...(await getBooks()).map((b) => "/books/" + b.slug),
  ].map((path) => ({
    url: base + path,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
