-- Update RLS policies for children table to include school isolation
DROP POLICY IF EXISTS "Parents can view their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can create children" ON public.children;
DROP POLICY IF EXISTS "Parents can update their own children" ON public.children;
DROP POLICY IF EXISTS "Parents can delete their own children" ON public.children;
DROP POLICY IF EXISTS "Admins can view all children" ON public.children;
DROP POLICY IF EXISTS "Cooks can view all children" ON public.children;
DROP POLICY IF EXISTS "Admins can view children from their school" ON public.children;
DROP POLICY IF EXISTS "Cooks can view children from their school" ON public.children;

CREATE POLICY "Parents can view their own children" 
ON public.children 
FOR SELECT 
USING (auth.uid() = parent_id AND school_code = get_current_user_school_code());

CREATE POLICY "Parents can create children" 
ON public.children 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id AND school_code = get_current_user_school_code());

CREATE POLICY "Parents can update their own children" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = parent_id AND school_code = get_current_user_school_code());

CREATE POLICY "Parents can delete their own children" 
ON public.children 
FOR DELETE 
USING (auth.uid() = parent_id AND school_code = get_current_user_school_code());

CREATE POLICY "Admins can view children from their school" 
ON public.children 
FOR SELECT 
USING (get_current_user_role() = 'admin'::app_role AND school_code = get_current_user_school_code());

CREATE POLICY "Cooks can view children from their school" 
ON public.children 
FOR SELECT 
USING (get_current_user_role() = 'cook'::app_role AND school_code = get_current_user_school_code());

-- Update RLS policies for menu_items table
DROP POLICY IF EXISTS "Everyone can view menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can manage all menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Users can view menu items from their school" ON public.menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items from their school" ON public.menu_items;

CREATE POLICY "Users can view menu items from their school" 
ON public.menu_items 
FOR SELECT 
USING (school_code = get_current_user_school_code());

CREATE POLICY "Admins can manage menu items from their school" 
ON public.menu_items 
FOR ALL 
USING (get_current_user_role() = 'admin'::app_role AND school_code = get_current_user_school_code())
WITH CHECK (get_current_user_role() = 'admin'::app_role AND school_code = get_current_user_school_code());

-- Update RLS policies for meal_orders table
DROP POLICY IF EXISTS "Parents can view orders for their children" ON public.meal_orders;
DROP POLICY IF EXISTS "Parents can create orders for their children" ON public.meal_orders;
DROP POLICY IF EXISTS "Parents can delete orders for their children" ON public.meal_orders;
DROP POLICY IF EXISTS "Admins can view all meal orders" ON public.meal_orders;
DROP POLICY IF EXISTS "Cooks can view all meal orders" ON public.meal_orders;
DROP POLICY IF EXISTS "Parents can view orders for their children from same school" ON public.meal_orders;
DROP POLICY IF EXISTS "Parents can create orders for their children from same school" ON public.meal_orders;
DROP POLICY IF EXISTS "Parents can delete orders for their children from same school" ON public.meal_orders;
DROP POLICY IF EXISTS "Admins can view meal orders from their school" ON public.meal_orders;
DROP POLICY IF EXISTS "Cooks can view meal orders from their school" ON public.meal_orders;

CREATE POLICY "Parents can view orders for their children from same school" 
ON public.meal_orders 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM children 
  WHERE children.id = meal_orders.child_id 
  AND children.parent_id = auth.uid() 
  AND children.school_code = get_current_user_school_code()
  AND meal_orders.school_code = get_current_user_school_code()
));

CREATE POLICY "Parents can create orders for their children from same school" 
ON public.meal_orders 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM children 
  WHERE children.id = meal_orders.child_id 
  AND children.parent_id = auth.uid() 
  AND children.school_code = get_current_user_school_code()
) AND school_code = get_current_user_school_code());

CREATE POLICY "Parents can delete orders for their children from same school" 
ON public.meal_orders 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM children 
  WHERE children.id = meal_orders.child_id 
  AND children.parent_id = auth.uid() 
  AND children.school_code = get_current_user_school_code()
  AND meal_orders.school_code = get_current_user_school_code()
));

CREATE POLICY "Admins can view meal orders from their school" 
ON public.meal_orders 
FOR SELECT 
USING (get_current_user_role() = 'admin'::app_role AND school_code = get_current_user_school_code());

CREATE POLICY "Cooks can view meal orders from their school" 
ON public.meal_orders 
FOR SELECT 
USING (get_current_user_role() = 'cook'::app_role AND school_code = get_current_user_school_code());

-- Update the meal orders function to filter by school code
CREATE OR REPLACE FUNCTION public.get_meal_orders_for_date(target_date date)
RETURNS TABLE(id uuid, child_id uuid, meal_date date, meal_name text, meal_type text, child_name text, child_grade text, child_allergies text[])
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    mo.id,
    mo.child_id,
    mo.meal_date,
    mo.meal_name,
    mo.meal_type,
    c.name as child_name,
    c.grade as child_grade,
    c.allergies as child_allergies
  FROM meal_orders mo
  LEFT JOIN children c ON mo.child_id = c.id
  WHERE mo.meal_date = target_date
  AND mo.school_code = get_current_user_school_code()
  ORDER BY c.name, mo.meal_type;
$$;