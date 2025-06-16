import { MacroDistribution } from './nutritionCalculations';

export interface Food {
  id: string;
  name: string;
  category: 'protein' | 'carb' | 'fat' | 'vegetable' | 'fruit';
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  servingSize: number;
  servingUnit: string;
  commonMeal: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
  dietaryTags: string[];
}

// Database of common foods
const foodDatabase: Food[] = [
  // Proteins
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    category: 'protein',
    calories: 165,
    macros: { protein: 31, carbs: 0, fats: 3.6 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'lunch',
    dietaryTags: ['high-protein', 'low-fat']
  },
  {
    id: 'salmon',
    name: 'Salmon',
    category: 'protein',
    calories: 208,
    macros: { protein: 22, carbs: 0, fats: 13 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'dinner',
    dietaryTags: ['high-protein', 'omega-3']
  },
  {
    id: 'greek-yogurt',
    name: 'Greek Yogurt',
    category: 'protein',
    calories: 130,
    macros: { protein: 17, carbs: 9, fats: 0.7 },
    servingSize: 170,
    servingUnit: 'g',
    commonMeal: 'breakfast',
    dietaryTags: ['high-protein', 'low-fat', 'dairy']
  },

  // Carbs
  {
    id: 'brown-rice',
    name: 'Brown Rice',
    category: 'carb',
    calories: 216,
    macros: { protein: 4.5, carbs: 45, fats: 1.8 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'lunch',
    dietaryTags: ['whole-grain', 'gluten-free']
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potato',
    category: 'carb',
    calories: 86,
    macros: { protein: 1.6, carbs: 20, fats: 0.1 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'lunch',
    dietaryTags: ['gluten-free', 'vegan']
  },
  {
    id: 'oats',
    name: 'Oats',
    category: 'carb',
    calories: 389,
    macros: { protein: 16.9, carbs: 66, fats: 6.9 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'breakfast',
    dietaryTags: ['whole-grain', 'gluten-free']
  },

  // Fats
  {
    id: 'avocado',
    name: 'Avocado',
    category: 'fat',
    calories: 160,
    macros: { protein: 2, carbs: 8.5, fats: 14.7 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'lunch',
    dietaryTags: ['vegan', 'gluten-free']
  },
  {
    id: 'almonds',
    name: 'Almonds',
    category: 'fat',
    calories: 579,
    macros: { protein: 21.2, carbs: 21.7, fats: 49.9 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'snack',
    dietaryTags: ['vegan', 'gluten-free']
  },

  // Vegetables
  {
    id: 'broccoli',
    name: 'Broccoli',
    category: 'vegetable',
    calories: 34,
    macros: { protein: 2.8, carbs: 6.6, fats: 0.4 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'lunch',
    dietaryTags: ['vegan', 'gluten-free', 'low-calorie']
  },
  {
    id: 'spinach',
    name: 'Spinach',
    category: 'vegetable',
    calories: 23,
    macros: { protein: 2.9, carbs: 3.6, fats: 0.4 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'lunch',
    dietaryTags: ['vegan', 'gluten-free', 'low-calorie']
  },

  // Fruits
  {
    id: 'banana',
    name: 'Banana',
    category: 'fruit',
    calories: 89,
    macros: { protein: 1.1, carbs: 22.8, fats: 0.3 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'snack',
    dietaryTags: ['vegan', 'gluten-free']
  },
  {
    id: 'apple',
    name: 'Apple',
    category: 'fruit',
    calories: 52,
    macros: { protein: 0.3, carbs: 13.8, fats: 0.2 },
    servingSize: 100,
    servingUnit: 'g',
    commonMeal: 'snack',
    dietaryTags: ['vegan', 'gluten-free']
  }
];

export interface MealRecommendation {
  foods: {
    food: Food;
    servings: number;
  }[];
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function generateMealRecommendation(
  targetCalories: number,
  targetMacros: MacroDistribution,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout',
  dietaryRestrictions: string[] = []
): MealRecommendation {
  // Filter foods based on meal type and dietary restrictions
  const availableFoods = foodDatabase.filter(food => {
    const matchesMeal = food.commonMeal === mealType;
    const matchesDietary = dietaryRestrictions.every(restriction => 
      food.dietaryTags.includes(restriction)
    );
    return matchesMeal && matchesDietary;
  });

  // Group foods by category
  const proteins = availableFoods.filter(f => f.category === 'protein');
  const carbs = availableFoods.filter(f => f.category === 'carb');
  const fats = availableFoods.filter(f => f.category === 'fat');
  const vegetables = availableFoods.filter(f => f.category === 'vegetable');
  const fruits = availableFoods.filter(f => f.category === 'fruit');

  // Calculate target macros for this meal
  const mealMacros = {
    protein: Math.round(targetMacros.protein),
    carbs: Math.round(targetMacros.carbs),
    fats: Math.round(targetMacros.fats)
  };

  const selectedFoods: { food: Food; servings: number }[] = [];
  let currentCalories = 0;
  let currentMacros = { protein: 0, carbs: 0, fats: 0 };

  // Helper function to add food to the meal
  const addFood = (food: Food, servings: number) => {
    selectedFoods.push({ food, servings });
    currentCalories += food.calories * servings;
    currentMacros.protein += food.macros.protein * servings;
    currentMacros.carbs += food.macros.carbs * servings;
    currentMacros.fats += food.macros.fats * servings;
  };

  // Add protein source
  if (proteins.length > 0) {
    const protein = proteins[Math.floor(Math.random() * proteins.length)];
    const servings = Math.min(2, mealMacros.protein / protein.macros.protein);
    addFood(protein, servings);
  }

  // Add carb source
  if (carbs.length > 0) {
    const carb = carbs[Math.floor(Math.random() * carbs.length)];
    const servings = Math.min(2, mealMacros.carbs / carb.macros.carbs);
    addFood(carb, servings);
  }

  // Add fat source
  if (fats.length > 0) {
    const fat = fats[Math.floor(Math.random() * fats.length)];
    const servings = Math.min(1, mealMacros.fats / fat.macros.fats);
    addFood(fat, servings);
  }

  // Add vegetables
  if (vegetables.length > 0) {
    const vegetable = vegetables[Math.floor(Math.random() * vegetables.length)];
    addFood(vegetable, 1);
  }

  // Add fruit for breakfast or snack
  if ((mealType === 'breakfast' || mealType === 'snack') && fruits.length > 0) {
    const fruit = fruits[Math.floor(Math.random() * fruits.length)];
    addFood(fruit, 1);
  }

  return {
    foods: selectedFoods,
    totalCalories: Math.round(currentCalories),
    totalMacros: {
      protein: Math.round(currentMacros.protein),
      carbs: Math.round(currentMacros.carbs),
      fats: Math.round(currentMacros.fats)
    }
  };
}

export function generateDailyMealPlan(
  totalCalories: number,
  totalMacros: MacroDistribution,
  mealCount: number,
  dietaryRestrictions: string[] = []
): MealRecommendation[] {
  const mealTypes: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealPlan: MealRecommendation[] = [];

  // Distribute calories and macros across meals
  const caloriesPerMeal = Math.floor(totalCalories / mealCount);
  const macrosPerMeal = {
    protein: Math.floor(totalMacros.protein / mealCount),
    carbs: Math.floor(totalMacros.carbs / mealCount),
    fats: Math.floor(totalMacros.fats / mealCount)
  };

  // Generate recommendations for each meal
  for (let i = 0; i < mealCount; i++) {
    const mealType = mealTypes[i % mealTypes.length];
    const recommendation = generateMealRecommendation(
      caloriesPerMeal,
      { ...totalMacros, ...macrosPerMeal },
      mealType,
      dietaryRestrictions
    );
    mealPlan.push(recommendation);
  }

  return mealPlan;
} 