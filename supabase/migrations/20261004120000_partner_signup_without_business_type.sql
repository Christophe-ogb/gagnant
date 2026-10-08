update public.profiles as profile
set role = 'hotel_manager'
from auth.users as users
where profile.id = users.id
  and profile.role = 'visitor'
  and (
    users.raw_user_meta_data ->> 'registration_type' = 'establishment_manager'
    or users.raw_user_meta_data ->> 'business_type' in ('hotel', 'restaurant', 'apartment')
  );

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
