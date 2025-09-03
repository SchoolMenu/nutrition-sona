-- Add foreign key relationship between meal_orders and children
ALTER TABLE meal_orders 
ADD CONSTRAINT fk_meal_orders_child 
FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE;

-- Add RLS policy for cooks to view all children (needed for meal order display)
CREATE POLICY "Cooks can view all children" 
ON children 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'cook'
  )
);