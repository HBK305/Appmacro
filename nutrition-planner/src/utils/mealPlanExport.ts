import { type MealRecommendation } from './foodRecommendations';
import { type MealTiming } from './nutritionCalculations';

interface ExportOptions {
  includeMacros: boolean;
  includeCalories: boolean;
  includeNotes: boolean;
}

export function exportToText(
  mealPlan: MealRecommendation[],
  mealTiming: MealTiming[],
  options: ExportOptions = { includeMacros: true, includeCalories: true, includeNotes: true }
): string {
  let output = 'Meal Plan\n';
  output += '─'.repeat(50) + '\n\n';

  mealPlan.forEach((meal, index) => {
    const timing = mealTiming[index];
    output += `${timing?.meals[0]?.name || `Meal ${index + 1}`} (${timing?.meals[0]?.time})\n`;
    output += '─'.repeat(30) + '\n';

    // Food items
    meal.foods.forEach(({ food, servings }) => {
      output += `• ${food.name}: ${servings} ${food.servingUnit}\n`;
    });

    // Nutrition information
    if (options.includeCalories || options.includeMacros) {
      output += '\nNutrition:\n';
      if (options.includeCalories) {
        output += `• Calories: ${meal.totalCalories}\n`;
      }
      if (options.includeMacros) {
        output += `• Protein: ${meal.totalMacros.protein}g\n`;
        output += `• Carbs: ${meal.totalMacros.carbs}g\n`;
        output += `• Fats: ${meal.totalMacros.fats}g\n`;
      }
    }

    // Notes
    if (options.includeNotes && timing?.meals[0]?.description) {
      output += `\nNotes: ${timing.meals[0].description}\n`;
    }

    output += '\n';
  });

  return output;
}

export function exportToCSV(
  mealPlan: MealRecommendation[],
  mealTiming: MealTiming[]
): string {
  const headers = [
    'Meal',
    'Time',
    'Food Item',
    'Servings',
    'Unit',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Fats (g)',
    'Notes'
  ].join(',');

  const rows = mealPlan.flatMap((meal, index) => {
    const timing = mealTiming[index];
    return meal.foods.map(({ food, servings }) => [
      timing?.meals[0]?.name || `Meal ${index + 1}`,
      timing?.meals[0]?.time || '',
      food.name,
      servings,
      food.servingUnit,
      food.calories * servings,
      food.macros.protein * servings,
      food.macros.carbs * servings,
      food.macros.fats * servings,
      timing?.meals[0]?.description || ''
    ].join(','));
  });

  return [headers, ...rows].join('\n');
}

export function exportToJSON(
  mealPlan: MealRecommendation[],
  mealTiming: MealTiming[]
): string {
  const data = mealPlan.map((meal, index) => {
    const timing = mealTiming[index];
    return {
      mealName: timing?.meals[0]?.name || `Meal ${index + 1}`,
      time: timing?.meals[0]?.time,
      foods: meal.foods.map(({ food, servings }) => ({
        name: food.name,
        servings,
        unit: food.servingUnit,
        calories: food.calories * servings,
        macros: {
          protein: food.macros.protein * servings,
          carbs: food.macros.carbs * servings,
          fats: food.macros.fats * servings
        }
      })),
      totalCalories: meal.totalCalories,
      totalMacros: meal.totalMacros,
      notes: timing?.meals[0]?.description
    };
  });

  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 