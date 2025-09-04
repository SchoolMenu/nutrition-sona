-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Admins can view all meal orders" ON public.meal_orders;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create proper admin policies using the function
CREATE POLICY "Admins can view all children" 
ON public.children 
FOR SELECT 
USING (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can view all meal orders" 
ON public.meal_orders 
FOR SELECT 
USING (public.get_current_user_role() = 'admin'::app_role);