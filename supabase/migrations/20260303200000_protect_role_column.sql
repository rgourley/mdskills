-- Prevent users from changing their own role column via RLS UPDATE policy.
-- The existing "Users can update own profile" policy allows any column change.
-- This trigger silently resets `role` to the old value on any UPDATE,
-- ensuring only service-role / admin SQL can change it.

CREATE OR REPLACE FUNCTION public.protect_role_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Always preserve the existing role value — ignore whatever the client sent
  NEW.role := OLD.role;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_role_on_update ON public.users;
CREATE TRIGGER protect_role_on_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_role_column();
