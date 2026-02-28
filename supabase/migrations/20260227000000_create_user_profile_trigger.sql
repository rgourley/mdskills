-- Auto-create a public.users profile row when a new auth user is created.
-- Extracts metadata from OAuth providers (GitHub, Google) or falls back to email prefix.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  _username TEXT;
BEGIN
  -- Derive username: GitHub user_name > Google preferred_username > email prefix
  _username := COALESCE(
    NEW.raw_user_meta_data ->> 'user_name',
    NEW.raw_user_meta_data ->> 'preferred_username',
    SPLIT_PART(NEW.email, '@', 1)
  );

  -- Handle username collision by appending a short ID suffix
  IF EXISTS (SELECT 1 FROM public.users WHERE username = _username AND id != NEW.id) THEN
    _username := _username || '-' || SUBSTR(NEW.id::text, 1, 6);
  END IF;

  INSERT INTO public.users (id, email, username, name, avatar, github_username, github_connected)
  VALUES (
    NEW.id,
    NEW.email,
    _username,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      ''
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      ''
    ),
    NEW.raw_user_meta_data ->> 'user_name',
    CASE WHEN NEW.raw_app_meta_data ->> 'provider' = 'github' THEN true ELSE false END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.users.name),
    avatar = COALESCE(NULLIF(EXCLUDED.avatar, ''), public.users.avatar),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Trigger on new auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (backup for trigger)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
