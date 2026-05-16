-- Revoke public/anon/authenticated EXECUTE on handle_new_user.
-- The function is invoked by the on_auth_user_created trigger with the
-- definer's privileges; it should never be callable via PostgREST.

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
