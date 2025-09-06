-- Update existing data to new categories first
UPDATE menu_items SET category = 'fruit_break' WHERE category = 'side';
UPDATE menu_items SET category = 'main_meal' WHERE category IN ('meal1', 'meal2');

-- Now add the check constraint
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check 
CHECK (category IN ('fruit_break', 'main_meal', 'afternoon_snack'));

-- Update meal_orders to use new meal types  
UPDATE meal_orders SET meal_type = 'fruit_break' WHERE meal_type LIKE '%-side' OR meal_type = 'side';
UPDATE meal_orders SET meal_type = 'main_meal' WHERE meal_type LIKE '%-meal1' OR meal_type LIKE '%-meal2' OR meal_type IN ('meal1', 'meal2');