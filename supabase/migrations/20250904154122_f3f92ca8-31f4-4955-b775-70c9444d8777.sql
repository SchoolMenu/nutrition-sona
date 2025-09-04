-- Add a new column for meal names
ALTER TABLE public.meal_orders 
ADD COLUMN meal_name text;

-- Update existing records to use meal names from mock data
UPDATE public.meal_orders 
SET meal_name = CASE 
    WHEN meal_id = 'm1_1' THEN 'Борщ український з сметаною'
    WHEN meal_id = 'm1_2' THEN 'Суп-пюре з гарбуза'
    WHEN meal_id = 'm1_3' THEN 'Солянка м''ясна'
    WHEN meal_id = 'm1_4' THEN 'Суп овочевий з квасолею'
    WHEN meal_id = 'm1_5' THEN 'Суп курячий з локшиною'
    WHEN meal_id = 'm1_6' THEN 'Крем-суп з броколі'
    WHEN meal_id = 'm1_7' THEN 'Борщ зелений зі щавлем'
    WHEN meal_id = 'm1_8' THEN 'Суп з фрикадельками'
    WHEN meal_id = 'm1_9' THEN 'Суп гороховий з копченостями'
    WHEN meal_id = 'm1_10' THEN 'Суп молочний з вермішеллю'
    WHEN meal_id = 'm2_1' THEN 'Котлета куряча з картопляним пюре'
    WHEN meal_id = 'm2_2' THEN 'Рагу овочеве з рисом'
    WHEN meal_id = 'm2_3' THEN 'Голубці з м''ясом'
    WHEN meal_id = 'm2_4' THEN 'Каша гречана з грибами'
    WHEN meal_id = 'm2_5' THEN 'Рибні котлети з овочами'
    WHEN meal_id = 'm2_6' THEN 'Макарони з сиром'
    WHEN meal_id = 'm2_7' THEN 'Печеня яловича з картоплею'
    WHEN meal_id = 'm2_8' THEN 'Сирники з варенням'
    WHEN meal_id = 'm2_9' THEN 'Вареники з картоплею'
    WHEN meal_id = 'm2_10' THEN 'Каша вівсяна з фруктами'
    WHEN meal_id = 's1' THEN 'Салат з свіжих овочів'
    WHEN meal_id = 's2' THEN 'Винегрет'
    WHEN meal_id = 's3' THEN 'Компот з сухофруктів'
    WHEN meal_id = 's4' THEN 'Кисіль ягідний'
    WHEN meal_id = 's5' THEN 'Йогурт натуральний'
    ELSE 'Невідома страва'
END;

-- Make meal_name required
ALTER TABLE public.meal_orders 
ALTER COLUMN meal_name SET NOT NULL;

-- Drop the old meal_id column
ALTER TABLE public.meal_orders 
DROP COLUMN meal_id;