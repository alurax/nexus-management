-- ==============================================================================
-- Auth Trigger & Profile Backfill
-- ==============================================================================

-- 1. Backfill any existing users who signed up before the trigger was created
INSERT INTO public.profiles (id, role, first_name, last_name)
SELECT id, 'owner', raw_user_meta_data->>'first_name', raw_user_meta_data->>'last_name'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. Create the function that automatically creates a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    new.id, 
    'staff', -- default role
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
