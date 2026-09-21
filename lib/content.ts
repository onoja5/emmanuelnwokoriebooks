import "server-only";
import { defaultBundles } from "./bundles";
type PublishedEvent = {
  id: string;
  event_type: string;
  date: string;
  title: string;
  location: string;
  description: string;
  registration_url: string | null;
};
type AuthorContent = {
  portrait_url: string | null;
  biography: string | null;
};
export async function homepageSettings() {
  return {
    featured_book_id: "10000000-0000-4000-8000-000000000001",
    show_author: true,
    show_events: true,
  };
}
export async function publishedEvents(): Promise<PublishedEvent[]> {
  return [];
}
export async function publishedReviews() {
  return [] as { id: string; name: string; quote: string; rating: number }[];
}
export async function authorContent(): Promise<AuthorContent | null> {
  return null;
}
export async function activeBundles() {
  return defaultBundles;
}
