-- The Project · Space — esquema inicial
--
-- Modelo simple key-value por usuaria: cada perfil, día, journaling y flag de
-- premium se guarda como una fila (user_id, key, value jsonb). Esto refleja 1:1
-- cómo la app ya guarda blobs por día, y con RLS cada quien solo ve lo suyo.

create table if not exists public.user_kv (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  key        text        not null,
  value      jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_kv enable row level security;

-- Cada usuaria solo puede leer y escribir sus propias filas.
create policy "user_kv_select_own"
  on public.user_kv for select
  using (auth.uid() = user_id);

create policy "user_kv_insert_own"
  on public.user_kv for insert
  with check (auth.uid() = user_id);

create policy "user_kv_update_own"
  on public.user_kv for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_kv_delete_own"
  on public.user_kv for delete
  using (auth.uid() = user_id);
