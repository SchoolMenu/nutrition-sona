-- Add school_code columns as nullable first
ALTER TABLE public.children ADD COLUMN IF NOT EXISTS school_code text;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS school_code text;
ALTER TABLE public.meal_orders ADD COLUMN IF NOT EXISTS school_code text;

-- Update existing children records to use the parent's school code
UPDATE public.children 
SET school_code = COALESCE((
  SELECT p.school_code 
  FROM public.profiles p 
  WHERE p.user_id = children.parent_id
), 'DEFAULT_SCHOOL');

-- Update menu_items to use a default school code for now (admins can update later)
UPDATE public.menu_items 
SET school_code = 'DEFAULT_SCHOOL' 
WHERE school_code IS NULL;

-- Update meal_orders using the child's school code
UPDATE public.meal_orders 
SET school_code = COALESCE((
  SELECT c.school_code 
  FROM public.children c 
  WHERE c.id = meal_orders.child_id
), 'DEFAULT_SCHOOL');

-- Now make the columns NOT NULL
ALTER TABLE public.children ALTER COLUMN school_code SET NOT NULL;
ALTER TABLE public.menu_items ALTER COLUMN school_code SET NOT NULL;
ALTER TABLE public.meal_orders ALTER COLUMN school_code SET NOT NULL;

-- Set default values
ALTER TABLE public.children ALTER COLUMN school_code SET DEFAULT '';
ALTER TABLE public.menu_items ALTER COLUMN school_code SET DEFAULT '';
ALTER TABLE public.meal_orders ALTER COLUMN school_code SET DEFAULT '';

-- Create function to get current user's school code
CREATE OR REPLACE FUNCTION public.get_current_user_school_code()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(school_code, '') FROM public.profiles WHERE user_id = auth.uid();
$$;