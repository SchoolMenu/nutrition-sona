-- Create admin profile for testing
-- First, get or create a test user profile
INSERT INTO public.profiles (user_id, full_name, role, school_code)
VALUES (
  '9cc5a53c-0bb6-4bbf-983b-37c723c426a9',  -- Use existing parent user ID as test admin
  'Тестовий Адміністратор',
  'admin'::app_role,
  'TEST001'
) 
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'admin'::app_role,
  full_name = 'Тестовий Адміністратор';