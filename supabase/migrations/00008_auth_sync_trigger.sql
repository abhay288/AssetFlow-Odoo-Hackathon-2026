-- Fix the role inserts by casting to enum
INSERT INTO public.roles (name, description)
VALUES 
  ('admin'::role_type, 'System Administrator'),
  ('manager'::role_type, 'Asset Manager'),
  ('dept_head'::role_type, 'Department Head'),
  ('employee'::role_type, 'Regular Employee')
ON CONFLICT (name) DO NOTHING;

-- Create the function to handle new user signups from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id UUID;
  v_full_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- 1. Get the default role ID ('employee') safely
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'employee'::role_type LIMIT 1;

  -- 2. Extract full name from metadata safely
  IF new.raw_user_meta_data IS NOT NULL AND new.raw_user_meta_data ? 'full_name' THEN
    v_full_name := new.raw_user_meta_data->>'full_name';
  ELSE
    v_full_name := 'New User';
  END IF;

  -- 3. Split the name into first and last name
  v_first_name := split_part(v_full_name, ' ', 1);
  v_last_name := NULLIF(substring(v_full_name from length(v_first_name) + 2), '');
  
  IF v_last_name IS NULL THEN
    v_last_name := '';
  END IF;

  -- 4. Insert into profiles
  INSERT INTO public.profiles (id, first_name, last_name, email, role_id)
  VALUES (
    new.id,
    COALESCE(v_first_name, 'Unknown'),
    COALESCE(v_last_name, ''),
    COALESCE(new.email, ''),
    default_role_id
  );

  -- 5. Insert into employees
  INSERT INTO public.employees (profile_id, employee_code)
  VALUES (
    new.id,
    'EMP-' || substr(new.id::text, 1, 8)
  );

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- If ANYTHING fails above, log it but don't crash the auth signup!
  -- This ensures the user can still sign up even if profile creation fails.
  RAISE WARNING 'handle_new_user trigger failed: %', SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
