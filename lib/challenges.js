"use client";

// ─── Reto del mes ───────────────────────────────────────────
// Los retos viven en la tabla `challenges` de Supabase para poder
// cambiarlos mes con mes sin tocar código: se inserta una fila nueva
// y se marca `active = true` (y el anterior en false). La app siempre
// muestra el reto activo más reciente. Sin Supabase configurado (o si
// la tabla está vacía), cae al reto AWAKE embebido.

import { supabase } from "@/lib/store";

// Reto AWAKE · 21 días — el primer reto (fallback y semilla)
export const AWAKE = {
  slug: "awake",
  title: "AWAKE",
  subtitle: "21 días para despertar",
  hashtag: "#Awake21",
  closing: {
    title: "El reto termina. El viaje empieza.",
    text: "Despertaste. Ahora sigue el camino en comunidad: tu lugar en The Project ya te espera.",
  },
  phases: [
    { from: 1, to: 7, title: "Mirar hacia adentro", sub: "Conócete de verdad, sin filtros." },
    { from: 8, to: 14, title: "Encontrar claridad", sub: "Aprende a pensar distinto." },
    { from: 15, to: 21, title: "Dar el primer paso", sub: "De la reflexión a la acción." },
  ],
  days: [
    { n: 1, title: "El punto de partida", prompt: "Bienvenida a AWAKE. Antes de empezar: en una palabra, ¿cómo te sientes con tu vida hoy?" },
    { n: 2, title: "Tu martes ideal", prompt: "Imagina un martes normal de tu vida ideal. No las vacaciones — un día común. ¿Dónde despiertas? ¿Qué haces?" },
    { n: 3, title: "Momentos de flow", prompt: "¿Cuándo fue la última vez que perdiste la noción del tiempo haciendo algo? Eso es una pista." },
    { n: 4, title: "La envidia sana", prompt: "¿A quién admiras tanto que te da un poquito de envidia? ¿Qué exactamente de su vida?" },
    { n: 5, title: "Tus no-negociables", prompt: "¿Qué NO estás dispuesta a sacrificar por ningún trabajo ni logro? Nómbralo." },
    { n: 6, title: "La niña que fuiste", prompt: "¿Qué te ilusionaba de niña que dejaste de hacer? A veces la respuesta está en el pasado." },
    { n: 7, title: "Cierre de semana", prompt: "Relee tus respuestas de la semana. ¿Qué palabra o idea se repite? Ese es tu hilo." },
    { n: 8, title: "La duda como brújula", prompt: "Eso que quieres pero dudas en querer… escríbelo. La duda no te frena, te señala lo que importa." },
    { n: 9, title: "Silencio estratégico", prompt: "Hoy: 15 minutos sin celular. Solo camina o siéntate. ¿Qué idea llegó cuando dejaste de exprimir?" },
    { n: 10, title: "Menos es más", prompt: "Elimina UNA decisión que te drena cada día (qué comer, qué ponerte). Conviértela en regla fija." },
    { n: 11, title: "Miedo real vs inventado", prompt: "Eso que quieres intentar: ¿qué te frena de verdad? ¿Es un miedo real o uno inventado?" },
    { n: 12, title: "Carta a tu yo futuro", prompt: "Escríbele unas líneas a tu yo de dentro de 5 años. ¿Cómo vive? ¿Qué logró?" },
    { n: 13, title: "Lo que ya sabes", prompt: "Completa esta frase sin pensarlo mucho: “En realidad, lo que quiero es…”" },
    { n: 14, title: "Cierre de semana", prompt: "Ya tienes más claridad. Ponle palabras: tu “qué quiero” en una sola frase." },
    { n: 15, title: "El paso más pequeño", prompt: "¿Cuál es el paso MÁS pequeño que podrías dar esta semana hacia eso que quieres?" },
    { n: 16, title: "Tu meta clara", prompt: "Convierte tu deseo en meta: de dónde estás (X) a dónde quieres llegar (Y). ¿Para cuándo?" },
    { n: 17, title: "Imagina que ya empezaste", prompt: "Cierra los ojos: ya diste el primer paso. ¿Cómo se siente? ¿Qué cambió?" },
    { n: 18, title: "Rituales que sostienen", prompt: "¿Qué actividad te recarga de verdad? Agéndala esta semana como cita fija." },
    { n: 19, title: "Tu red de apoyo", prompt: "¿Quién va contigo en esto? Etiqueta o escríbele hoy a alguien que te apoye." },
    { n: 20, title: "Celebra el avance", prompt: "Mira todo lo que reflexionaste en 19 días. ¿Cuánto te moviste? Reconócelo." },
    { n: 21, title: "Tu compromiso", prompt: "Último día. Escribe una promesa a ti misma. Un compromiso con lo que descubriste." },
  ],
};

// Trae el reto activo desde Supabase; cae a AWAKE si no hay nada.
export async function getActiveChallenge() {
  if (supabase) {
    try {
      const { data } = await supabase
        .from("challenges")
        .select("slug,title,subtitle,hashtag,phases,days,closing")
        .eq("active", true)
        .order("starts_on", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data && Array.isArray(data.days) && data.days.length > 0) return data;
    } catch {
      // tabla inexistente o red caída → fallback
    }
  }
  return AWAKE;
}

// Fase a la que pertenece un día del reto.
export function phaseOf(challenge, n) {
  return (challenge.phases || []).find((f) => n >= f.from && n <= f.to) || null;
}
