import "server-only";
import { books, type Book } from "./catalog";
export async function getBooks(): Promise<Book[]> {
  return books;
}
