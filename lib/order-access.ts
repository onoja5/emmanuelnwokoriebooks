import "server-only";
import { cookies } from "next/headers";
import { adminDb, authDb } from "./db";
import { validAccess } from "./security";
export async function ownedOrder(id: string) {
  const db = adminDb();
  const { data: order } = await db
    .from("orders")
    .select("*,order_items(*)")
    .eq("id", id)
    .single();
  if (!order) throw Error("FORBIDDEN");
  const secret = process.env.ORDER_ACCESS_SECRET;
  const jar = await cookies();
  if (secret && validAccess(jar.get("order_" + id)?.value, id, secret))
    return order;
  const auth = await authDb();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (user?.email_confirmed_at) {
    const { data: profile } = await db
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role === "admin") return order;
  }
  if (
    !user?.email_confirmed_at ||
    user.email?.toLowerCase() !== order.email.toLowerCase()
  )
    throw Error("UNAUTHORIZED");
  return order;
}
