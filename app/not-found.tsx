import Link from "next/link";
export default function NotFound() {
  return (
    <div className="content empty-state">
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>A page yet to be written.</h1>
      <p>We couldn’t find the page you’re looking for.</p>
      <Link className="button" href="/books">
        Return to the bookshelf ↗
      </Link>
    </div>
  );
}
