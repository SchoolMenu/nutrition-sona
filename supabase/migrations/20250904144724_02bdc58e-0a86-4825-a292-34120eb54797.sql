-- Add school_code column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN school_code TEXT NOT NULL DEFAULT '';

-- Add index for better performance when filtering by school_code
CREATE INDEX idx_profiles_school_code ON public.profiles(school_code);

-- Update the handle_new_user function to include school_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, school_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'parent'),
    COALESCE(NEW.raw_user_meta_data ->> 'school_code', '')
  );
  RETURN NEW;
END;
$$;