// ═══════════════════════════════════════════════════════════
//  RETOS DEL MES — el contenido vive aquí.
//  Para cambiar el reto: agrega un objeto nuevo a RETOS con su
//  "mes" (YYYY-MM). La app muestra automáticamente el del mes
//  en curso; si un mes no tiene reto, se queda el más reciente.
//  El progreso de cada usuaria se guarda por id, así que los
//  retos pasados no pierden sus respuestas.
// ═══════════════════════════════════════════════════════════

export const RETOS = [
  {
    id: "awake-21",
    mes: "2026-07",
    nombre: "AWAKE",
    subtitulo: "tu guía de 21 días",
    intro: "21 días para despertar: mirar hacia adentro, encontrar claridad y dar el primer paso. Un prompt al día, cinco minutos, cero filtros.",
    hashtag: "#Awake21",
    cierre: "El reto termina. El viaje empieza.",
    cierreSub: "¿Te gustó despertar? Esto es solo el principio. Sigue el camino en comunidad — en The Project.",
    semanas: [
      {
        titulo: "Mirar hacia adentro",
        sub: "Conócete de verdad, sin filtros.",
        dias: [
          { n: 1, titulo: "El punto de partida", prompt: "Bienvenida a AWAKE 🌿 Antes de empezar: en una palabra, ¿cómo te sientes con tu vida hoy?" },
          { n: 2, titulo: "Tu martes ideal", prompt: "Imagina un martes normal de tu vida ideal. No las vacaciones — un día común. ¿Dónde despiertas? ¿Qué haces?" },
          { n: 3, titulo: "Momentos de flow", prompt: "¿Cuándo fue la última vez que perdiste la noción del tiempo haciendo algo? Eso es una pista." },
          { n: 4, titulo: "La envidia sana", prompt: "¿A quién admiras tanto que te da un poquito de envidia? ¿Qué exactamente de su vida?" },
          { n: 5, titulo: "Tus no-negociables", prompt: "¿Qué NO estás dispuesta a sacrificar por ningún trabajo ni logro? Nómbralo." },
          { n: 6, titulo: "La niña que fuiste", prompt: "¿Qué te ilusionaba de niña que dejaste de hacer? A veces la respuesta está en el pasado." },
          { n: 7, titulo: "Cierre de semana", prompt: "Relee tus respuestas de la semana. ¿Qué palabra o idea se repite? Ese es tu hilo." },
        ],
      },
      {
        titulo: "Encontrar claridad",
        sub: "Aprende a pensar distinto.",
        dias: [
          { n: 8, titulo: "La duda como brújula", prompt: "Eso que quieres pero dudas en querer… escríbelo. La duda no te frena, te señala lo que importa." },
          { n: 9, titulo: "Silencio estratégico", prompt: "Hoy: 15 minutos sin celular. Solo camina o siéntate. ¿Qué idea llegó cuando dejaste de exprimir?" },
          { n: 10, titulo: "Menos es más", prompt: "Elimina UNA decisión que te drena cada día (qué comer, qué ponerte). Conviértela en regla fija." },
          { n: 11, titulo: "Miedo real vs inventado", prompt: "Eso que quieres intentar: ¿qué te frena de verdad? ¿Es un miedo real o uno inventado?" },
          { n: 12, titulo: "Carta a tu yo futuro", prompt: "Escríbele unas líneas a tu yo de dentro de 5 años. ¿Cómo vive? ¿Qué logró?" },
          { n: 13, titulo: "Lo que ya sabes", prompt: "Completa esta frase sin pensarlo mucho: “En realidad, lo que quiero es…”" },
          { n: 14, titulo: "Cierre de semana", prompt: "Ya tienes más claridad. Ponle palabras: tu “qué quiero” en una sola frase." },
        ],
      },
      {
        titulo: "Dar el primer paso",
        sub: "De la reflexión a la acción.",
        dias: [
          { n: 15, titulo: "El paso más pequeño", prompt: "¿Cuál es el paso MÁS pequeño que podrías dar esta semana hacia eso que quieres?" },
          { n: 16, titulo: "Tu meta clara", prompt: "Convierte tu deseo en meta: de dónde estás (X) a dónde quieres llegar (Y). ¿Para cuándo?" },
          { n: 17, titulo: "Imagina que ya empezaste", prompt: "Cierra los ojos: ya diste el primer paso. ¿Cómo se siente? ¿Qué cambió?" },
          { n: 18, titulo: "Rituales que sostienen", prompt: "¿Qué actividad te recarga de verdad? Agéndala esta semana como cita fija." },
          { n: 19, titulo: "Tu red de apoyo", prompt: "¿Quién va contigo en esto? Etiqueta o escríbele hoy a alguien que te apoye." },
          { n: 20, titulo: "Celebra el avance", prompt: "Mira todo lo que reflexionaste en 19 días. ¿Cuánto te moviste? Reconócelo." },
          { n: 21, titulo: "Tu compromiso", prompt: "Último día 🌿 Escribe una promesa a ti misma. Un compromiso con lo que descubriste." },
        ],
      },
    ],
  },
];

// Reto activo: el del mes en curso o, si no hay, el más reciente ya publicado.
export function retoActivo() {
  const d = new Date();
  const mes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const publicados = RETOS.filter((r) => r.mes <= mes).sort((a, b) => b.mes.localeCompare(a.mes));
  return publicados[0] || RETOS[0];
}

// ── Retos desde Supabase (tabla `challenges`) ───────────────
// Permite cambiar el reto mes con mes SIN tocar código: se inserta la
// fila del reto nuevo con active = true (y el anterior en false) desde
// el dashboard de Supabase. Si no hay Supabase, tabla o fila activa,
// la app se queda con el reto embebido de arriba.
//
// Fila → forma que consume la app:
//   slug → id (el progreso de cada usuaria se guarda por id, así que
//   los retos pasados no pierden sus respuestas), phases + days → semanas.
export async function fetchRetoActivo() {
  try {
    const { supabase } = await import("@/lib/store");
    if (!supabase) return retoActivo();
    const { data } = await supabase
      .from("challenges")
      .select("slug,title,subtitle,intro,hashtag,phases,days,closing")
      .eq("active", true)
      .order("starts_on", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data || !Array.isArray(data.days) || data.days.length === 0) return retoActivo();
    return {
      id: data.slug,
      nombre: data.title,
      subtitulo: data.subtitle || "",
      intro: data.intro || "",
      hashtag: data.hashtag || "",
      cierre: data.closing?.title || "El reto termina. El viaje empieza.",
      cierreSub: data.closing?.text || "",
      semanas: (data.phases || []).map((f) => ({
        titulo: f.title,
        sub: f.sub || "",
        dias: data.days
          .filter((d) => d.n >= f.from && d.n <= f.to)
          .map((d) => ({ n: d.n, titulo: d.title, prompt: d.prompt })),
      })),
    };
  } catch {
    return retoActivo();
  }
}
