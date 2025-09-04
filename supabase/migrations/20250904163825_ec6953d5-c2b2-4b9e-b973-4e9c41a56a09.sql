-- Create RLS policies for admins to access all children and meal orders data

-- Add admin policy for children table
CREATE POLICY "Admins can view all children" 
ON public.children 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'::app_role
));

-- Add admin policy for meal_orders table  
CREATE POLICY "Admins can view all meal orders" 
ON public.meal_orders 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'::app_role
));