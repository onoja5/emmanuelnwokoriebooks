import { getBooks } from "@/lib/catalog-server";
import { Catalogue } from "@/components/catalogue";
export const metadata = {
  title: "The Bookshelf",
  description:
    "Explore African fiction, faith and medical scholarship. Order ebooks and paperbacks directly from the author in NGN or USD.",
};
export default async function Books() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">THE MINDFIELD BOOKSHELF</p>
        <h1>Find your next perspective.</h1>
        <p>
          Stories to spend time with. Knowledge to return to. Browse the
          complete collection.
        </p>
      </div>
      <div className="content">
        <Catalogue books={await getBooks()} />
      </div>
    </>
  );
}
