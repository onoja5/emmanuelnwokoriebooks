"use client";
import { useState } from "react";
export function Unsubscribe({ token }: { token: string }) {
  const [message, setMessage] = useState("");
  return (
    <>
      <p style={{ margin: "25px 0" }}>
        You can stop receiving reading notes and book updates here.
      </p>
      <button
        className="button"
        onClick={async () => {
          const r = await fetch("/api/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          setMessage(
            r.ok ? "You have been unsubscribed." : (await r.json()).error,
          );
        }}
      >
        Unsubscribe
      </button>
      <p role="status">{message}</p>
    </>
  );
}
