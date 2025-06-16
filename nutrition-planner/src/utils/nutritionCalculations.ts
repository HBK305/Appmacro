export const calculateCalories = (weight: number, height: number, age: number, gender: 'male' | 'female', activityLevel: number): number => {
  // Validate inputs
  if (!weight || !height || !age || !gender || !activityLevel) {
    throw new Error('Missing required parameters for calorie calculation');
  }

  if (isNaN(weight) || isNaN(height) || isNaN(age) || isNaN(activityLevel)) {
    throw new Error('Invalid numeric parameters for calorie calculation');
  }

  // Mifflin-St Jeor Equation for BMR
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  bmr = gender === 'male' ? bmr + 5 : bmr - 161;

  // Validate BMR result
  if (isNaN(bmr) || bmr <= 0) {
    throw new Error('Invalid BMR calculation result');
  }

  // Adjust for activity level
  const activityMultipliers = {
    1.2: 'Sedentary',
    1.375: 'Lightly active',
    1.55: 'Moderately active',
    1.725: 'Very active',
    1.9: 'Extra active',
  };

  if (!Object.keys(activityMultipliers).includes(activityLevel.toString())) {
    throw new Error('Invalid activity level');
  }

  const multiplier = activityLevel;
  const result = Math.round(bmr * multiplier);

  // Validate final result
  if (isNaN(result) || result <= 0) {
    throw new Error('Invalid calorie calculation result');
  }

  return result;
};

export interface MacroDistribution {
  protein: number;
  carbs: number;
  fats: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatsPercentage: number;
}

export const calculateMacros = (
  calories: number,
  weight: number,
  goal: 'muscle_gain' | 'fat_loss' | 'maintenance',
  activityLevel: number
): MacroDistribution => {
  // Validate inputs
  if (!calories || !weight || !goal || !activityLevel) {
    throw new Error('Missing required parameters for macro calculation');
  }

  if (isNaN(calories) || isNaN(weight) || isNaN(activityLevel)) {
    throw new Error('Invalid numeric parameters for macro calculation');
  }

  if (calories <= 0 || weight <= 0) {
    throw new Error('Calories and weight must be positive numbers');
  }

  // Base protein calculation (grams per kg of bodyweight)
  let proteinMultiplier: number;
  switch (goal) {
    case 'muscle_gain':
      proteinMultiplier = 2.2; // Higher protein for muscle building
      break;
    case 'fat_loss':
      proteinMultiplier = 2.0; // High protein to preserve muscle
      break;
    default: // maintenance
      proteinMultiplier = 1.6;
  }

  const proteinGrams = Math.round(weight * proteinMultiplier);
  const proteinCalories = proteinGrams * 4; // 4 calories per gram of protein

  // Calculate remaining calories for carbs and fats
  const remainingCalories = calories - proteinCalories;

  if (remainingCalories <= 0) {
    throw new Error('Invalid calorie distribution for macros');
  }

  // Fat calculation (percentage of remaining calories)
  let fatPercentage: number;
  switch (goal) {
    case 'muscle_gain':
      fatPercentage = 0.25; // 25% of remaining calories
      break;
    case 'fat_loss':
      fatPercentage = 0.35; // 35% of remaining calories
      break;
    default: // maintenance
      fatPercentage = 0.30; // 30% of remaining calories
  }

  const fatCalories = Math.round(remainingCalories * fatPercentage);
  const fatGrams = Math.round(fatCalories / 9); // 9 calories per gram of fat

  // Remaining calories go to carbs
  const carbCalories = remainingCalories - fatCalories;
  const carbGrams = Math.round(carbCalories / 4); // 4 calories per gram of carbs

  const result = {
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
    proteinPercentage: Math.round((proteinCalories / calories) * 100),
    carbsPercentage: Math.round((carbCalories / calories) * 100),
    fatsPercentage: Math.round((fatCalories / calories) * 100),
  };

  // Validate result
  if (isNaN(result.protein) || isNaN(result.carbs) || isNaN(result.fats) ||
      isNaN(result.proteinPercentage) || isNaN(result.carbsPercentage) || isNaN(result.fatsPercentage)) {
    throw new Error('Invalid macro calculation result');
  }

  return result;
};

export interface MealTiming {
  meals: Array<{
    name: string;
    time: string;
    description: string;
  }>;
}

export function calculateMealTiming(
  totalCalories: number,
  macros: MacroDistribution,
  trainingSchedule: {
    days: string[];
    time: string;
  },
  wakeTime: string,
  sleepTime: string
): MealTiming[] {
  // Convert times to minutes for easier calculation
  const wakeMinutes = timeToMinutes(wakeTime);
  const sleepMinutes = timeToMinutes(sleepTime);
  const trainingMinutes = timeToMinutes(trainingSchedule.time);

  // Calculate total awake time in minutes
  let totalAwakeMinutes = sleepMinutes - wakeMinutes;
  if (totalAwakeMinutes < 0) {
    totalAwakeMinutes += 24 * 60; // Add 24 hours if sleep time is next day
  }

  // Determine number of meals based on awake time
  const mealCount = Math.min(6, Math.max(4, Math.floor(totalAwakeMinutes / 180))); // 3-6 hours between meals

  // Calculate calories per meal
  const caloriesPerMeal = Math.floor(totalCalories / mealCount);

  // Create meal timing array
  const meals: MealTiming[] = [];
  const mealInterval = Math.floor(totalAwakeMinutes / (mealCount - 1));

  // Helper function to format time
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Calculate meal times and distributions
  for (let i = 0; i < mealCount; i++) {
    const mealTime = (wakeMinutes + i * mealInterval) % (24 * 60);
    const isTrainingDay = trainingSchedule.days.includes(getDayOfWeek(new Date()));
    const isPreWorkout = isTrainingDay && Math.abs(mealTime - trainingMinutes) <= 60;
    const isPostWorkout = isTrainingDay && Math.abs(mealTime - trainingMinutes) <= 120 && mealTime > trainingMinutes;

    let mealName = `Meal ${i + 1}`;
    let description = '';
    let mealMacros = {
      protein: Math.round(macros.protein / mealCount),
      carbs: Math.round(macros.carbs / mealCount),
      fats: Math.round(macros.fats / mealCount)
    };

    // Adjust meal timing and macros based on training
    if (isPreWorkout) {
      mealName = 'Pre-Workout Meal';
      description = 'Focus on easily digestible carbs and moderate protein';
      mealMacros = {
        protein: Math.round(macros.protein * 0.3),
        carbs: Math.round(macros.carbs * 0.4),
        fats: Math.round(macros.fats * 0.2)
      };
    } else if (isPostWorkout) {
      mealName = 'Post-Workout Meal';
      description = 'Higher protein and carbs to support recovery';
      mealMacros = {
        protein: Math.round(macros.protein * 0.4),
        carbs: Math.round(macros.carbs * 0.4),
        fats: Math.round(macros.fats * 0.2)
      };
    } else if (i === 0) {
      mealName = 'Breakfast';
      description = 'Balanced meal to start the day';
    } else if (i === mealCount - 1) {
      mealName = 'Dinner';
      description = 'Complete meal with all macronutrients';
    }

    meals.push({
      meals: [
        {
          name: mealName,
          time: formatTime(mealTime),
          description
        }
      ]
    });
  }

  return meals;
}

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to get day of week
function getDayOfWeek(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
} 