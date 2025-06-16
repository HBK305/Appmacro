import { type MealRecommendation } from './foodRecommendations';

export interface DailyProgress {
  date: string;
  weight: number;
  caloriesConsumed: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  waterIntake: number;
  mealsCompleted: number;
  notes?: string;
}

interface ProgressStats {
  startWeight: number;
  currentWeight: number;
  weightChange: number;
  averageCalories: number;
  averageMacros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  averageWaterIntake: number;
  mealCompletionRate: number;
  streakDays: number;
}

export function calculateProgressStats(progressData: DailyProgress[]): ProgressStats {
  if (progressData.length === 0) {
    throw new Error('No progress data available');
  }

  const startWeight = progressData[0].weight;
  const currentWeight = progressData[progressData.length - 1].weight;
  
  const totalCalories = progressData.reduce((sum, day) => sum + day.caloriesConsumed, 0);
  const totalProtein = progressData.reduce((sum, day) => sum + day.macros.protein, 0);
  const totalCarbs = progressData.reduce((sum, day) => sum + day.macros.carbs, 0);
  const totalFats = progressData.reduce((sum, day) => sum + day.macros.fats, 0);
  const totalWater = progressData.reduce((sum, day) => sum + day.waterIntake, 0);
  const totalMeals = progressData.reduce((sum, day) => sum + day.mealsCompleted, 0);
  
  const days = progressData.length;
  const targetMeals = days * 5; // Assuming 5 meals per day target

  // Calculate streak
  let streakDays = 0;
  const today = new Date().toISOString().split('T')[0];
  const lastEntry = progressData[progressData.length - 1].date;
  
  if (lastEntry === today) {
    streakDays = 1;
    for (let i = progressData.length - 2; i >= 0; i--) {
      const currentDate = new Date(progressData[i].date);
      const nextDate = new Date(progressData[i + 1].date);
      const diffDays = Math.floor((nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streakDays++;
      } else {
        break;
      }
    }
  }

  return {
    startWeight,
    currentWeight,
    weightChange: currentWeight - startWeight,
    averageCalories: Math.round(totalCalories / days),
    averageMacros: {
      protein: Math.round(totalProtein / days),
      carbs: Math.round(totalCarbs / days),
      fats: Math.round(totalFats / days)
    },
    averageWaterIntake: Math.round(totalWater / days),
    mealCompletionRate: Math.round((totalMeals / targetMeals) * 100),
    streakDays
  };
}

export function formatProgressStats(stats: ProgressStats): string {
  const weightChangeText = stats.weightChange > 0 
    ? `+${stats.weightChange.toFixed(1)}kg` 
    : `${stats.weightChange.toFixed(1)}kg`;

  return `
Progress Summary
───────────────
Weight: ${stats.currentWeight}kg (${weightChangeText})
Average Daily Calories: ${stats.averageCalories}
Average Macros:
  • Protein: ${stats.averageMacros.protein}g
  • Carbs: ${stats.averageMacros.carbs}g
  • Fats: ${stats.averageMacros.fats}g
Average Water Intake: ${stats.averageWaterIntake}L
Meal Completion Rate: ${stats.mealCompletionRate}%
Current Streak: ${stats.streakDays} days
`;
}

export function validateProgressEntry(entry: Partial<DailyProgress>): string[] {
  const errors: string[] = [];

  if (!entry.date) errors.push('Date is required');
  if (entry.weight === undefined) errors.push('Weight is required');
  if (entry.caloriesConsumed === undefined) errors.push('Calories consumed is required');
  if (!entry.macros) errors.push('Macro nutrients are required');
  if (entry.waterIntake === undefined) errors.push('Water intake is required');
  if (entry.mealsCompleted === undefined) errors.push('Number of meals completed is required');

  if (entry.macros) {
    if (entry.macros.protein === undefined) errors.push('Protein intake is required');
    if (entry.macros.carbs === undefined) errors.push('Carbs intake is required');
    if (entry.macros.fats === undefined) errors.push('Fats intake is required');
  }

  return errors;
} 