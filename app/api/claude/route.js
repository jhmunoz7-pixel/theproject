// Ruta de servidor que habla con Anthropic. La ANTHROPIC_API_KEY vive solo aquí
// (en el servidor) — el navegador llama a /api/claude, nunca a api.anthropic.com.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

const DEFAULT_SYSTEM =
  "Eres la guía cálida de The Project, un espacio de bienestar y productividad consciente para mujeres profesionales en LATAM. Hablas español con ortografía y acentos impecables, cercano, breve y humano. Nunca das consejos médicos.";

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "not_configured", text: null },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request", text: null }, { status: 400 });
  }

  const { prompt, system, maxTokens } = body || {};
  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "bad_request", text: null }, { status: 400 });
  }

  const max_tokens = Math.min(Math.max(Number(maxTokens) || 800, 1), 2000);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens,
        system: typeof system === "string" && system ? system : DEFAULT_SYSTEM,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      return Response.json(
        { error: "upstream", text: null },
        { status: 502 },
      );
    }

    const data = await res.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return Response.json({ text });
  } catch {
    return Response.json({ error: "network", text: null }, { status: 502 });
  }
}
