import "server-only";
import { createHash } from "node:crypto";
import { ZodError } from "zod";
import { adminDb } from "./db";
export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(siteUrl()).origin) throw Error("FORBIDDEN");
}
export async function rateLimit(
  request: Request,
  key: string,
  limit = 20,
  seconds = 60,
) {
  const ip =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-nf-client-connection-ip") ||
    "shared";
  const hash = createHash("sha256")
    .update(key + ":" + ip)
    .digest("hex");
  const { data, error } = await adminDb().rpc("enforce_rate_limit", {
    p_key: hash,
    p_limit: limit,
    p_seconds: seconds,
  });
  if (error) throw Error("SERVICE_UNAVAILABLE");
  if (!data) throw Error("RATE_LIMIT");
}
export async function readJson(request: Request) {
  const raw = await request.text();
  if (raw.length > 32768) throw Error("INVALID_INPUT");
  try {
    return JSON.parse(raw);
  } catch {
    throw Error("INVALID_INPUT");
  }
}
export function failure(error: unknown) {
  const msg = error instanceof Error ? error.message : "UNKNOWN";
  const errors: Record<string, [number, string]> = {
    SERVICE_UNAVAILABLE: [
      503,
      "The store is being prepared for online orders. Please try again later.",
    ],
    UNAUTHORIZED: [401, "Please sign in with your purchase email."],
    FORBIDDEN: [403, "You do not have access to this action."],
    RATE_LIMIT: [429, "Too many requests. Please try again shortly."],
    INVALID_INPUT: [400, "Please check your details and try again."],
  };
  if (error instanceof ZodError)
    return Response.json(
      { error: "Please check your details and try again." },
      { status: 400 },
    );
  const known = errors[msg];
  if (known) return Response.json({ error: known[1] }, { status: known[0] });
  console.error("Store request failed", {
    category: msg.startsWith("Payment") ? "payment" : "application",
  });
  return Response.json(
    {
      error:
        "We couldn’t complete that request. Please try again or contact the publisher.",
    },
    { status: 500 },
  );
}
