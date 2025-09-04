-- Add INSERT policy for profiles table to allow user registration
-- This allows authenticated users to create their own profile during registration

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also ensure the trigger function has proper permissions
-- The handle_new_user function should work with SECURITY DEFINER, but let's verify it exists
SELECT proname, prosecdef FROM pg_proc WHERE proname = 'handle_new_user';