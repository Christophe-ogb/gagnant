alter table public.establishments
  add column if not exists details jsonb not null default '{}'::jsonb;
