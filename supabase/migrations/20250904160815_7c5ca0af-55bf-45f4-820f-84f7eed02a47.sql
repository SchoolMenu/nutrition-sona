-- Add test meal orders for tomorrow (2025-09-05)
INSERT INTO meal_orders (child_id, meal_date, meal_name, meal_type) 
VALUES 
-- Orders for tomorrow - First child (Каріна)
('7d099aa1-f0aa-43bb-86f9-c9d11819054c', '2025-09-05', 'Суп з куркою та локшиною', 'meal1'),
('7d099aa1-f0aa-43bb-86f9-c9d11819054c', '2025-09-05', 'Риба запечена з овочами', 'meal2'),
('7d099aa1-f0aa-43bb-86f9-c9d11819054c', '2025-09-05', 'Салат з огірків', 'side');

-- Add a test child with allergies for better testing
INSERT INTO children (name, grade, parent_id, allergies) 
VALUES ('Олексій', '3', '9cc5a53c-0bb6-4bbf-983b-37c723c426a9', ARRAY['молоко', 'горіхи']);

-- Add orders for the child with allergies
INSERT INTO meal_orders (child_id, meal_date, meal_name, meal_type) 
VALUES 
((SELECT id FROM children WHERE name = 'Олексій' AND parent_id = '9cc5a53c-0bb6-4bbf-983b-37c723c426a9'), '2025-09-05', 'Гречана каша з м''ясом', 'meal1'),
((SELECT id FROM children WHERE name = 'Олексій' AND parent_id = '9cc5a53c-0bb6-4bbf-983b-37c723c426a9'), '2025-09-05', 'Компот з сухофруктів', 'meal2'),
((SELECT id FROM children WHERE name = 'Олексій' AND parent_id = '9cc5a53c-0bb6-4bbf-983b-37c723c426a9'), '2025-09-05', 'Хліб житній', 'side');