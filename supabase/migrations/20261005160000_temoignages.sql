-- Avis & témoignages (formulaire accueil + PublishedTestimonials)

create table if not exists public.temoignages (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  fonction text not null,
  temoignage text not null,
  note smallint not null default 5,
  photo_url text,
  affiche boolean not null default false,
  created_at timestamptz not null default now(),
  check (char_length(btrim(nom)) between 1 and 100),
  check (char_length(btrim(fonction)) between 1 and 120),
  check (char_length(btrim(temoignage)) between 20 and 1200),
  check (note between 1 and 5)
);

create index if not exists temoignages_published_idx
  on public.temoignages (created_at desc)
  where affiche = true;

alter table public.temoignages enable row level security;

revoke all on public.temoignages from anon, authenticated;
grant select, insert on public.temoignages to anon, authenticated;
grant update on public.temoignages to authenticated;

drop policy if exists "Anyone can read published testimonials" on public.temoignages;
create policy "Anyone can read published testimonials"
  on public.temoignages for select to anon, authenticated
  using (affiche = true);

drop policy if exists "Admins can read all testimonials" on public.temoignages;
create policy "Admins can read all testimonials"
  on public.temoignages for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Anyone can submit a pending testimonial" on public.temoignages;
create policy "Anyone can submit a pending testimonial"
  on public.temoignages for insert to anon, authenticated
  with check (affiche = false);

drop policy if exists "Admins can moderate testimonials" on public.temoignages;
create policy "Admins can moderate testimonials"
  on public.temoignages for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Photos de profil (bucket public — getPublicUrl côté client)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'temoignages',
  'temoignages',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view testimonial photos" on storage.objects;
create policy "Anyone can view testimonial photos"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'temoignages');

drop policy if exists "Anyone can upload testimonial photos" on storage.objects;
create policy "Anyone can upload testimonial photos"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'temoignages'
    and (storage.foldername(name))[1] = 'temoignages'
  );
