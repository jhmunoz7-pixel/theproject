-- The Project · Retos del mes
--
-- Cada fila es un reto (AWAKE, el que venga el próximo mes, etc.).
-- La app muestra el reto con active = true más reciente. Para cambiar
-- de reto mes con mes: insertar la fila nueva con active = true y
-- poner active = false al anterior — sin tocar código.
--
-- Lectura pública solo de retos activos; escritura únicamente desde
-- el dashboard de Supabase (service role). El progreso de cada usuaria
-- NO vive aquí: se guarda en user_kv (tp:reto:<slug>) con su RLS.

create table if not exists public.challenges (
  id         uuid        not null default gen_random_uuid() primary key,
  slug       text        not null unique,
  title      text        not null,
  subtitle   text,
  intro      text,
  hashtag    text,
  starts_on  date        not null default now(),
  active     boolean     not null default false,
  phases     jsonb       not null default '[]',
  days       jsonb       not null default '[]',
  closing    jsonb,
  created_at timestamptz not null default now()
);

alter table public.challenges enable row level security;

create policy "challenges_select_active"
  on public.challenges for select
  to anon, authenticated
  using (active = true);

-- Semilla: el reto AWAKE · 21 días
insert into public.challenges (slug, title, subtitle, intro, hashtag, starts_on, active, phases, days, closing)
values (
  'awake-21',
  'AWAKE',
  'tu guía de 21 días',
  '21 días para despertar: mirar hacia adentro, encontrar claridad y dar el primer paso. Un prompt al día, cinco minutos, cero filtros.',
  '#Awake21',
  '2026-07-01',
  true,
  '[
    {"from":1,"to":7,"title":"Mirar hacia adentro","sub":"Conócete de verdad, sin filtros."},
    {"from":8,"to":14,"title":"Encontrar claridad","sub":"Aprende a pensar distinto."},
    {"from":15,"to":21,"title":"Dar el primer paso","sub":"De la reflexión a la acción."}
  ]'::jsonb,
  '[
    {"n":1,"title":"El punto de partida","prompt":"Bienvenida a AWAKE. Antes de empezar: en una palabra, ¿cómo te sientes con tu vida hoy?"},
    {"n":2,"title":"Tu martes ideal","prompt":"Imagina un martes normal de tu vida ideal. No las vacaciones — un día común. ¿Dónde despiertas? ¿Qué haces?"},
    {"n":3,"title":"Momentos de flow","prompt":"¿Cuándo fue la última vez que perdiste la noción del tiempo haciendo algo? Eso es una pista."},
    {"n":4,"title":"La envidia sana","prompt":"¿A quién admiras tanto que te da un poquito de envidia? ¿Qué exactamente de su vida?"},
    {"n":5,"title":"Tus no-negociables","prompt":"¿Qué NO estás dispuesta a sacrificar por ningún trabajo ni logro? Nómbralo."},
    {"n":6,"title":"La niña que fuiste","prompt":"¿Qué te ilusionaba de niña que dejaste de hacer? A veces la respuesta está en el pasado."},
    {"n":7,"title":"Cierre de semana","prompt":"Relee tus respuestas de la semana. ¿Qué palabra o idea se repite? Ese es tu hilo."},
    {"n":8,"title":"La duda como brújula","prompt":"Eso que quieres pero dudas en querer… escríbelo. La duda no te frena, te señala lo que importa."},
    {"n":9,"title":"Silencio estratégico","prompt":"Hoy: 15 minutos sin celular. Solo camina o siéntate. ¿Qué idea llegó cuando dejaste de exprimir?"},
    {"n":10,"title":"Menos es más","prompt":"Elimina UNA decisión que te drena cada día (qué comer, qué ponerte). Conviértela en regla fija."},
    {"n":11,"title":"Miedo real vs inventado","prompt":"Eso que quieres intentar: ¿qué te frena de verdad? ¿Es un miedo real o uno inventado?"},
    {"n":12,"title":"Carta a tu yo futuro","prompt":"Escríbele unas líneas a tu yo de dentro de 5 años. ¿Cómo vive? ¿Qué logró?"},
    {"n":13,"title":"Lo que ya sabes","prompt":"Completa esta frase sin pensarlo mucho: “En realidad, lo que quiero es…”"},
    {"n":14,"title":"Cierre de semana","prompt":"Ya tienes más claridad. Ponle palabras: tu “qué quiero” en una sola frase."},
    {"n":15,"title":"El paso más pequeño","prompt":"¿Cuál es el paso MÁS pequeño que podrías dar esta semana hacia eso que quieres?"},
    {"n":16,"title":"Tu meta clara","prompt":"Convierte tu deseo en meta: de dónde estás (X) a dónde quieres llegar (Y). ¿Para cuándo?"},
    {"n":17,"title":"Imagina que ya empezaste","prompt":"Cierra los ojos: ya diste el primer paso. ¿Cómo se siente? ¿Qué cambió?"},
    {"n":18,"title":"Rituales que sostienen","prompt":"¿Qué actividad te recarga de verdad? Agéndala esta semana como cita fija."},
    {"n":19,"title":"Tu red de apoyo","prompt":"¿Quién va contigo en esto? Etiqueta o escríbele hoy a alguien que te apoye."},
    {"n":20,"title":"Celebra el avance","prompt":"Mira todo lo que reflexionaste en 19 días. ¿Cuánto te moviste? Reconócelo."},
    {"n":21,"title":"Tu compromiso","prompt":"Último día. Escribe una promesa a ti misma. Un compromiso con lo que descubriste."}
  ]'::jsonb,
  '{"title":"El reto termina. El viaje empieza.","text":"Despertaste. Ahora sigue el camino en comunidad: tu lugar en The Project ya te espera."}'::jsonb
)
on conflict (slug) do nothing;
