-- First, drop existing check constraints if they exist
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_category_check;

-- Add new check constraint for the updated meal categories
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check 
CHECK (category IN ('fruit_break', 'main_meal', 'afternoon_snack'));

-- Update existing data to new categories
UPDATE menu_items SET category = 'fruit_break' WHERE category = 'side';
UPDATE menu_items SET category = 'main_meal' WHERE category = 'meal1' OR category = 'meal2';

-- Update meal_orders to use new meal types  
UPDATE meal_orders SET meal_type = 'fruit_break' WHERE meal_type LIKE '%-side' OR meal_type = 'side';
UPDATE meal_orders SET meal_type = 'main_meal' WHERE meal_type LIKE '%-meal1' OR meal_type LIKE '%-meal2' OR meal_type = 'meal1' OR meal_type = 'meal2';