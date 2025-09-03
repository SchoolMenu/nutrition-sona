-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'parent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  allergies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal_orders table
CREATE TABLE public.meal_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  meal_id TEXT NOT NULL,
  meal_date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for children
CREATE POLICY "Parents can view their own children" 
ON public.children 
FOR SELECT 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can create children" 
ON public.children 
FOR INSERT 
WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update their own children" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete their own children" 
ON public.children 
FOR DELETE 
USING (auth.uid() = parent_id);

-- RLS policies for meal_orders
CREATE POLICY "Parents can view orders for their children" 
ON public.meal_orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = meal_orders.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can create orders for their children" 
ON public.meal_orders 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = meal_orders.child_id 
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can delete orders for their children" 
ON public.meal_orders 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.children 
    WHERE children.id = meal_orders.child_id 
    AND children.parent_id = auth.uid()
  )
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'parent')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();