-- Add some test meal orders for today for testing
INSERT INTO meal_orders (child_id, meal_date, meal_name, meal_type) 
VALUES 
-- Orders for today (2025-09-04)
('7d099aa1-f0aa-43bb-86f9-c9d11819054c', '2025-09-04', 'Котлета з картоплею', 'meal1'),
('7d099aa1-f0aa-43bb-86f9-c9d11819054c', '2025-09-04', 'Компот з яблук', 'meal2'),
('7d099aa1-f0aa-43bb-86f9-c9d11819054c', '2025-09-04', 'Хліб із маслом', 'side');

-- Create a database function for better meal orders access
CREATE OR REPLACE FUNCTION get_meal_orders_for_date(target_date date)
RETURNS TABLE (
  id uuid,
  child_id uuid,
  meal_date date,
  meal_name text,
  meal_type text,
  child_name text,
  child_grade text,
  child_allergies text[]
) 
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
  ORDER BY c.name, mo.meal_type;
$$;