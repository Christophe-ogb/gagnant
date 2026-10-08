update public.profiles
set role = 'visitor'
where role = 'hotel_manager';

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('visitor', 'admin'));

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
    'visitor'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop policy if exists "Managers can submit a pending establishment" on public.establishments;
create policy "Authenticated users can submit a pending establishment"
  on public.establishments for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
    and not (select public.is_admin())
    and not exists (
      select 1 from unnest(photos) as paths(photo_path)
      where split_part(paths.photo_path, '/', 1) <> owner_id::text
    )
  );

drop policy if exists "Managers can edit their pending establishment" on public.establishments;
create policy "Owners can edit their pending establishment"
  on public.establishments for update to authenticated
  using (owner_id = (select auth.uid()) and status = 'pending')
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
    and not (select public.is_admin())
    and not exists (
      select 1 from unnest(photos) as paths(photo_path)
      where split_part(paths.photo_path, '/', 1) <> owner_id::text
    )
  );

drop policy if exists "Managers can upload photos to their own folder" on storage.objects;
create policy "Users can upload establishment photos to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'establishment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not (select public.is_admin())
  );

drop policy if exists "Managers can delete photos from their own folder" on storage.objects;
create policy "Users can delete establishment photos from their own folder"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'establishment-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not (select public.is_admin())
    and not exists (
      select 1 from public.establishments
      where owner_id = (select auth.uid()) and status = 'approved'
    )
  );
