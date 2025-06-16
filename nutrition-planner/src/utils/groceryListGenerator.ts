import { type MealRecommendation } from './foodRecommendations';

interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
}

export interface GroceryList {
  items: GroceryItem[];
  totalItems: number;
  categories: string[];
}

export function generateGroceryList(mealPlan: MealRecommendation[]): GroceryList {
  const itemMap = new Map<string, GroceryItem>();
  const categories = new Set<string>();

  // Process each meal in the plan
  mealPlan.forEach(meal => {
    meal.foods.forEach(({ food, servings }) => {
      const key = `${food.name}-${food.servingUnit}`;
      const existingItem = itemMap.get(key);

      if (existingItem) {
        existingItem.quantity += servings;
      } else {
        itemMap.set(key, {
          name: food.name,
          quantity: servings,
          unit: food.servingUnit,
          category: food.category
        });
        categories.add(food.category);
      }
    });
  });

  // Convert map to array and sort by category
  const items = Array.from(itemMap.values()).sort((a, b) => {
    if (a.category === b.category) {
      return a.name.localeCompare(b.name);
    }
    return a.category.localeCompare(b.category);
  });

  return {
    items,
    totalItems: items.length,
    categories: Array.from(categories).sort()
  };
}

export function formatGroceryList(list: GroceryList): string {
  let output = 'Grocery List\n\n';

  list.categories.forEach(category => {
    output += `${category.toUpperCase()}\n`;
    output += '─'.repeat(category.length) + '\n';
    
    list.items
      .filter(item => item.category === category)
      .forEach(item => {
        output += `• ${item.name}: ${item.quantity} ${item.unit}\n`;
      });
    
    output += '\n';
  });

  output += `Total Items: ${list.totalItems}\n`;
  return output;
} 