create table if not exists public.email_announcement_subscribers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  consented_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  check (char_length(btrim(email)) between 3 and 320),
  check (char_length(full_name) <= 120)
);

create index if not exists email_announcement_subscribers_active_idx
  on public.email_announcement_subscribers (created_at)
  where unsubscribed_at is null;

alter table public.email_announcement_subscribers enable row level security;
revoke all on public.email_announcement_subscribers from anon, authenticated;
grant select on public.email_announcement_subscribers to authenticated;
grant insert (user_id, email, full_name, consented_at, unsubscribed_at)
  on public.email_announcement_subscribers to authenticated;
grant update (user_id, email, full_name, consented_at, unsubscribed_at)
  on public.email_announcement_subscribers to authenticated;

drop policy if exists "Users can view their own announcement preference" on public.email_announcement_subscribers;
create policy "Users can view their own announcement preference"
  on public.email_announcement_subscribers for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Users can opt in to email announcements" on public.email_announcement_subscribers;
create policy "Users can opt in to email announcements"
  on public.email_announcement_subscribers for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and lower(email) = lower((select auth.jwt() ->> 'email'))
    and unsubscribed_at is null
  );

drop policy if exists "Users can update their own announcement preference" on public.email_announcement_subscribers;
create policy "Users can update their own announcement preference"
  on public.email_announcement_subscribers for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and lower(email) = lower((select auth.jwt() ->> 'email'))
  );

create or replace function public.add_email_announcement_opt_in()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'email_updates_opt_in' = 'true'
    and new.email_confirmed_at is not null then
    insert into public.email_announcement_subscribers (user_id, email, full_name)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', '')
    )
    on conflict (user_id) do update
    set email = excluded.email,
        full_name = excluded.full_name;
  end if;
  return new;
end;
$$;

revoke all on function public.add_email_announcement_opt_in() from public;

drop trigger if exists on_auth_user_created_email_announcement_opt_in on auth.users;
create trigger on_auth_user_created_email_announcement_opt_in
  after insert on auth.users
  for each row execute procedure public.add_email_announcement_opt_in();

drop trigger if exists on_auth_user_confirmed_email_announcement_opt_in on auth.users;
create trigger on_auth_user_confirmed_email_announcement_opt_in
  after update of email_confirmed_at, email on auth.users
  for each row execute procedure public.add_email_announcement_opt_in();

create or replace function public.unsubscribe_email_announcements(subscriber_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_rows integer;
begin
  update public.email_announcement_subscribers
  set unsubscribed_at = pg_catalog.now()
  where unsubscribe_token = subscriber_token
    and unsubscribed_at is null;
  get diagnostics changed_rows = row_count;
  return changed_rows > 0;
end;
$$;

revoke all on function public.unsubscribe_email_announcements(uuid) from public;
grant execute on function public.unsubscribe_email_announcements(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
