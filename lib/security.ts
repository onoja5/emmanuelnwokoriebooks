import { createHmac, timingSafeEqual } from "node:crypto";
export function accessToken(
  orderId: string,
  secret: string,
  expires = Date.now() + 86400000,
) {
  const payload = Buffer.from(JSON.stringify({ orderId, expires })).toString(
    "base64url",
  );
  return (
    payload +
    "." +
    createHmac("sha256", secret).update(payload).digest("base64url")
  );
}
export function validAccess(
  token: string | undefined,
  orderId: string,
  secret: string,
) {
  try {
    if (!token) return false;
    const [payload, signature] = token.split(".");
    const expected = createHmac("sha256", secret).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return false;
    const value = JSON.parse(Buffer.from(payload, "base64url").toString());
    return value.orderId === orderId && value.expires > Date.now();
  } catch {
    return false;
  }
}
