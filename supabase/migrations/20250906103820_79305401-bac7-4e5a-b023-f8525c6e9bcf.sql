-- Step 1: Drop all existing constraints that might conflict
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;
ALTER TABLE meal_orders DROP CONSTRAINT IF EXISTS meal_orders_meal_type_check;

-- Step 2: Update existing data without constraints
UPDATE menu_items SET category = 'fruit_break' WHERE category = 'side';
UPDATE menu_items SET category = 'main_meal' WHERE category IN ('meal1', 'meal2');