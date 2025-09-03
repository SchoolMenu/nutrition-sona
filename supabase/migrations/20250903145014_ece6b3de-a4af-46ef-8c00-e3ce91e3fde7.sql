-- Clear old menu data from 2024 so new current week data can be saved
DELETE FROM menu_items WHERE menu_date < '2025-01-01';