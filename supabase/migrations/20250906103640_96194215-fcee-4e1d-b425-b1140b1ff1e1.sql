-- Update menu categories to new meal types
UPDATE menu_items SET category = 'fruit_break' WHERE category = 'side';
UPDATE menu_items SET category = 'main_meal' WHERE category = 'meal1' OR category = 'meal2';

-- Update meal_orders to use new meal types
UPDATE meal_orders SET meal_type = 'fruit_break' WHERE meal_type LIKE '%-side';
UPDATE meal_orders SET meal_type = 'main_meal' WHERE meal_type LIKE '%-meal1' OR meal_type LIKE '%-meal2' OR meal_type = 'meal1' OR meal_type = 'meal2';
UPDATE meal_orders SET meal_type = 'fruit_break' WHERE meal_type = 'side';

-- Add afternoon_snack as new meal type (will be populated when users make new orders)
-- No existing data needs to be updated for afternoon_snack as it's a new optional type