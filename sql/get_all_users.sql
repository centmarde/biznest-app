create or replace function public.get_all_users()
returns setof auth.users
language sql
security definer
set search_path = public, auth
as $$
  select *
  from auth.users
  order by created_at desc nulls last;
$$;

grant execute on function public.get_all_users() to authenticated;
