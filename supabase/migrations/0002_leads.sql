-- The Project · Landing — leads del formulario "quiero más info"
--
-- La landing pública inserta con la anon key, por eso la política permite
-- insertar a cualquiera pero nadie puede leer/editar desde el cliente:
-- los leads se consultan solo desde el dashboard de Supabase (service role).

create table if not exists public.leads (
  id         uuid        not null default gen_random_uuid() primary key,
  name       text        not null,
  email      text        not null,
  message    text,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads_insert_public"
  on public.leads for insert
  to anon, authenticated
  with check (true);
