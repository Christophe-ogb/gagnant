create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'visitor' check (role in ('visitor', 'hotel_manager', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists full_name text not null default '';
alter table public.profiles add column if not exists role text not null default 'visitor';

insert into public.profiles (id, full_name, role)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', ''),
  case
    when users.raw_user_meta_data ->> 'registration_type' = 'establishment_manager'
      or users.raw_user_meta_data ->> 'business_type' in ('hotel', 'restaurant', 'apartment') then 'hotel_manager'
    else 'visitor'
  end
from auth.users as users
on conflict (id) do nothing;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'registration_type' = 'establishment_manager'
        or new.raw_user_meta_data ->> 'business_type' in ('hotel', 'restaurant', 'apartment') then 'hotel_manager'
      else 'visitor'
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create table if not exists public.establishments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  business_type text not null check (business_type in ('hotel', 'restaurant', 'apartment')),
  name text not null,
  phone text not null,
  address text not null,
  description text not null,
  equipment text[] not null default '{}',
  photos text[] not null default '{}' check (cardinality(photos) <= 6),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(btrim(name)) between 1 and 120),
  check (char_length(btrim(phone)) between 3 and 40),
  check (char_length(btrim(address)) between 1 and 200),
  check (char_length(btrim(description)) between 1 and 3000)
);

create index if not exists establishments_approved_type_idx
  on public.establishments (business_type, created_at desc)
  where status = 'approved';

alter table public.profiles enable row level security;
alter table public.establishments enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
revoke all on public.establishments from anon, authenticated;
grant select on public.establishments to anon, authenticated;
grant insert, update on public.establishments to authenticated;

drop policy if exists "Users can read their own profile or admins can read all" on public.profiles;
create policy "Users can read their own profile or admins can read all"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Anyone can read approved establishments" on public.establishments;
create policy "Anyone can read approved establishments"
  on public.establishments for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "Owners can read their establishment" on public.establishments;
create policy "Owners can read their establishment"
  on public.establishments for select to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists "Admins can read every establishment" on public.establishments;
create policy "Admins can read every establishment"
  on public.establishments for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "Managers can submit a pending establishment" on public.establishments;
create policy "Managers can submit a pending establishment"
  on public.establishments for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
    and not exists (
      select 1 from unnest(photos) as paths(photo_path)
      where split_part(paths.photo_path, '/', 1) <> owner_id::text
    )
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'hotel_manager'
    )
  );

drop policy if exists "Managers can edit their pending establishment" on public.establishments;
create policy "Managers can edit their pending establishment"
  on public.establishments for update to authenticated
  using (owner_id = (select auth.uid()) and status = 'pending')
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
    and not exists (
      select 1 from unnest(photos) as paths(photo_path)
      where split_part(paths.photo_path, '/', 1) <> owner_id::text
    )
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'hotel_manager'
    )
  );

drop policy if exists "Admins can moderate establishments" on public.establishments;
create policy "Admins can moderate establishments"
  on public.establishments for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'establishment-photos',
  'establishment-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view establishment photos" on storage.objects;
create policy "Anyone can view establishment photos"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'establishment-photos'
    and (
      exists (
        select 1 from public.establishments as establishment
        where storage.objects.name = any(establishment.photos)
          and establishment.status = 'approved'
      )
      or (
        (select auth.uid()) is not null
        and (
          (storage.foldername(name))[1] = (select auth.uid())::text
          or (select public.is_admin())
        )
      )
    )
  );

drop policy if exists "Managers can upload photos to their own folder" on storage.objects;
create policy "Managers can upload photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'establishment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'hotel_manager'
    )
  );

drop policy if exists "Managers can delete photos from their own folder" on storage.objects;
create policy "Managers can delete photos from their own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'establishment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (
      select 1 from public.establishments
      where owner_id = (select auth.uid()) and status = 'approved'
    )
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and role = 'hotel_manager'
    )
  );
