alter table public.profiles
  add column if not exists email text;

update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where auth_user.id = profile.id
  and profile.email is distinct from auth_user.email;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'visitor'
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.sync_profile_email() from public;

drop trigger if exists on_auth_user_email_synced on auth.users;
create trigger on_auth_user_email_synced
  after insert or update of email on auth.users
  for each row execute procedure public.sync_profile_email();

alter table public.establishments
  drop constraint if exists establishments_status_check;

alter table public.establishments
  add constraint establishments_status_check
  check (status in ('pending', 'approved', 'rejected'));

alter table public.establishments
  add column if not exists rejection_reason text,
  add column if not exists rejected_at timestamptz;

alter table public.establishments
  drop constraint if exists establishments_rejection_reason_check;

alter table public.establishments
  add constraint establishments_rejection_reason_check
  check (rejection_reason is null or char_length(btrim(rejection_reason)) between 5 and 1000);

drop policy if exists "Owners can edit their pending establishment" on public.establishments;
create policy "Owners can edit their pending or rejected establishment"
  on public.establishments for update to authenticated
  using (
    owner_id = (select auth.uid())
    and status in ('pending', 'rejected')
  )
  with check (
    owner_id = (select auth.uid())
    and status = 'pending'
    and rejection_reason is null
    and rejected_at is null
    and not (select public.is_admin())
    and not exists (
      select 1 from unnest(photos) as paths(photo_path)
      where split_part(paths.photo_path, '/', 1) <> owner_id::text
    )
  );

notify pgrst, 'reload schema';
