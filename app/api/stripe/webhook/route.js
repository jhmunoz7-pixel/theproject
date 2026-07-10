// Webhook de Stripe: desactiva Premium cuando la suscripción se cancela
// o deja de pagarse. Configurar en Stripe → Developers → Webhooks apuntando
// a /api/stripe/webhook con los eventos customer.subscription.updated/deleted.

import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INACTIVE = new Set(["canceled", "unpaid", "incomplete_expired", "paused"]);

export async function POST(req) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  let event;
  try {
    const stripe = new Stripe(key);
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    event = stripe.webhooks.constructEvent(body, sig, whSecret);
  } catch {
    return Response.json({ error: "bad_signature" }, { status: 400 });
  }

  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object;
    const uid = sub?.metadata?.uid;
    const active = sub?.status && !INACTIVE.has(sub.status);
    if (uid && (event.type === "customer.subscription.deleted" || !active)) {
      try {
        const admin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY,
          { auth: { persistSession: false } },
        );
        await admin.from("user_kv").upsert(
          { user_id: uid, key: "tp:premium", value: false, updated_at: new Date().toISOString() },
          { onConflict: "user_id,key" },
        );
      } catch {}
    }
  }

  return Response.json({ received: true });
}
