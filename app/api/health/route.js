// Diagnóstico: presencia de configuración, a qué proyecto apunta cada valor
// de Supabase y si el servidor logra conectarse. Identificadores públicos
// únicamente — nunca expone llaves ni valores completos.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;

  let urlHost = null;
  try {
    urlHost = new URL(url.trim()).host;
  } catch {}

  // El anon key es un JWT cuyo payload trae el ref del proyecto (dato público).
  let keyProject = null;
  try {
    const payload = JSON.parse(
      Buffer.from(anon.trim().split(".")[1], "base64").toString("utf8"),
    );
    keyProject = payload.ref || null;
  } catch {}

  // Prueba de conexión real desde el servidor.
  let reachable = null;
  if (url && anon) {
    try {
      const r = await fetch(`${url.trim().replace(/\/+$/, "")}/auth/v1/health`, {
        headers: { apikey: anon.trim() },
        cache: "no-store",
      });
      reachable = r.ok;
    } catch {
      reachable = false;
    }
  }

  return Response.json({
    supabase_url: Boolean(url),
    supabase_anon_key: Boolean(anon),
    url_host: urlHost,
    key_project: keyProject,
    url_and_key_match: Boolean(urlHost && keyProject && urlHost.startsWith(keyProject + ".")),
    supabase_reachable: reachable,
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID),
  });
}
