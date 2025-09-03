-- Insert sample children for the current user
INSERT INTO public.children (parent_id, name, grade, allergies) VALUES
  ('9cc5a53c-0bb6-4bbf-983b-37c723c426a9', 'Олексій Петренко', '7', ARRAY['Горіхи', 'Молочні продукти']),
  ('9cc5a53c-0bb6-4bbf-983b-37c723c426a9', 'Марія Петренко', '4', ARRAY[]::text[]);