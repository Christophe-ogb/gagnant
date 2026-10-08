revoke insert on public.temoignages from anon, authenticated;
grant insert on public.temoignages to service_role;

drop policy if exists "Anyone can submit a pending testimonial" on public.temoignages;
drop policy if exists "Anyone can upload testimonial photos" on storage.objects;
