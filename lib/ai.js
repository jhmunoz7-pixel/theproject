"use client";

// IA vía nuestro backend — /api/claude protege la API key en el servidor.
export async function askClaude(prompt, system, maxTokens = 800) {
  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, system, maxTokens }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.text || null;
  } catch {
    return null;
  }
}

// Convierte una respuesta "una por línea" en lista limpia.
export function parseLines(text, max = 12) {
  if (!text) return [];
  return text
    .split("\n")
    .map((s) => s.replace(/^[-•*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}
