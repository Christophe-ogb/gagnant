grant delete on public.establishments to authenticated;

drop policy if exists "Admins can reject pending establishments" on public.establishments;
create policy "Admins can reject pending establishments"
  on public.establishments for delete to authenticated
  using ((select public.is_admin()) and status = 'pending');

drop policy if exists "Admins can delete establishment photos" on storage.objects;
create policy "Admins can delete establishment photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'establishment-photos'
    and (select public.is_admin())
  );

grant delete on public.temoignages to authenticated;

drop policy if exists "Admins can delete testimonials" on public.temoignages;
create policy "Admins can delete testimonials"
  on public.temoignages for delete to authenticated
  using ((select public.is_admin()));

drop policy if exists "Admins can delete testimonial photos" on storage.objects;
create policy "Admins can delete testimonial photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'temoignages'
    and (select public.is_admin())
  );
