export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  allergens: string[];
  category: 'meal1' | 'meal2' | 'side';
  imageUrl?: string;
}

export interface DayMenu {
  date: string;
  dayName: string;
  meal1Options: MenuItem[];
  meal2Options: MenuItem[];
  sideOptions: MenuItem[];
}

export interface WeekMenu {
  weekStart: string;
  weekEnd: string;
  days: DayMenu[];
}

// Ukrainian school menu data
export const mockMenuData: WeekMenu = {
  weekStart: "2024-01-15",
  weekEnd: "2024-01-19",
  days: [
    {
      date: "2024-01-15",
      dayName: "Понеділок",
      meal1Options: [
        {
          id: "m1_1",
          name: "Борщ український з сметаною",
          description: "Традиційний червоний борщ з капустою, морквою, буряком та сметаною",
          price: 45,
          allergens: ["Молочні продукти"],
          category: "meal1"
        },
        {
          id: "m1_2", 
          name: "Суп-пюре з гарбуза",
          description: "Ніжний крем-суп з гарбуза з вершками та гренками",
          price: 40,
          allergens: ["Молочні продукти", "Глютен"],
          category: "meal1"
        }
      ],
      meal2Options: [
        {
          id: "m2_1",
          name: "Котлета куряча з картопляним пюре",
          description: "Соковита котлета з курячого фаршу з ніжним картопляним пюре",
          price: 55,
          allergens: ["Яйця", "Молочні продукти"],
          category: "meal2"
        },
        {
          id: "m2_2",
          name: "Рагу овочеве з рисом",
          description: "Тушкована суміш овочів з рисом, збагачена зеленню",
          price: 50,
          allergens: [],
          category: "meal2"
        }
      ],
      sideOptions: [
        {
          id: "s1",
          name: "Салат з свіжих овочів",
          description: "Помідори, огірки, капуста з олією",
          price: 20,
          allergens: [],
          category: "side"
        }
      ]
    },
    {
      date: "2024-01-16",
      dayName: "Вівторок",
      meal1Options: [
        {
          id: "m1_3",
          name: "Солянка м'ясна",
          description: "Наваристий суп з ковбасою, оливками та солоними огірками",
          price: 50,
          allergens: [],
          category: "meal1"
        },
        {
          id: "m1_4",
          name: "Суп овочевий з квасолею",
          description: "Легкий овочевий суп з білою квасолею та зеленню",
          price: 35,
          allergens: [],
          category: "meal1"
        }
      ],
      meal2Options: [
        {
          id: "m2_3",
          name: "Голубці з м'ясом",
          description: "Капустяні листя, фаршировані м'ясом та рисом",
          price: 60,
          allergens: [],
          category: "meal2"
        },
        {
          id: "m2_4",
          name: "Каша гречана з грибами",
          description: "Розсипчаста гречка з тушкованими грибами та цибулею",
          price: 45,
          allergens: [],
          category: "meal2"
        }
      ],
      sideOptions: [
        {
          id: "s2",
          name: "Винегрет",
          description: "Класичний салат з буряка, картоплі та солоних огірків",
          price: 25,
          allergens: [],
          category: "side"
        }
      ]
    },
    {
      date: "2024-01-17",
      dayName: "Середа",
      meal1Options: [
        {
          id: "m1_5",
          name: "Суп курячий з локшиною",
          description: "Ароматний курячий бульйон з домашньою локшиною",
          price: 45,
          allergens: ["Глютен", "Яйця"],
          category: "meal1"
        },
        {
          id: "m1_6",
          name: "Крем-суп з броколі",
          description: "Вітамінний суп-пюре з броколі та сиром",
          price: 40,
          allergens: ["Молочні продукти"],
          category: "meal1"
        }
      ],
      meal2Options: [
        {
          id: "m2_5",
          name: "Рибні котлети з овочами",
          description: "Котлети з морської риби з тушкованими овочами",
          price: 65,
          allergens: ["Риба", "Яйця"],
          category: "meal2"
        },
        {
          id: "m2_6",
          name: "Макарони з сиром",
          description: "Варені макарони під сирним соусом",
          price: 40,
          allergens: ["Глютен", "Молочні продукти"],
          category: "meal2"
        }
      ],
      sideOptions: [
        {
          id: "s3",
          name: "Компот з сухофруктів",
          description: "Традиційний компот з яблук, груш та чорносливу",
          price: 15,
          allergens: [],
          category: "side"
        }
      ]
    },
    {
      date: "2024-01-18",
      dayName: "Четвер",
      meal1Options: [
        {
          id: "m1_7",
          name: "Борщ зелений зі щавлем",
          description: "Весняний суп зі щавлем, яйцем та сметаною",
          price: 40,
          allergens: ["Яйця", "Молочні продукти"],
          category: "meal1"
        },
        {
          id: "m1_8",
          name: "Суп з фрикадельками",
          description: "М'ясні фрикадельки в овочевому бульйоні",
          price: 45,
          allergens: ["Яйця"],
          category: "meal1"
        }
      ],
      meal2Options: [
        {
          id: "m2_7",
          name: "Печеня яловича з картоплею",
          description: "Тушкована яловичина з молодою картоплею",
          price: 70,
          allergens: [],
          category: "meal2"
        },
        {
          id: "m2_8",
          name: "Сирники з варенням",
          description: "Ніжні сирники з домашнім варенням",
          price: 45,
          allergens: ["Молочні продукти", "Яйця", "Глютен"],
          category: "meal2"
        }
      ],
      sideOptions: [
        {
          id: "s4",
          name: "Кисіль ягідний",
          description: "Густий кисіль з лісових ягід",
          price: 18,
          allergens: [],
          category: "side"
        }
      ]
    },
    {
      date: "2024-01-19",
      dayName: "П'ятниця",
      meal1Options: [
        {
          id: "m1_9",
          name: "Суп гороховий з копченостями",
          description: "Ситний гороховий суп з копченими ребрами",
          price: 50,
          allergens: [],
          category: "meal1"
        },
        {
          id: "m1_10",
          name: "Суп молочний з вермішеллю",
          description: "Солодкий молочний суп з тонкою вермішеллю",
          price: 35,
          allergens: ["Молочні продукти", "Глютен"],
          category: "meal1"
        }
      ],
      meal2Options: [
        {
          id: "m2_9",
          name: "Вареники з картоплею",
          description: "Домашні вареники з картопляною начинкою та сметаною",
          price: 50,
          allergens: ["Глютен", "Яйця", "Молочні продукти"],
          category: "meal2"
        },
        {
          id: "m2_10",
          name: "Каша вівсяна з фруктами",
          description: "Корисна вівсянка з яблуками та родзинками",
          price: 35,
          allergens: ["Глютен"],
          category: "meal2"
        }
      ],
      sideOptions: [
        {
          id: "s5",
          name: "Йогурт натуральний",
          description: "Домашній йогурт з живими бактеріями",
          price: 25,
          allergens: ["Молочні продукти"],
          category: "side"
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
  "Морепродукти",
  "Соя",
  "Кунжут"
];