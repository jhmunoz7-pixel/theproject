// Regreso del Checkout: verifica el pago directamente con Stripe y activa
// Premium en Supabase para esa usuaria (escritura con service role).

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const back = new URL("/espacio", url.origin);

  const key = process.env.STRIPE_SECRET_KEY;
  const sessionId = url.searchParams.get("session_id");
  if (!key || !sessionId) return Response.redirect(back, 303);

  try {
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const uid = session?.metadata?.uid;
    const paid = session?.payment_status === "paid" || session?.status === "complete";

    if (uid && paid) {
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } },
      );
      await admin.from("user_kv").upsert(
        { user_id: uid, key: "tp:premium", value: true, updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" },
      );
      back.searchParams.set("premium", "activada");
    }
  } catch {}

  return Response.redirect(back, 303);
}
