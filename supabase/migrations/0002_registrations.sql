-- Registros de la landing (nombre + correo de futuras fundadoras).
--
-- Insert público (cualquiera puede registrarse), sin política de select:
-- los correos solo se leen desde el dashboard de Supabase, nunca por la API.

create table if not exists public.registrations (
  id         uuid        primary key default gen_random_uuid(),
  name       text,
  email      text        not null,
  created_at timestamptz not null default now()
);

create unique index if not exists registrations_email_key
  on public.registrations (lower(email));

alter table public.registrations enable row level security;

create policy "registrations_insert_public"
  on public.registrations for insert
  to anon, authenticated
  with check (true);
