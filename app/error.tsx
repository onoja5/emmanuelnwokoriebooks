"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="content empty-state">
      <h2>We couldn’t load this page.</h2>
      <p>Please try again in a moment.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
