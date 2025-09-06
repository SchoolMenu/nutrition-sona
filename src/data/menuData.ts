export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens: string[];
  category: 'fruit_break' | 'main_meal' | 'afternoon_snack';
  imageUrl?: string;
}

export interface DayMenu {
  date: string;
  dayName: string;
  mainMealOptions: MenuItem[];
  fruitBreakOptions: MenuItem[];
  afternoonSnackOptions: MenuItem[];
}

export interface WeekMenu {
  weekStart: string;
  weekEnd: string;
  days: DayMenu[];
}

// Generate current week dates
const getCurrentWeekDates = () => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1); // Monday
  
  const dates = [];
  for (let i = 0; i < 5; i++) { // Monday to Friday
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const currentWeekDates = getCurrentWeekDates();

// Ukrainian school menu data  
export const mockMenuData: WeekMenu = {
  weekStart: currentWeekDates[0],
  weekEnd: currentWeekDates[4],
  days: [
    {
      date: currentWeekDates[0],
      dayName: "Понеділок",
      mainMealOptions: [
        {
          id: "main_1",
          name: "Борщ український з котлетою",
          description: "Комплексний обід: традиційний червоний борщ з сметаною та куряча котлета з картопляним пюре",
          price: 85,
          allergens: ["Молочні продукти", "Яйця"],
          category: "main_meal"
        },
        {
          id: "main_2", 
          name: "Суп-пюре з гарбуза з рагу",
          description: "Комплексний обід: ніжний крем-суп з гарбуза та овочеве рагу з рисом",
          price: 75,
          allergens: ["Молочні продукти"],
          category: "main_meal"
        }
      ],
      fruitBreakOptions: [
        {
          id: "fruit_1",
          name: "Яблуко з компотом",
          description: "Свіже яблуко з ароматним компотом з сухофруктів",
          price: 20,
          allergens: [],
          category: "fruit_break"
        }
      ],
      afternoonSnackOptions: [
        {
          id: "snack_1",
          name: "Печиво з молоком",
          description: "Домашнє печиво з склянкою теплого молока",
          price: 25,
          allergens: ["Молочні продукти", "Глютен"],
          category: "afternoon_snack"
        }
      ]
    },
    {
      date: currentWeekDates[1],
      dayName: "Вівторок",
      mainMealOptions: [
        {
          id: "main_3",
          name: "Солянка з голубцями",
          description: "Комплексний обід: наваристий суп солянка з ковбасою та голубці з м'ясом",
          price: 90,
          allergens: [],
          category: "main_meal"
        },
        {
          id: "main_4",
          name: "Суп овочевий з гречкою",
          description: "Комплексний обід: легкий овочевый суп з квасолею та гречана каша з грибами",
          price: 70,
          allergens: [],
          category: "main_meal"
        }
      ],
      fruitBreakOptions: [
        {
          id: "fruit_2",
          name: "Груша з соком",
          description: "Свіжа груша з натуральним яблучним соком",
          price: 22,
          allergens: [],
          category: "fruit_break"
        }
      ],
      afternoonSnackOptions: [
        {
          id: "snack_2",
          name: "Йогурт з медом",
          description: "Натуральний йогурт з ароматним медом",
          price: 30,
          allergens: ["Молочні продукти"],
          category: "afternoon_snack"
        }
      ]
    },
    {
      date: currentWeekDates[2],
      dayName: "Середа",
      mainMealOptions: [
        {
          id: "main_5",
          name: "Курячий суп з рибними котлетами",
          description: "Комплексний обід: ароматний курячий бульйон з локшиною та рибні котлети з овочами",
          price: 95,
          allergens: ["Глютен", "Яйця", "Риба"],
          category: "main_meal"
        },
        {
          id: "main_6",
          name: "Крем-суп з макаронами",
          description: "Комплексний обід: вітамінний суп-пюре з броколі та макарони з сиром",
          price: 70,
          allergens: ["Молочні продукти", "Глютен"],
          category: "main_meal"
        }
      ],
      fruitBreakOptions: [
        {
          id: "fruit_3",
          name: "Банан з компотом",
          description: "Свіжий банан з компотом з сухофруктів",
          price: 25,
          allergens: [],
          category: "fruit_break"
        }
      ],
      afternoonSnackOptions: [
        {
          id: "snack_3",
          name: "Сирники з варенням",
          description: "Ніжні сирники з домашнім варенням",
          price: 35,
          allergens: ["Молочні продукти", "Яйця", "Глютен"],
          category: "afternoon_snack"
        }
      ]
    },
    {
      date: currentWeekDates[3],
      dayName: "Четвер",
      mainMealOptions: [
        {
          id: "main_7",
          name: "Зелений борщ з печенею",
          description: "Комплексний обід: весняний суп зі щавлем, яйцем, сметаною та тушкована яловична печеня з картоплею",
          price: 100,
          allergens: ["Яйця", "Молочні продукти"],
          category: "main_meal"
        },
        {
          id: "main_8",
          name: "Суп з фрикадельками та сирники",
          description: "Комплексний обід: м'ясні фрикадельки в овочевому бульйоні та солодкі сирники",
          price: 80,
          allergens: ["Яйця", "Молочні продукти", "Глютен"],
          category: "main_meal"
        }
      ],
      fruitBreakOptions: [
        {
          id: "fruit_4",
          name: "Апельсин з киселем",
          description: "Свіжий апельсин з густим ягідним киселем",
          price: 28,
          allergens: [],
          category: "fruit_break"
        }
      ],
      afternoonSnackOptions: [
        {
          id: "snack_4",
          name: "Булочка з какао",
          description: "Свіжа булочка з гарячим какао",
          price: 30,
          allergens: ["Глютен", "Молочні продукти", "Яйця"],
          category: "afternoon_snack"
        }
      ]
    },
    {
      date: currentWeekDates[4],
      dayName: "П'ятниця",
      mainMealOptions: [
        {
          id: "main_9",
          name: "Гороховий суп з варениками",
          description: "Комплексний обід: ситний гороховий суп з копченостями та домашні вареники з картоплею",
          price: 85,
          allergens: ["Глютен", "Яйця", "Молочні продукти"],
          category: "main_meal"
        },
        {
          id: "main_10",
          name: "Молочний суп з вівсянкою",
          description: "Комплексний обід: солодкий молочний суп з вермішеллю та корисна вівсянка з фруктами",
          price: 60,
          allergens: ["Молочні продукти", "Глютен"],
          category: "main_meal"
        }
      ],
      fruitBreakOptions: [
        {
          id: "fruit_5",
          name: "Виноград з соком",
          description: "Свіжий виноград з натуральним виноградним соком",
          price: 30,
          allergens: [],
          category: "fruit_break"
        }
      ],
      afternoonSnackOptions: [
        {
          id: "snack_5",
          name: "Кекс з чаєм",
          description: "Домашній кекс з ароматним чаєм",
          price: 28,
          allergens: ["Глютен", "Яйця", "Молочні продукти"],
          category: "afternoon_snack"
        }
      ]
    }
  ]
};

export const allergensList = [
  "Молочні продукти",
  "Глютен", 
  "Яйця",
  "Горіхи",
  "Арахіс",
  "Риба",
  "Соя",
  "Кунжут"
];