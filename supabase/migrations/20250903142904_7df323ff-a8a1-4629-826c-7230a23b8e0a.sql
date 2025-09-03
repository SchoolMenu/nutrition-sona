-- Add RLS policy for cooks to view all meal orders
CREATE POLICY "Cooks can view all meal orders" 
ON meal_orders 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'cook'
  )
);

-- Delete old test data and add current data
DELETE FROM meal_orders WHERE meal_date < '2025-01-01';

-- Add meal orders for today
INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE,
    'm1_1',
    'meal1'
FROM children c
LIMIT 2;

INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE,
    'm2_1',
    'meal2'
FROM children c
LIMIT 2;

INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE,
    's1',
    'side'
FROM children c
LIMIT 1;

-- Add meal orders for tomorrow
INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE + INTERVAL '1 day',
    'm1_3',
    'meal1'
FROM children c
LIMIT 2;

INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE + INTERVAL '1 day',
    'm2_3',
    'meal2'
FROM children c
LIMIT 2;

INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE + INTERVAL '1 day',
    's2',
    'side'
FROM children c
LIMIT 1;