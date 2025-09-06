-- Step 3: Update meal_orders to use new meal types
UPDATE meal_orders SET meal_type = 'fruit_break' WHERE meal_type LIKE '%-side' OR meal_type = 'side';
UPDATE meal_orders SET meal_type = 'main_meal' WHERE meal_type LIKE '%-meal1' OR meal_type LIKE '%-meal2' OR meal_type IN ('meal1', 'meal2');

-- Step 4: Add new check constraints
ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_check 
CHECK (category IN ('fruit_break', 'main_meal', 'afternoon_snack'));