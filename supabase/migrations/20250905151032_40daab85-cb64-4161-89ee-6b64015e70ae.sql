-- Update existing menu items to use the correct school code for admin user
UPDATE menu_items 
SET school_code = '123456' 
WHERE school_code = 'DEFAULT_SCHOOL';