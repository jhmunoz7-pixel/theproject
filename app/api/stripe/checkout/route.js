// Crea una sesión de Stripe Checkout (suscripción Premium).
// Si Stripe no está configurado responde 503 y el cliente cae al modo simulado.

import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const key = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!key || !priceId) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const uid = typeof body?.uid === "string" ? body.uid : null;
  if (!uid) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  try {
    const stripe = new Stripe(key);
    const origin = new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      metadata: { uid },
      subscription_data: { metadata: { uid } },
      success_url: `${origin}/api/stripe/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/espacio`,
    });
    return Response.json({ url: session.url });
  } catch {
    return Response.json({ error: "stripe_error" }, { status: 502 });
  }
}
