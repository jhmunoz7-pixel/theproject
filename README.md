# The Project · Space

Plataforma SaaS anti-burnout freemium para mujeres en corporativo LATAM, parte de
[The Project by Fer](https://instagram.com/theprojectbyfer). Junta pendientes,
journaling y bienestar en un solo espacio diario.

Flujo: **landing con registro** (`/`) → **onboarding** (una vez) → **check-in diario**
(se adapta a mañana/tarde/noche) → **dashboard** flotante con widgets (`/espacio`) →
pestaña **Mi progreso** con métricas del mes.

Diseño: glassmorphism, blobs flotantes, layout asimétrico, pop-ups flotantes
(pausa consciente, Premium), fuentes Fraunces + Work Sans, 10 paletas a elegir.

## Stack

- **Next.js 15** (App Router) — listo para Vercel.
- **Supabase** — persistencia real entre días (sesión anónima por navegador).
- **Anthropic** vía `/api/claude` — ruta de servidor que protege la API key.
- Sin dependencias de UI: estilos inline, fuentes Fraunces + Work Sans, textura de grano.

> **Stripe todavía no está conectado.** El botón "Activar Premium" desbloquea las
> features de IA de forma simulada (como en el prototipo). Cuando se conecte Stripe,
> el pago real de $10 USD/mes reemplazará ese toggle.

## Correr en local

```bash
npm install
cp .env.example .env.local   # llena las variables
npm run dev                  # http://localhost:3000
```

La app funciona **sin configurar nada**: cae a `localStorage` y los botones de IA
responden "no configurado". Para la experiencia completa, llena `.env.local`.

## Variables de entorno

| Variable | Para qué | Requerida |
|---|---|---|
| `ANTHROPIC_API_KEY` | Features de IA (guía, análisis, recomendaciones) | Para IA |
| `CLAUDE_MODEL` | Modelo a usar (por defecto `claude-sonnet-5`) | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Proyecto Supabase | Para persistencia real |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Llave pública (anon) de Supabase | Para persistencia real |

## Supabase (persistencia real)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Corre las migraciones de `supabase/migrations/` en el **SQL Editor**, en orden
   (`user_kv` con Row Level Security y `registrations` para los correos de la landing).
3. **Authentication → Providers → Anonymous sign-ins: ON.** La app usa sesión
   anónima para que cada navegador tenga su propio espacio persistente.
4. Copia **Project URL** y **anon public key** a tus variables de entorno.

El esquema es key-value por usuaria (`user_id, key, value jsonb`) con RLS: cada quien
solo ve sus filas. Refleja 1:1 cómo la app guarda cada día como un blob.

## Deploy en Vercel

1. Sube este repo a GitHub (ya está).
2. En Vercel: **New Project** → importa el repo.
3. Agrega las variables de entorno (las 4 de arriba).
4. Deploy. Conecta el dominio `space.theprojectbyfer.com` en **Settings → Domains**.

## Qué sigue

- **Stripe**: checkout de $10 USD/mes + webhook que active Premium de verdad.
- **Cuentas con email**: hoy la sesión es anónima por navegador; vincular email
  hará que el espacio (y Premium) sigan a la usuaria entre dispositivos.
