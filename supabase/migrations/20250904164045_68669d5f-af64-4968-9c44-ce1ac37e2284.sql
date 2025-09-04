-- Create test admin user profile
-- First, let's check if there are any users in auth.users
-- We'll create a test profile for the admin dashboard

-- Insert a test admin profile (you'll need to sign up as this user through the UI)
INSERT INTO public.profiles (user_id, full_name, role, school_code) 
VALUES 
  ('test-admin-uuid', 'Адмін Тест', 'admin', 'SCHOOL001')
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin', 
  full_name = 'Адмін Тест';