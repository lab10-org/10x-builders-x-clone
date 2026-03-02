create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  email_local_part text;
  sanitized_base text;
  unique_suffix text;
  generated_username text;
begin
  email_local_part := split_part(coalesce(new.email, ''), '@', 1);
  sanitized_base := lower(regexp_replace(email_local_part, '[^a-z0-9_]+', '_', 'g'));
  sanitized_base := regexp_replace(sanitized_base, '^_+|_+$', '', 'g');

  if sanitized_base = '' then
    sanitized_base := 'user';
  end if;

  unique_suffix := left(replace(new.id::text, '-', ''), 8);
  generated_username := left(sanitized_base, 24) || '_' || unique_suffix;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (new.id, generated_username, null, null)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_profile on auth.users;

create trigger on_auth_user_created_create_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();
