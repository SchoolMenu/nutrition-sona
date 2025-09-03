-- Add some meal orders for today and tomorrow for testing
INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE,
    'm1_1',
    'meal1'
FROM children c
WHERE c.parent_id IN (SELECT id FROM auth.users LIMIT 1)
LIMIT 2;

INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE,
    'm2_1',
    'meal2'
FROM children c
WHERE c.parent_id IN (SELECT id FROM auth.users LIMIT 1)
LIMIT 2;

INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE,
    's1',
    'side'
FROM children c
WHERE c.parent_id IN (SELECT id FROM auth.users LIMIT 1)
LIMIT 1;

-- Add orders for tomorrow
INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE + INTERVAL '1 day',
    'm1_3',
    'meal1'
FROM children c
WHERE c.parent_id IN (SELECT id FROM auth.users LIMIT 1)
LIMIT 2;

INSERT INTO meal_orders (child_id, meal_date, meal_id, meal_type)
SELECT 
    c.id,
    CURRENT_DATE + INTERVAL '1 day',
    'm2_3',
    'meal2'
FROM children c
WHERE c.parent_id IN (SELECT id FROM auth.users LIMIT 1)
LIMIT 2;